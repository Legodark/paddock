"""Evaluation-only runtime; no application integration. Little-endian format v1."""
import gzip
import json
import math
import mmap
from pathlib import Path
import string
import struct
import sys

HEADER = struct.Struct('<8sIIQ')
MAGIC = b'PADRF001'

class PriceForest:
    def __init__(self, path):
        if sys.byteorder != 'little':
            raise RuntimeError('Evaluation format requires little-endian')
        self._file = open(path, 'rb')
        self._map = mmap.mmap(self._file.fileno(), 0, access=mmap.ACCESS_READ)
        magic, version, trees, nodes = HEADER.unpack_from(self._map)
        if magic != MAGIC or version != 1 or not (0 < trees <= 1000):
            raise ValueError('Invalid forest header')
        feature_start = HEADER.size + 4 * trees
        payload_start = (feature_start + nodes + 7) // 8 * 8
        right_start = payload_start + 8 * nodes
        if len(self._map) != right_start + 4 * nodes:
            raise ValueError('Invalid forest length')
        view = memoryview(self._map)
        self.roots = view[HEADER.size:feature_start].cast('I')
        self.features = view[feature_start:feature_start+nodes].cast('b')
        self.payload = view[payload_start:right_start].cast('d')
        self.right_delta = view[right_start:].cast('I')
        self.tree_count = trees

    def predict_one(self, values):
        if len(values) != 9 or not all(math.isfinite(float(v)) for v in values):
            raise ValueError('Nine finite input features are required')
        # sklearn DecisionTreeRegressor converts inputs to float32.
        x = struct.unpack('<9f', struct.pack('<9f', *(float(v) for v in values)))
        if not all(math.isfinite(v) for v in x):
            raise ValueError('Input outside float32 range')
        total = 0.0
        features, payload, right = self.features, self.payload, self.right_delta
        for root in self.roots:
            node = root
            while features[node] >= 0:
                node += 1 if x[features[node]] <= payload[node] else right[node]
            total += payload[node]
        return total / self.tree_count

class MessageForest:
    def __init__(self, path):
        with gzip.open(path, 'rt', encoding='utf-8') as f:
            self.data = json.load(f)
        if self.data['version'] != 1:
            raise ValueError('Unknown message format')

    def predict_proba(self, message):
        if not isinstance(message, str):
            raise TypeError('Message must be text')
        tokens = set()
        for token in message.lower().split():
            clean = ''.join(c.lower() for c in token if c not in string.punctuation)
            if clean:
                tokens.add(clean)
        vocab = self.data['vocabulary']
        active = {vocab[t] for t in tokens if t in vocab}
        totals = [0.0] * len(self.data['classes'])
        for tree in self.data['trees']:
            node = 0
            while tree['feature'][node] >= 0:
                value = 1.0 if tree['feature'][node] in active else 0.0
                node = tree['left'][node] if value <= tree['threshold'][node] else tree['right'][node]
            for i, probability in enumerate(tree['probability'][node]):
                totals[i] += probability
        return [v / len(self.data['trees']) for v in totals]

    def predict_one(self, message):
        probabilities = self.predict_proba(message)
        return self.data['classes'][max(range(len(probabilities)), key=probabilities.__getitem__)]
