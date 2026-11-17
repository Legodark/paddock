"""Run an API/CI guard suite and persist its actual outcome, rejecting skipped tests."""
import argparse
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--report', type=Path, required=True)
    parser.add_argument('--suite', choices=['api', 'guards'], default='api')
    arguments = parser.parse_args()
    directory = ROOT / ('deploy/vercel/tests' if arguments.suite == 'api' else 'ci/tests')
    suite = unittest.defaultTestLoader.discover(str(directory))
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    summary = {'suite': arguments.suite, 'tests': result.testsRun, 'failures': len(result.failures), 'errors': len(result.errors), 'skipped': len(result.skipped), 'passed': result.testsRun - len(result.failures) - len(result.errors) - len(result.skipped)}
    arguments.report.parent.mkdir(parents=True, exist_ok=True)
    arguments.report.write_text(json.dumps(summary, indent=2) + '\n')
    raise SystemExit(0 if result.testsRun > 0 and result.wasSuccessful() and not result.skipped else 1)
