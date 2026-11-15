"""Run with python -S: demonstrate no third-party runtime dependency."""
import json
import math
import os
from pathlib import Path
import resource
import statistics
import sys
import time

BASE = Path(os.environ.get('PADDOCK_EVAL_DIR', Path(__file__).resolve().parents[2].parent / '.paddock' / 'model-evaluation'))
def memory():
    out = {}
    for line in open('/proc/self/status'):
        if line.startswith(('VmRSS:', 'VmHWM:')):
            k,v = line.split(':',1)
            out[k+'_mib'] = round(int(v.split()[0])/1024,3)
    return out

started = time.perf_counter()
from compact_runtime import PriceForest, MessageForest
forest = PriceForest(BASE/'cars.compact.bin')
message = MessageForest(BASE/'message.compact.json.gz')
startup_seconds = time.perf_counter()-started
memory_after_load = memory()
golden = json.loads((BASE/'golden.json').read_text())
durations = []
max_difference = 0
for values, expected in zip(golden['price_cases'], golden['price_expected']):
    start = time.perf_counter()
    predicted = forest.predict_one(values)
    durations.append((time.perf_counter()-start)*1000)
    max_difference = max(max_difference,abs(predicted-expected))
assert max_difference <= 1e-9
message_times = []
for text, expected in zip(golden['messages'],golden['message_expected']):
    start = time.perf_counter()
    assert message.predict_one(text) == expected
    message_times.append((time.perf_counter()-start)*1000)
rejected = 0
for bad in [[],[0]*8,[float('nan')]*9,[float('inf')]*9,[1e100]*9]:
    try:
        forest.predict_one(bad)
    except (ValueError,OverflowError):
        rejected += 1
assert rejected == 5
assert not any(name.split('.')[0] in {'numpy','scipy','sklearn','joblib'} for name in sys.modules)
def timing(values):
    return {'samples':len(values),'first_ms':round(values[0],4),'median_ms':round(statistics.median(values),4),'p95_ms':round(sorted(values)[math.ceil(len(values)*.95)-1],4)}
report = {'python':sys.version.split()[0],'site_packages_disabled':sys.flags.no_site==1,'third_party_model_dependencies':[],'startup_seconds':round(startup_seconds,5),'memory_after_load':memory_after_load,'memory_after_inference':memory(),'peak_rss_mib':round(resource.getrusage(resource.RUSAGE_SELF).ru_maxrss/1024,3),'price_inference':timing(durations),'message_inference':timing(message_times),'max_price_difference':max_difference,'invalid_inputs_rejected':rejected,'limits':'Warm local filesystem, serial requests, existing legacy model; no provider/network/concurrency or accuracy validation.'}
(BASE/'standalone-benchmark.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
