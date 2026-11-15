"""Summarize actual CI reports; missing checks and skipped tests fail the gate."""
import argparse
import json
import os
from pathlib import Path


def summarize(directory):
    results = []
    def read(name):
        path = directory / name
        if not path.is_file():
            results.append({'check': name, 'passed': False, 'detail': 'Not completed'})
            return None
        return json.loads(path.read_text())
    for name in ['npm-audit.json', 'build-tools-audit.json']:
        data = read(name)
        if data is not None:
            total = data.get('metadata', {}).get('vulnerabilities', {}).get('total')
            packages = ', '.join(sorted(data.get('vulnerabilities', {})))
            detail = f'{total} known vulnerabilities' + (f': {packages}' if packages else '')
            results.append({'check': name, 'passed': total == 0 and 'error' not in data, 'detail': detail})
    for name in ['api-audit.json', 'bundle-audit.json']:
        data = read(name)
        if data is not None:
            dependencies = data.get('dependencies', [])
            count = sum(len(row.get('vulns', [])) for row in dependencies)
            skipped = sum('skip_reason' in row for row in dependencies)
            affected = ', '.join(f"{row['name']}: {','.join(vulnerability['id'] for vulnerability in row.get('vulns', []))}" for row in dependencies if row.get('vulns'))
            detail = f'{len(dependencies)} packages, {count} advisories, {skipped} skipped' + (f': {affected}' if affected else '')
            results.append({'check': name, 'passed': bool(dependencies) and count == skipped == 0, 'detail': detail})
    data = read('unit-tests.json')
    if data is not None:
        passed = data.get('numPassedTests', 0)
        results.append({'check': 'Unit tests', 'passed': passed > 0 and data.get('success') is True and data.get('numFailedTests') == data.get('numPendingTests') == data.get('numTodoTests', 0) == 0, 'detail': f'{passed} passed'})
    for name, label in [('api-tests.json', 'API tests'), ('guard-tests.json', 'CI guard tests')]:
        data = read(name)
        if data is not None:
            passed = data.get('passed', 0)
            results.append({'check': label, 'passed': passed > 0 and data.get('failures') == data.get('errors') == data.get('skipped') == 0, 'detail': f'{passed} passed'})
    data = read('browser-tests.json')
    if data is not None:
        stats = data.get('stats', {})
        passed = stats.get('expected', 0)
        results.append({'check': 'Browser tests', 'passed': passed > 0 and stats.get('unexpected') == stats.get('skipped') == stats.get('flaky') == 0, 'detail': f'{passed} passed, no skips/retries/flaky cases'})
    data = read('frozen-models.json')
    if data is not None:
        results.append({'check': 'Frozen model reproduction', 'passed': len(data.get('artifacts', {})) == 2, 'detail': 'Both reviewed artifact SHA-256 checks passed'})
    data = read('package-check.json')
    if data is not None:
        results.append({'check': 'Materialized function and budgets', 'passed': data.get('ready') is True and data.get('prediction') == 20155.0 and data.get('private_artifact_routes_status') == 404, 'detail': f"{data.get('function_uncompressed_bytes')} function bytes, {data.get('public_bytes')} public bytes"})
    data = read('workflow-lint.json')
    if data is not None:
        results.append({'check': 'Workflow and bash syntax', 'passed': data.get('passed') is True, 'detail': f"actionlint {data.get('actionlint_version')}"})
    data = read('firewall-policy.json')
    if data is not None:
        results.append({'check': 'Local firewall policy', 'passed': data.get('valid_local_policy') is True and data.get('remote_applied') is False, 'detail': 'Local policy only; not applied or enforced on Vercel'})
    passed = all(row['passed'] for row in results)
    result = {'passed': passed, 'checks': results, 'execution_context': 'github-actions' if os.environ.get('GITHUB_ACTIONS') == 'true' else 'local', 'scope': 'Checks on the current runner only; no deployment, Vercel quotas or firewall enforcement verified.'}
    directory.mkdir(parents=True, exist_ok=True)
    (directory / 'summary.json').write_text(json.dumps(result, indent=2) + '\n')
    markdown = ['## Paddock CI', '', '| Check | Result | Detail |', '| --- | --- | --- |']
    escape = lambda text: str(text).replace('|', '\\|').replace('\n', ' ').replace('<', '&lt;').replace('>', '&gt;')
    markdown += [f"| {escape(row['check'])} | {'PASS' if row['passed'] else 'FAIL'} | {escape(row['detail'])} |" for row in results]
    markdown += ['', 'No deployment or provider credentials are used by this workflow.', '']
    text = '\n'.join(markdown)
    (directory / 'summary.md').write_text(text)
    if os.environ.get('GITHUB_STEP_SUMMARY'):
        with Path(os.environ['GITHUB_STEP_SUMMARY']).open('a') as stream:
            stream.write(text)
    print(text)
    return passed


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--reports', type=Path, required=True)
    raise SystemExit(0 if summarize(parser.parse_args().reports.resolve()) else 1)
