"""Export trusted original artifacts and compare; never changes repository files."""
import csv
import gzip
import hashlib
import json
import math
import os
from pathlib import Path
import shutil
import struct
import sys
import time

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
BASE = Path(os.environ.get('PADDOCK_EVAL_DIR', ROOT.parent / '.paddock' / 'model-evaluation'))
BASE.mkdir(parents=True, exist_ok=True)
BACKEND = ROOT / 'padook/Backend'
os.chdir(BACKEND)
sys.path.insert(0, str(BACKEND))
import app
from compact_runtime import PriceForest, MessageForest, HEADER, MAGIC

forest = app.car_model
assert forest.n_outputs_ == 1 and forest.n_features_in_ == 9
trees = forest.estimators_
counts = [t.tree_.node_count for t in trees]
nodes = sum(counts)
features = np.empty(nodes, dtype='i1')
payload = np.empty(nodes, dtype='<f8')
right_delta = np.empty(nodes, dtype='<u4')
roots = []
offset = 0
started = time.perf_counter()
for tree, count in zip(trees, counts):
    t = tree.tree_
    roots.append(offset)
    internal = t.feature >= 0
    positions = np.arange(count)
    assert np.all(t.children_left[internal] == positions[internal] + 1)
    assert np.all(t.children_right[internal] > positions[internal])
    assert np.all(t.feature[internal] < 9)
    features[offset:offset+count] = np.where(internal, t.feature, -1)
    payload[offset:offset+count] = np.where(internal, t.threshold, t.value[:,0,0])
    right_delta[offset:offset+count] = np.where(internal, t.children_right - positions, 0)
    offset += count
raw = BASE / 'cars.compact.bin'
feature_start = HEADER.size + 4 * len(trees)
padding = (-(feature_start+nodes)) % 8
with raw.open('wb') as f:
    f.write(HEADER.pack(MAGIC, 1, len(trees), nodes))
    f.write(struct.pack('<'+str(len(roots))+'I', *roots))
    f.write(features.tobytes())
    f.write(b'\0'*padding)
    f.write(payload.tobytes())
    f.write(right_delta.tobytes())
with raw.open('rb') as src, (BASE/'cars.compact.bin.gz').open('wb') as dst:
    with gzip.GzipFile(filename='', mode='wb', fileobj=dst, compresslevel=9, mtime=0) as out:
        shutil.copyfileobj(src, out, length=1024*1024)

v = app.vectorizer
assert type(v).__name__ == 'CountVectorizer'
assert v.lowercase and v.binary and v.ngram_range == (1,1)
assert v.stop_words is None and v.strip_accents is None and v.preprocessor is None
assert v.analyzer == 'word' and v.tokenizer is app.Tokenizer.tokenize
message_data = {'version':1, 'classes': app.message_model.classes_.tolist(), 'vocabulary':v.vocabulary_, 'trees':[]}
for estimator in app.message_model.estimators_:
    t = estimator.tree_
    values = t.value[:,0,:]
    probs = values / values.sum(axis=1, keepdims=True)
    message_data['trees'].append({'feature':t.feature.tolist(), 'threshold':t.threshold.tolist(), 'left':t.children_left.tolist(), 'right':t.children_right.tolist(), 'probability':probs.tolist()})
message_path = BASE/'message.compact.json.gz'
with message_path.open('wb') as dst:
    with gzip.GzipFile(filename='', mode='wb', fileobj=dst, compresslevel=9, mtime=0) as f:
        f.write(json.dumps(message_data, ensure_ascii=False, separators=(',',':')).encode())

export_seconds = time.perf_counter()-started
candidate = PriceForest(raw)
message_candidate = MessageForest(message_path)
fields = ['año','motor (CV)','kilometros','cilindrada','marchas','marca_id','modelo_id','combustible_id','cambio_id']
with (ROOT/'datasets/ML/cars_ml.csv').open(newline='') as f:
    rows = np.array([[float(r[k]) for k in fields] for r in csv.DictReader(f)], dtype=np.float64)
rng = np.random.default_rng(20261114)
sample = rows[rng.choice(len(rows), size=10000, replace=False)]
synthetic = rng.uniform(rows.min(axis=0), rows.max(axis=0), size=(2000,9))
boundaries = []
for tree in trees[:10]:
    t = tree.tree_
    indices = np.flatnonzero(t.feature >= 0)
    for i in rng.choice(indices, size=min(50,len(indices)), replace=False):
        threshold = np.float32(t.threshold[i])
        for value in [np.nextafter(threshold,np.float32(-np.inf)), threshold, np.nextafter(threshold,np.float32(np.inf))]:
            row = sample[len(boundaries)%len(sample)].copy()
            row[t.feature[i]] = float(value)
            boundaries.append(row)
cases = np.vstack([sample,synthetic,np.array(boundaries)])
started = time.perf_counter()
expected = forest.predict(cases)
original_seconds = time.perf_counter()-started
started = time.perf_counter()
observed = np.array([candidate.predict_one(row) for row in cases])
candidate_seconds = time.perf_counter()-started
differences = np.abs(expected-observed)
assert np.all(differences <= 1e-9), float(differences.max())

with (ROOT/'datasets/ChatBOT/message_data.csv').open(newline='') as f:
    messages = [r['message'] for r in csv.DictReader(f)]
messages += ['', '!!!', 'Citroën C3', 'MÁLAGA € 50.000', 'a'*10000, 'Toyota Toyota TOYOTA', '漢字 😀', 'İ test', '\n\t', 'Mercedes de Málaga con precio inferior a 50000 euros']
tokens = list(v.vocabulary_)
messages += [' '.join(rng.choice(tokens,size=int(n)).tolist()) for n in rng.integers(0,40,size=1000)]
expected_labels = app.message_model.predict(v.transform(messages))
expected_probs = app.message_model.predict_proba(v.transform(messages))
observed_labels = np.array([message_candidate.predict_one(s) for s in messages])
observed_probs = np.array([message_candidate.predict_proba(s) for s in messages])
assert np.array_equal(expected_labels,observed_labels)
assert np.max(np.abs(expected_probs-observed_probs)) <= 1e-12

def digest(path):
    return hashlib.file_digest(path.open('rb'), 'sha256').hexdigest() if hasattr(hashlib,'file_digest') else hashlib.sha256(path.read_bytes()).hexdigest()
artifacts = {p.name:{'bytes':p.stat().st_size,'sha256':digest(p)} for p in [raw,BASE/'cars.compact.bin.gz',message_path]}
report = {'seed':20261114,'price_cases':len(cases),'csv_cases':len(sample),'synthetic_cases':len(synthetic),'boundary_cases':len(boundaries),'max_absolute_difference':float(differences.max()),'price_cases_above_1e_9':int(np.sum(differences>1e-9)),'original_batch_seconds':round(original_seconds,3),'candidate_scalar_total_seconds':round(candidate_seconds,3),'message_cases':len(messages),'message_label_differences':int(np.sum(expected_labels!=observed_labels)),'message_probability_max_difference':float(np.max(np.abs(expected_probs-observed_probs))),'export_seconds':round(export_seconds,3),'artifacts':artifacts,'quality_warning':'Equivalence to legacy predictions only; CSV/app category IDs differ; no out-of-sample accuracy measured.'}
(BASE/'golden.json').write_text(json.dumps({'price_cases':cases[:1000].tolist(),'price_expected':expected[:1000].tolist(),'messages':messages[:100],'message_expected':expected_labels[:100].tolist()},ensure_ascii=False)+'\n')
(BASE/'comparison.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
