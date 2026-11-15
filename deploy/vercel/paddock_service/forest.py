"""Checked readers for trusted, versioned frozen-tree artifacts; no pickle."""
import gzip
import json
import math
import mmap
from pathlib import Path
import string
import struct
import sys

HEADER = struct.Struct('<8sIIQ')


class ArtifactError(ValueError):
    pass


class PriceForest:
    def __init__(self, path):
        self._file = self._map = self._view = None
        self.roots = self.features = self.payload = self.right_delta = None
        try:
            if sys.byteorder != 'little':
                raise ArtifactError('Unsupported byte order')
            self._file = Path(path).open('rb')
            self._map = mmap.mmap(self._file.fileno(), 0, access=mmap.ACCESS_READ)
            if len(self._map) < HEADER.size:
                raise ArtifactError('Truncated header')
            magic, version, trees, nodes = HEADER.unpack_from(self._map)
            if magic != b'PADRF001' or version != 1 or trees != 100 or not 0 < nodes <= 8_000_000:
                raise ArtifactError('Unexpected forest header')
            features_start = HEADER.size + 4 * trees
            payload_start = (features_start + nodes + 7) // 8 * 8
            right_start = payload_start + 8 * nodes
            if len(self._map) != right_start + 4 * nodes:
                raise ArtifactError('Unexpected forest length')
            self._view = memoryview(self._map)
            self.roots = self._view[HEADER.size:features_start].cast('I')
            self.features = self._view[features_start:features_start+nodes].cast('b')
            self.payload = self._view[payload_start:right_start].cast('d')
            self.right_delta = self._view[right_start:].cast('I')
            roots = list(self.roots)
            if roots[0] != 0 or any(a >= b for a,b in zip(roots,roots[1:])) or roots[-1] >= nodes:
                raise ArtifactError('Invalid tree roots')
            for start,end in zip(roots,roots[1:]+[nodes]):
                for node in range(start,end):
                    feature,delta,value = self.features[node],self.right_delta[node],self.payload[node]
                    if not math.isfinite(value):
                        raise ArtifactError('Nonfinite tree payload')
                    if feature == -1:
                        if delta != 0:
                            raise ArtifactError('Invalid leaf')
                    elif not (0 <= feature < 9 and node+1 < end and 1 < delta < end-node):
                        raise ArtifactError('Invalid split')
            self.tree_count = trees
        except Exception:
            self.close()
            raise

    def close(self):
        for name in ['roots','features','payload','right_delta','_view']:
            view = getattr(self,name,None)
            if view is not None:
                view.release()
                setattr(self,name,None)
        if self._map is not None:
            self._map.close()
            self._map = None
        if self._file is not None:
            self._file.close()
            self._file = None

    def predict_one(self, values):
        if len(values) != 9 or not all(math.isfinite(float(v)) for v in values):
            raise ValueError('Expected nine finite features')
        x = struct.unpack('<9f',struct.pack('<9f',*(float(v) for v in values)))
        if not all(math.isfinite(v) for v in x):
            raise ValueError('Features outside float32 range')
        total = 0.0
        for root in self.roots:
            node = root
            while self.features[node] >= 0:
                node += 1 if x[self.features[node]] <= self.payload[node] else self.right_delta[node]
            total += self.payload[node]
        return total / self.tree_count


class MessageForest:
    def __init__(self,path):
        with gzip.open(path,'rb') as f:
            raw = f.read(2_000_001)
        if len(raw) > 2_000_000:
            raise ArtifactError('Message artifact too large')
        data = json.loads(raw)
        if data.get('version') != 1 or data.get('classes') != [0,1]:
            raise ArtifactError('Unexpected message classes')
        vocab,trees = data['vocabulary'],data['trees']
        if len(vocab) != 539 or set(vocab.values()) != set(range(539)):
            raise ArtifactError('Invalid vocabulary')
        if any(not isinstance(k,str) or not 0 < len(k) <= 256 for k in vocab):
            raise ArtifactError('Invalid vocabulary token')
        if len(trees) != 100:
            raise ArtifactError('Unexpected classifier size')
        for tree in trees:
            count = len(tree['feature'])
            if not 0 < count <= 10000 or any(len(tree[k]) != count for k in ['threshold','left','right','probability']):
                raise ArtifactError('Invalid classifier tree')
            for i in range(count):
                feature,left,right = tree['feature'][i],tree['left'][i],tree['right'][i]
                if not isinstance(feature,int) or not math.isfinite(tree['threshold'][i]):
                    raise ArtifactError('Invalid classifier split')
                if feature == -2:
                    if left != -1 or right != -1:
                        raise ArtifactError('Invalid classifier leaf')
                elif not (0 <= feature < 539 and i < left < right < count):
                    raise ArtifactError('Invalid classifier children')
                probs = tree['probability'][i]
                if len(probs) != 2 or any(not math.isfinite(v) or not 0 <= v <= 1 for v in probs) or abs(sum(probs)-1) > 1e-9:
                    raise ArtifactError('Invalid probabilities')
        self.data = data

    def predict_proba(self,message):
        tokens = {''.join(c.lower() for c in t if c not in string.punctuation) for t in message.lower().split()}
        vocab = self.data['vocabulary']
        active = {vocab[t] for t in tokens if t in vocab}
        total = [0.0,0.0]
        for tree in self.data['trees']:
            node = 0
            while tree['feature'][node] >= 0:
                value = 1.0 if tree['feature'][node] in active else 0.0
                node = tree['left'][node] if value <= tree['threshold'][node] else tree['right'][node]
            for i,p in enumerate(tree['probability'][node]):
                total[i] += p
        return [p/100 for p in total]

    def predict_one(self,message):
        probabilities = self.predict_proba(message)
        return max(range(2),key=probabilities.__getitem__)
