import contextlib
import importlib.util
import io
import json
import os
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[2]


def module(name, relative):
    spec = importlib.util.spec_from_file_location(name, ROOT / relative)
    result = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(result)
    return result


exporter = module('paddock_export', 'tools/export_frozen_models.py')
policy = module('paddock_firewall', 'tools/inspect_firewall_policy.py')
summary = module('paddock_summary', 'ci/summary.py')


class GuardTests(unittest.TestCase):
    def test_modified_model_rejected_before_deserialization_dependencies_are_imported(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            path = root / 'padook/Backend/models/cars_model.pkl'
            path.parent.mkdir(parents=True)
            path.write_bytes(b'untrusted model replacement')
            self.assertNotIn('joblib', sys.modules)
            with self.assertRaisesRegex(ValueError, 'Frozen source checksum mismatch'):
                exporter.validate_sources(root)
            self.assertNotIn('joblib', sys.modules)

    def test_model_symlinks_rejected_even_when_they_resolve_to_trusted_bytes(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            for relative in exporter.INPUTS:
                path = root / relative
                path.parent.mkdir(parents=True, exist_ok=True)
                path.symlink_to(ROOT / relative)
            with self.assertRaisesRegex(ValueError, 'Frozen source checksum mismatch'):
                exporter.validate_sources(root)

    def test_firewall_policy_cannot_miss_the_direct_function_entrypoint(self):
        data = json.loads((ROOT / 'security/vercel-firewall.json').read_text())
        data['condition']['value'] = '/api/v1/'
        with tempfile.TemporaryDirectory() as temporary:
            path = Path(temporary) / 'policy.json'; path.write_text(json.dumps(data))
            with self.assertRaises(ValueError):
                policy.inspect(path)

    def test_firewall_scope_and_paid_algorithm_are_rejected(self):
        for changes in [{'scope': 'team'}, {'team': 'another-team'}, {'algorithm': 'token_bucket'}, {'window_seconds': 601}, {'requests': True}]:
            with self.subTest(changes=changes), tempfile.TemporaryDirectory() as temporary:
                data = json.loads((ROOT / 'security/vercel-firewall.json').read_text()) | changes
                path = Path(temporary) / 'policy.json'; path.write_text(json.dumps(data))
                with self.assertRaises(ValueError):
                    policy.inspect(path)

    def test_missing_ci_reports_do_not_produce_a_successful_summary(self):
        with tempfile.TemporaryDirectory() as temporary, patch.dict(os.environ, {'GITHUB_STEP_SUMMARY': ''}), contextlib.redirect_stdout(io.StringIO()):
            self.assertFalse(summary.summarize(Path(temporary)))

    def test_skipped_unit_or_browser_cases_fail_the_summary(self):
        fixture = {
            'npm-audit.json': {'metadata': {'vulnerabilities': {'total': 0}}},
            'build-tools-audit.json': {'metadata': {'vulnerabilities': {'total': 0}}},
            'api-audit.json': {'dependencies': [{'name': 'flask', 'vulns': []}]},
            'bundle-audit.json': {'dependencies': [{'name': 'flask', 'vulns': []}]},
            'unit-tests.json': {'numPassedTests': 1, 'success': True, 'numFailedTests': 0, 'numPendingTests': 0},
            'api-tests.json': {'passed': 1, 'failures': 0, 'errors': 0, 'skipped': 0},
            'guard-tests.json': {'passed': 1, 'failures': 0, 'errors': 0, 'skipped': 0},
            'browser-tests.json': {'stats': {'expected': 1, 'unexpected': 0, 'skipped': 0, 'flaky': 0}},
            'frozen-models.json': {'artifacts': {'price': {}, 'message': {}}},
            'package-check.json': {'ready': True, 'prediction': 20155.0, 'private_artifact_routes_status': 404},
            'workflow-lint.json': {'passed': True},
            'firewall-policy.json': {'valid_local_policy': True, 'remote_applied': False},
        }
        with tempfile.TemporaryDirectory() as temporary, patch.dict(os.environ, {'GITHUB_STEP_SUMMARY': ''}), contextlib.redirect_stdout(io.StringIO()):
            root = Path(temporary)
            for name, data in fixture.items():
                (root / name).write_text(json.dumps(data))
            self.assertTrue(summary.summarize(root))
            (root / 'unit-tests.json').write_text(json.dumps(fixture['unit-tests.json'] | {'numPendingTests': 1}))
            self.assertFalse(summary.summarize(root))
            (root / 'unit-tests.json').write_text(json.dumps(fixture['unit-tests.json']))
            (root / 'browser-tests.json').write_text(json.dumps({'stats': {'expected': 1, 'unexpected': 0, 'skipped': 1, 'flaky': 0}}))
            self.assertFalse(summary.summarize(root))
