"""Validate the local Hobby firewall proposal and print the review command only.

Never invokes Vercel or edits a remote draft. Printing is not applying a rule.
"""
import argparse
import json
from pathlib import Path
import re
import shlex

ROOT = Path(__file__).resolve().parents[1]
API_PATHS = ['/api', '/api/', '/api/index.py', '/api/v1/predict', '/api/v1/message', '/api/v1/cars', '/api/v1/health', '/api/v1/catalog', '/api/v1/search-catalog']
STATIC_PATHS = ['/', '/assets/index-example.js', '/assets/index-example.css', '/robots.txt', '/favicon.ico']


def inspect(path):
    policy = json.loads(path.read_text())
    if policy.get('schema_version') != 1 or policy.get('scope') != 'project' or not re.fullmatch(r'[a-z0-9][a-z0-9-]{0,99}', policy.get('project', '')):
        raise ValueError('The proposal must target a single named project')
    if policy.get('team') != 'legodarks-projects':
        raise ValueError('Review the target account before changing the verified Hobby team')
    if policy.get('condition') != {'type': 'path', 'op': 'pre', 'value': '/api'}:
        raise ValueError('Protect all API aliases, including /api/index.py')
    if policy.get('action') != 'rate_limit' or policy.get('algorithm') != 'fixed_window' or policy.get('keys') != ['ip'] or policy.get('excess_action') != 'rate_limit':
        raise ValueError('Use Hobby fixed-window IP counting and HTTP 429')
    if type(policy.get('window_seconds')) is not int or not 10 <= policy['window_seconds'] <= 600 or type(policy.get('requests')) is not int or not 1 <= policy['requests'] <= 10000000:
        raise ValueError('Invalid Hobby rule limits')
    prefix = policy['condition']['value']
    if not all(path.startswith(prefix) for path in API_PATHS) or any(path.startswith(prefix) for path in STATIC_PATHS):
        raise ValueError('Unexpected API/static path coverage')
    arguments = ['vercel', 'firewall', 'rules', 'add', policy['name'], '--scope', policy['team'], '--project', policy['project'], '--condition', json.dumps(policy['condition'], separators=(',', ':')), '--action', 'rate_limit', '--rate-limit-algo', policy['algorithm'], '--rate-limit-requests', str(policy['requests']), '--rate-limit-window', str(policy['window_seconds']), '--rate-limit-keys', 'ip', '--rate-limit-action', 'rate_limit']
    return {'valid_local_policy': True, 'remote_applied': False, 'scope': 'Local policy shape and path coverage only; no rate counter or Vercel account enforcement tested.', 'api_paths_covered': API_PATHS, 'static_paths_excluded': STATIC_PATHS, 'review_command': shlex.join(arguments), 'notice': 'Do not run until the correct project exists and the Hobby/pricing dialog is reviewed. This command stages a remote draft; publishing it is a separate action.'}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--policy', type=Path, default=ROOT / 'security/vercel-firewall.json')
    parser.add_argument('--report', type=Path)
    arguments = parser.parse_args()
    result = inspect(arguments.policy)
    text = json.dumps(result, ensure_ascii=False, indent=2) + '\n'
    if arguments.report:
        arguments.report.parent.mkdir(parents=True, exist_ok=True)
        arguments.report.write_text(text)
    print(text)
