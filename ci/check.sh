#!/usr/bin/env bash
set -euo pipefail

paddock_repo=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
paddock_python=${PADDOCK_CI_PYTHON:-python3}
: "${PADDOCK_CI_WORK:?Set PADDOCK_CI_WORK to a new absolute directory outside the checkout.}"

"$paddock_python" - "$PADDOCK_CI_WORK" "$paddock_repo" <<'PY'
from pathlib import Path
import sys
if sys.version_info[:3] != (3, 12, 14):
    raise SystemExit('Use Python 3.12.14 for the CI entry point.')
work, repo = Path(sys.argv[1]), Path(sys.argv[2])
if not work.is_absolute() or work.resolve().is_relative_to(repo.resolve()):
    raise SystemExit('CI work directory must be absolute and outside the checkout.')
work.mkdir(parents=True, exist_ok=False)
(work / 'reports').mkdir()
PY
paddock_python=$("$paddock_python" -c 'import sys; print(sys.executable)')

paddock_reports="$PADDOCK_CI_WORK/reports"
paddock_tools="$PADDOCK_CI_WORK/tools"
paddock_api="$PADDOCK_CI_WORK/api"
paddock_conversion="$PADDOCK_CI_WORK/conversion"
"$paddock_python" -I -S "$paddock_repo/tools/export_frozen_models.py" --verify-only > "$paddock_reports/frozen-inputs.json"
"$paddock_python" "$paddock_repo/ci/lint_workflow.py" --directory "$PADDOCK_CI_WORK/workflow-lint" --report "$paddock_reports/workflow-lint.json"
"$paddock_python" -I -S "$paddock_repo/tools/run_python_tests.py" --suite guards --report "$paddock_reports/guard-tests.json"
"$paddock_python" -I -S "$paddock_repo/tools/inspect_firewall_policy.py" --report "$paddock_reports/firewall-policy.json"
export PYTHONDONTWRITEBYTECODE=1
export UV_CACHE_DIR="$PADDOCK_CI_WORK/uv-cache"
export UV_PYTHON_INSTALL_DIR="$PADDOCK_CI_WORK/python"
export UV_PYTHON_BIN_DIR="$PADDOCK_CI_WORK/bin"
export XDG_CACHE_HOME="$PADDOCK_CI_WORK/cache"
export PLAYWRIGHT_BROWSERS_PATH="$PADDOCK_CI_WORK/browsers"
export VERCEL_TELEMETRY_DISABLED=1

node -e 'const fs = require("node:fs"); const expected = fs.readFileSync(process.argv[1], "utf8").trim(); if (process.versions.node !== expected) throw new Error("Use Node " + expected);' "$paddock_repo/web/.node-version"
if [[ $(npm --version) != 11.9.0 ]]; then
  printf '%s\n' 'Use npm 11.9.0, as declared in web/package.json.' >&2
  exit 1
fi

"$paddock_python" -m venv "$paddock_tools"
"$paddock_tools/bin/python" -m pip install --require-hashes --only-binary=:all: -r "$paddock_repo/ci/requirements-tooling.txt"
paddock_uv="$paddock_tools/bin/uv"
"$paddock_uv" python install 3.10.22
"$paddock_uv" venv --managed-python --python 3.10.22 "$paddock_conversion"
"$paddock_uv" pip install --python "$paddock_conversion/bin/python" --require-hashes --only-binary=:all: -r "$paddock_repo/ci/requirements-conversion.txt"
"$paddock_uv" venv --python "$paddock_python" "$paddock_api"
"$paddock_api/bin/python" -c 'import sys; assert sys.version_info[:3] == (3, 12, 14), sys.version'
"$paddock_uv" pip install --python "$paddock_api/bin/python" --require-hashes --only-binary=:all: -r "$paddock_repo/deploy/vercel/requirements.txt"
"$paddock_conversion/bin/python" "$paddock_repo/tools/export_frozen_models.py" --output "$PADDOCK_CI_WORK/models" > "$paddock_reports/frozen-models.json"

npm --prefix "$paddock_repo/web" ci
npm --prefix "$paddock_repo/ci/vercel-tooling" ci --ignore-scripts
npm --prefix "$paddock_repo/web" audit --json > "$paddock_reports/npm-audit.json"
npm --prefix "$paddock_repo/ci/vercel-tooling" audit --json > "$paddock_reports/build-tools-audit.json"
npm --prefix "$paddock_repo/web" test -- --reporter=default --reporter=json --outputFile="$paddock_reports/unit-tests.json"
npm --prefix "$paddock_repo/web" run build
"$paddock_api/bin/python" "$paddock_repo/tools/prepare_vercel_package.py" --models "$PADDOCK_CI_WORK/models" --web-dist "$paddock_repo/web/dist" --output "$PADDOCK_CI_WORK/package" > "$paddock_reports/package.json"

export PADDOCK_ASSET_DIR="$PADDOCK_CI_WORK/package/assets"
export PADDOCK_PACKAGE_DIR="$PADDOCK_CI_WORK/package"
export PADDOCK_PYTHON="$paddock_api/bin/python"
"$paddock_api/bin/python" "$paddock_repo/tools/run_python_tests.py" --report "$paddock_reports/api-tests.json"
paddock_api_packages=$("$paddock_api/bin/python" -c 'import sysconfig; print(sysconfig.get_path("purelib"))')
"$paddock_tools/bin/pip-audit" --path "$paddock_api_packages" --strict --progress-spinner off --desc off --format json --output "$paddock_reports/api-audit.json"

if [[ -z ${PADDOCK_CHROMIUM:-} ]]; then
  for paddock_browser in google-chrome-stable google-chrome chromium chromium-browser; do
    if command -v "$paddock_browser" >/dev/null 2>&1; then
      PADDOCK_CHROMIUM=$(command -v "$paddock_browser")
      break
    fi
  done
fi
if [[ -z ${PADDOCK_CHROMIUM:-} ]]; then
  (cd "$paddock_repo/web" && npm exec -- playwright install --with-deps chromium)
  PADDOCK_CHROMIUM=$(cd "$paddock_repo/web" && node -e 'process.stdout.write(require("@playwright/test").chromium.executablePath())')
fi
export PADDOCK_CHROMIUM
if [[ ${PADDOCK_EXTENDED_BROWSERS:-0} == 1 ]]; then
  (cd "$paddock_repo/web" && npm exec -- playwright install --with-deps firefox webkit)
fi
"$paddock_api/bin/python" - "$PADDOCK_CHROMIUM" "$paddock_reports/browser-environment.json" <<'PY'
import json, pathlib, subprocess, sys
version = subprocess.check_output([sys.argv[1], '--version'], text=True).strip()
pathlib.Path(sys.argv[2]).write_text(json.dumps({'executable': sys.argv[1], 'version': version, 'chromium_sandbox_requested': True, 'api_python': sys.version.split()[0]}, indent=2) + '\n')
print('Browser:', version)
PY
rm -f "$paddock_repo/web/test-results/results.json"
paddock_browser_status=0
CI=1 DEBUG=pw:browser npm --prefix "$paddock_repo/web" run test:e2e 2> >(tee "$paddock_reports/browser-stderr.log" >&2) || paddock_browser_status=$?
if [[ -f "$paddock_repo/web/test-results/results.json" ]]; then
  cp "$paddock_repo/web/test-results/results.json" "$paddock_reports/browser-tests.json"
fi
if [[ $paddock_browser_status -ne 0 ]]; then
  exit "$paddock_browser_status"
fi

export PADDOCK_VERCEL_TOOLING="$paddock_repo/ci/vercel-tooling"
# The official builder invokes uv through PATH. This change is scoped to this process.
PATH="$paddock_tools/bin:$PATH" node "$paddock_repo/tools/build_vercel_package.cjs" "$PADDOCK_CI_WORK/package" "$PADDOCK_CI_WORK/build"
cp "$PADDOCK_CI_WORK/build/paddock-bundle-report.json" "$paddock_reports/bundle.json"
"$paddock_api/bin/python" -I -S "$paddock_repo/tools/check_vercel_package.py" --package "$PADDOCK_CI_WORK/package" --function "$PADDOCK_CI_WORK/build-function" --build-report "$paddock_reports/bundle.json" --report "$paddock_reports/package-check.json"
"$paddock_tools/bin/pip-audit" --path "$PADDOCK_CI_WORK/build-function/_vendor" --strict --progress-spinner off --desc off --format json --output "$paddock_reports/bundle-audit.json"
"$paddock_api/bin/python" "$paddock_repo/ci/summary.py" --reports "$paddock_reports"
