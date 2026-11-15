"""Run the pinned upstream actionlint binary after checking its published SHA-256."""
import argparse
import hashlib
import json
from pathlib import Path
import platform
import subprocess
import tarfile
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
VERSION = '1.7.12'
SHA = '8aca8db96f1b94770f1b0d72b6dddcb1ebb8123cb3712530b08cc387b349a3d8'
URL = f'https://github.com/rhysd/actionlint/releases/download/v{VERSION}/actionlint_{VERSION}_linux_amd64.tar.gz'

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--directory', type=Path, required=True)
    parser.add_argument('--report', type=Path, required=True)
    arguments = parser.parse_args()
    if platform.system() != 'Linux' or platform.machine() not in {'x86_64', 'AMD64'}:
        raise SystemExit('The reviewed actionlint artifact targets Linux x86_64.')
    arguments.directory.mkdir(parents=True, exist_ok=False)
    archive = arguments.directory / 'actionlint.tar.gz'
    with urllib.request.urlopen(URL, timeout=30) as response:
        data = response.read(16 * 1024 * 1024 + 1)
    if len(data) > 16 * 1024 * 1024 or hashlib.sha256(data).hexdigest() != SHA:
        raise SystemExit('actionlint artifact checksum mismatch')
    archive.write_bytes(data)
    binary = arguments.directory / 'actionlint'
    with tarfile.open(archive) as compressed:
        member = compressed.getmember('actionlint')
        if not member.isfile() or member.size > 32 * 1024 * 1024:
            raise SystemExit('Unexpected actionlint archive member')
        binary.write_bytes(compressed.extractfile(member).read())
    binary.chmod(0o755)
    outcome = subprocess.run([str(binary), '-shellcheck=', '-pyflakes=', str(ROOT / '.github/workflows/ci.yml')], cwd=ROOT)
    if outcome.returncode == 0:
        outcome = subprocess.run(['bash', '-n', str(ROOT / 'ci/check.sh')], cwd=ROOT)
    result = {'passed': outcome.returncode == 0, 'actionlint_version': VERSION, 'source': URL, 'sha256': SHA, 'workflow': '.github/workflows/ci.yml', 'workflow_sha256': hashlib.sha256((ROOT / '.github/workflows/ci.yml').read_bytes()).hexdigest(), 'bash_syntax': 'passed' if outcome.returncode == 0 else 'not-passed', 'external_shellcheck_pyflakes': False}
    arguments.report.parent.mkdir(parents=True, exist_ok=True)
    arguments.report.write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps(result, indent=2))
    raise SystemExit(outcome.returncode)
