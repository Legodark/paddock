"""Reproduce the two reviewed compact artifacts from trusted historical pickle files.

Run in the isolated Python 3.10 conversion environment, never in production.
Checksums are checked before importing legacy code or deserializing either model.
"""
import argparse
import gzip
import hashlib
import json
from pathlib import Path
import struct
import sys
import zlib

ROOT = Path(__file__).resolve().parents[1]
INPUTS = {
    'padook/Backend/models/cars_model.pkl': '1c36a9dca5b7ac0076d6fef0f1c6db9952aba5b42fae92db647b1f4750a11b87',
    'padook/Backend/models/message_model.pkl': 'd56b8604ad35cd4815ec0ec3c3b706a715ee7fbe736d8e55b281786d791ee58d',
    'padook/Backend/tokenizer/tokenizer.py': '605a5a378d3553f29d84d0b4789e3b1833f0fa91c3bea47be4297596e274952c',
}
OUTPUTS = {
    'cars.compact.bin': '862e15962e6866b34a36d9f13906dcdcaf8aba6b9023fd028a47290a8c7984b7',
    'message.compact.json.gz': '820505cfffa425d4c8502e7dcfe08aff37de25e6ad029a546daa9cd6376d0470',
}


def digest(path):
    result = hashlib.sha256()
    with path.open('rb') as stream:
        for block in iter(lambda: stream.read(1048576), b''):
            result.update(block)
    return result.hexdigest()


def validate_sources(root):
    for relative, expected in INPUTS.items():
        path = root / relative
        if path.is_symlink() or not path.is_file() or digest(path) != expected:
            raise ValueError('Frozen source checksum mismatch: ' + relative)


def export(output):
    if output.exists():
        raise FileExistsError('Choose a new output directory; existing files are preserved.')
    validate_sources(ROOT)
    # Imports must stay below the input checks: pickle is executable data.
    import joblib
    import numpy as np
    import sklearn
    if sys.version_info[:2] != (3, 10) or np.__version__ != '1.24.4' or sklearn.__version__ != '1.2.1':
        raise RuntimeError('Use the pinned Python 3.10 conversion environment.')
    sys.path.insert(0, str(ROOT / 'padook/Backend'))
    from tokenizer.tokenizer import Tokenizer
    price = joblib.load(ROOT / 'padook/Backend/models/cars_model.pkl')
    message, vectorizer = joblib.load(ROOT / 'padook/Backend/models/message_model.pkl')
    if price.n_outputs_ != 1 or price.n_features_in_ != 9 or len(price.estimators_) != 100:
        raise ValueError('Unexpected historical regressor')
    if type(vectorizer).__name__ != 'CountVectorizer' or not vectorizer.lowercase or not vectorizer.binary or vectorizer.ngram_range != (1, 1):
        raise ValueError('Unexpected historical vectorizer')
    if any(value is not None for value in [vectorizer.stop_words, vectorizer.strip_accents, vectorizer.preprocessor]) or vectorizer.analyzer != 'word' or vectorizer.tokenizer is not Tokenizer.tokenize:
        raise ValueError('Unexpected historical tokenization')
    counts = [tree.tree_.node_count for tree in price.estimators_]
    nodes = sum(counts)
    features = np.empty(nodes, dtype='i1')
    payload = np.empty(nodes, dtype='<f8')
    right_delta = np.empty(nodes, dtype='<u4')
    roots, offset = [], 0
    for estimator, count in zip(price.estimators_, counts):
        tree = estimator.tree_
        internal = tree.feature >= 0
        positions = np.arange(count)
        if not np.all(tree.children_left[internal] == positions[internal] + 1) or not np.all(tree.children_right[internal] > positions[internal]) or not np.all(tree.feature[internal] < 9):
            raise ValueError('Unexpected tree layout')
        roots.append(offset)
        features[offset:offset + count] = np.where(internal, tree.feature, -1)
        payload[offset:offset + count] = np.where(internal, tree.threshold, tree.value[:, 0, 0])
        right_delta[offset:offset + count] = np.where(internal, tree.children_right - positions, 0)
        offset += count
    output.mkdir(parents=True)
    header = struct.Struct('<8sIIQ')
    padding = (-(header.size + 4 * len(roots) + nodes)) % 8
    with (output / 'cars.compact.bin').open('wb') as stream:
        stream.write(header.pack(b'PADRF001', 1, len(roots), nodes))
        stream.write(struct.pack('<100I', *roots))
        stream.write(features.tobytes())
        stream.write(b'\0' * padding)
        stream.write(payload.tobytes())
        stream.write(right_delta.tobytes())
    data = {'version': 1, 'classes': message.classes_.tolist(), 'vocabulary': vectorizer.vocabulary_, 'trees': []}
    for estimator in message.estimators_:
        tree = estimator.tree_
        values = tree.value[:, 0, :]
        probabilities = values / values.sum(axis=1, keepdims=True)
        data['trees'].append({'feature': tree.feature.tolist(), 'threshold': tree.threshold.tolist(), 'left': tree.children_left.tolist(), 'right': tree.children_right.tolist(), 'probability': probabilities.tolist()})
    with (output / 'message.compact.json.gz').open('wb') as stream:
        with gzip.GzipFile(filename='', mode='wb', fileobj=stream, compresslevel=9, mtime=0) as compressed:
            compressed.write(json.dumps(data, ensure_ascii=False, separators=(',', ':')).encode())
    artifacts = {}
    for name, expected in OUTPUTS.items():
        path = output / name
        actual = digest(path)
        if actual != expected:
            raise ValueError('Compact artifact checksum mismatch: ' + name)
        artifacts[name] = {'bytes': path.stat().st_size, 'sha256': actual}
    print(json.dumps({'python': sys.version.split()[0], 'zlib': zlib.ZLIB_RUNTIME_VERSION, 'numpy': np.__version__, 'scikit_learn': sklearn.__version__, 'artifacts': artifacts, 'policy': 'Frozen trusted input conversion only; no training, scraping or serving.'}, indent=2))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path)
    parser.add_argument('--verify-only', action='store_true')
    arguments = parser.parse_args()
    if arguments.verify_only:
        validate_sources(ROOT)
        print(json.dumps({'verified_frozen_inputs': INPUTS}, indent=2))
    elif arguments.output:
        export(arguments.output.resolve())
    else:
        parser.error('--output is required unless --verify-only is used')
