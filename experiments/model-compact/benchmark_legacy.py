"""Comparable serial workload for the trusted legacy sklearn runtime."""
import json
import math
import os
from pathlib import Path
import statistics
import sys
import time

ROOT = Path(__file__).resolve().parents[2]
BASE = Path(os.environ.get('PADDOCK_EVAL_DIR', ROOT.parent / '.paddock' / 'model-evaluation'))
backend = ROOT / 'padook/Backend'
os.chdir(backend)
sys.path.insert(0, str(backend))
start = time.perf_counter()
import app
startup = time.perf_counter() - start
golden = json.loads((BASE / 'golden.json').read_text())
price_times, message_times = [], []
for values, expected in zip(golden['price_cases'], golden['price_expected']):
    start = time.perf_counter()
    predicted = float(app.car_model.predict([values])[0])
    price_times.append((time.perf_counter() - start) * 1000)
    assert abs(predicted - expected) <= 1e-9
for text, expected in zip(golden['messages'], golden['message_expected']):
    start = time.perf_counter()
    predicted = int(app.message_model.predict(app.vectorizer.transform([text]))[0])
    message_times.append((time.perf_counter() - start) * 1000)
    assert predicted == expected
def timing(values):
    return {'samples': len(values), 'median_ms': round(statistics.median(values), 4), 'p95_ms': round(sorted(values)[math.ceil(len(values)*.95)-1], 4)}
report = {'python': sys.version.split()[0], 'startup_seconds': round(startup, 5), 'price_inference': timing(price_times), 'message_inference': timing(message_times), 'note': 'Same golden input cases as standalone benchmark, local serial workload, different Python versions; no provider/network/concurrency measurement.'}
(BASE / 'legacy-serial-benchmark.json').write_text(json.dumps(report, indent=2)+'\n')
print(json.dumps(report, indent=2))
