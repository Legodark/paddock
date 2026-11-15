"""Summarize actual CI reports; missing checks and skipped tests fail the gate."""
import argparse
import json
import os
from pathlib import Path
import re


def error_excerpt(value):
    text = value.get('message', '') if isinstance(value, dict) else str(value)
    text = re.sub(r'\x1b\[[0-?]*[ -/]*[@-~]', '', text)
    important = [line for line in text.splitlines() if re.search(r'FATAL:|No usable sandbox|SUID sandbox|AppArmor|Operation not permitted|error while loading shared libraries', line, re.I)]
    if important:
        return (text.splitlines()[0] + '\n' + '\n'.join(important[:4]))[:1800]
    return text if len(text) <= 1800 else text.splitlines()[0] + '\n…\n' + text[-1600:]


def browser_error(data):
    failures = [error_excerpt(error) for error in data.get('errors', [])]
    def visit(suites):
        for suite in suites:
            for spec in suite.get('specs', []):
                for test in spec.get('tests', []):
                    for result in test.get('results', []):
                        if result.get('error'):
                            project = test.get('projectName', test.get('projectId', 'unknown project'))
                            failures.append(f"[{project}] {spec.get('title', 'Browser case')}: " + error_excerpt(result['error']))
            visit(suite.get('suites', []))
    visit(data.get('suites', []))
    return '\n'.join(failures[:8])


def summarize(directory):
    results = []
    profiles = {}
    def read(name):
        path = directory / name
        if not path.is_file():
            results.append({'check': name, 'passed': False, 'detail': 'Not completed'})
            return None
        try:
            data = json.loads(path.read_text())
            if not isinstance(data, dict):
                raise ValueError('Expected a report object')
            return data
        except (ValueError, OSError):
            results.append({'check': name, 'passed': False, 'detail': 'Invalid or incomplete JSON report'})
            return None
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
        def browser_profiles(suites):
            for suite in suites:
                for spec in suite.get('specs', []):
                    for test in spec.get('tests', []):
                        name = test.get('projectName', test.get('projectId', 'unknown'))
                        profile = profiles.setdefault(name, {'project': name, 'version': None, 'passed': 0, 'failed': 0, 'skipped': 0})
                        for annotation in test.get('annotations', []):
                            if annotation.get('type') == 'browser-version':
                                profile['version'] = annotation.get('description')
                        status = (test.get('results') or [{}])[-1].get('status')
                        if status == 'passed':
                            profile['passed'] += 1
                        elif status == 'skipped':
                            profile['skipped'] += 1
                        else:
                            profile['failed'] += 1
                browser_profiles(suite.get('suites', []))
        browser_profiles(data.get('suites', []))
        stats = data.get('stats', {})
        passed = stats.get('expected', 0)
        successful = passed > 0 and stats.get('unexpected') == stats.get('skipped') == stats.get('flaky') == 0 and not data.get('errors')
        detail = f"{passed} passed, {stats.get('unexpected', 0)} failed, {stats.get('skipped', 0)} skipped, {stats.get('flaky', 0)} flaky"
        if not successful:
            reason = browser_error(data)
            if reason:
                detail += ': ' + reason
            native_log = directory / 'browser-stderr.log'
            if native_log.is_file():
                lines = native_log.read_text(errors='replace').splitlines()
                native = [re.sub(r'\x1b\[[0-?]*[ -/]*[@-~]', '', line) for line in lines
                          if re.search(r'CRASH|FATAL:|SIGSEGV|SIGABRT|segmentation|process did exit.*exitCode=[1-9]|error while loading|Out of memory', line, re.I)]
                if native:
                    detail += '\nBrowser process diagnostics:\n' + '\n'.join(native[-12:])[:6000]
        browser_environment = directory / 'browser-environment.json'
        if browser_environment.is_file():
            runtime = json.loads(browser_environment.read_text())
            detail += '; ' + runtime.get('version', 'browser version unavailable')
        results.append({'check': 'Browser tests', 'passed': successful, 'detail': detail})
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
    result['browser_profiles'] = list(profiles.values())
    directory.mkdir(parents=True, exist_ok=True)
    (directory / 'summary.json').write_text(json.dumps(result, indent=2) + '\n')
    markdown = ['## Paddock CI', '', '| Check | Result | Detail |', '| --- | --- | --- |']
    escape = lambda text: str(text).replace('|', '\\|').replace('\n', ' ').replace('\r', ' ').replace('<', '&lt;').replace('>', '&gt;').replace('::', '&#58;&#58;')
    markdown += [f"| {escape(row['check'])} | {'PASS' if row['passed'] else 'FAIL'} | {escape(row['detail'])} |" for row in results]
    markdown += ['', 'No deployment or provider credentials are used by this workflow.', '']
    text = '\n'.join(markdown)
    (directory / 'summary.md').write_text(text)
    if os.environ.get('GITHUB_STEP_SUMMARY'):
        with Path(os.environ['GITHUB_STEP_SUMMARY']).open('a') as stream:
            stream.write(text)
    print(text)
    if os.environ.get('GITHUB_ACTIONS') == 'true':
        def command_escape(value):
            return str(value).replace('%', '%25').replace('\r', '%0D').replace('\n', '%0A')
        # GitHub limits notices per step. Preserve all checks in one complete, escaped annotation first.
        print('::notice title=Paddock CI complete::' + command_escape(json.dumps(result, ensure_ascii=False)))
        for row in results:
            level = 'notice' if row['passed'] else 'error'
            title = command_escape('Paddock CI - ' + row['check']).replace(',', '%2C').replace(':', '%3A')
            print(f"::{level} title={title}::{command_escape(row['detail'])}")
    return passed


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--reports', type=Path, required=True)
    raise SystemExit(0 if summarize(parser.parse_args().reports.resolve()) else 1)
