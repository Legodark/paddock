"""Build an isolated deployment directory from checked frozen artifacts."""
import argparse
import csv
import hashlib
import json
from pathlib import Path
import shutil
import sqlite3

ROOT = Path(__file__).resolve().parents[1]
MODEL_SHA = '1c36a9dca5b7ac0076d6fef0f1c6db9952aba5b42fae92db647b1f4750a11b87'


def digest(path):
    h = hashlib.sha256()
    with path.open('rb') as f:
        for block in iter(lambda:f.read(1024*1024),b''):
            h.update(block)
    return h.hexdigest()


def prepare(output,models,web_dist=None):
    if output.exists():
        raise FileExistsError('Use a new output directory; existing files are preserved.')
    contract_path = ROOT/'experiments/model-contract/feature-contract.json'
    contract = json.loads(contract_path.read_text())
    comparison = json.loads((ROOT/'experiments/model-compact/comparison.json').read_text())
    expected = {
        models/'cars.compact.bin':comparison['artifacts']['cars.compact.bin']['sha256'],
        models/'message.compact.json.gz':comparison['artifacts']['message.compact.json.gz']['sha256'],
        ROOT/'datasets/car_data.csv':contract['raw_dataset_sha256'],
        ROOT/'padook/Backend/models/cars_model.pkl':MODEL_SHA,
    }
    for path,sha in expected.items():
        if not path.is_file() or digest(path) != sha:
            raise ValueError('Frozen artifact checksum mismatch: '+path.name)
    if contract['model_sha256'] != MODEL_SHA or not contract['model_policy']['frozen']:
        raise ValueError('Unexpected model contract')
    if web_dist:
        if not (web_dist/'index.html').is_file():
            raise ValueError('Build the React frontend before packaging it.')
        for path in web_dist.rglob('*'):
            if path.is_symlink() or (path.is_file() and path.suffix not in {'.html','.js','.css','.svg','.png','.ico','.webp','.woff2','.txt'}):
                raise ValueError('Unexpected public artifact: '+str(path.relative_to(web_dist)))
    shutil.copytree(ROOT/'deploy/vercel',output,ignore=shutil.ignore_patterns('assets','.vercel','.git','.env*','__pycache__','tests','README.md'))
    if web_dist:
        shutil.copytree(web_dist,output/'public',dirs_exist_ok=True)
    assets = output/'assets'
    assets.mkdir()
    shutil.copyfile(models/'cars.compact.bin',assets/'price.bin')
    shutil.copyfile(models/'message.compact.json.gz',assets/'message.json.gz')
    shutil.copyfile(contract_path,assets/'contract.json')
    shutil.copyfile(ROOT/'experiments/model-contract/legacy-to-canonical.json',assets/'legacy.json')
    con = sqlite3.connect(assets/'cars.sqlite3')
    con.execute('CREATE TABLE cars (id INTEGER PRIMARY KEY,location TEXT NOT NULL,brand TEXT NOT NULL,model TEXT NOT NULL,year REAL NOT NULL,horses REAL NOT NULL,km REAL NOT NULL,fuel TEXT NOT NULL,gearbox TEXT NOT NULL,price REAL NOT NULL,engine REAL NOT NULL,marches REAL NOT NULL)')
    fields = ['localidad','marca','modelo','año','motor (CV)','kilometros','combustible','cambio','precio','cilindrada','marchas']
    numeric = {3,4,5,8,9,10}
    with (ROOT/'datasets/car_data.csv').open(newline='') as f:
        def rows():
            for index,row in enumerate(csv.DictReader(f),1):
                yield (index,*(float(row[name]) if i in numeric else row[name] for i,name in enumerate(fields)))
        con.executemany('INSERT INTO cars VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',rows())
    con.execute('CREATE INDEX cars_model_price ON cars(model,price)')
    con.execute('CREATE INDEX cars_brand_year ON cars(brand,year)')
    con.commit()
    if con.execute('SELECT count(*) FROM cars').fetchone()[0] != contract['dataset_rows']:
        raise ValueError('Snapshot row count mismatch')
    if con.execute('PRAGMA integrity_check').fetchone()[0] != 'ok':
        raise ValueError('Snapshot integrity check failed')
    con.close()
    manifest = {'version':1,'model_sha256':MODEL_SHA,'catalog_version':contract['catalog_version'],'generated_by':'paddock-vercel-package-v1','files':{path.name:{'bytes':path.stat().st_size,'sha256':digest(path)} for path in sorted(assets.iterdir())}}
    (assets/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
    public_files = [path for path in (output/'public').rglob('*') if path.is_file()]
    summary = {'output':str(output),'artifact_bytes':sum(f['bytes'] for f in manifest['files'].values()),'dataset_rows':contract['dataset_rows'],'model_sha256':MODEL_SHA,'web_included':web_dist is not None,'public_bytes':sum(path.stat().st_size for path in public_files),'public_files':[str(path.relative_to(output/'public')) for path in sorted(public_files)],'scope':'Local package only; not deployed, no provider quotas or billing verified.'}
    print(json.dumps(summary,indent=2))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output',type=Path,default=ROOT.parent/'.paddock/vercel-package')
    parser.add_argument('--models',type=Path,default=ROOT.parent/'.paddock/model-evaluation')
    parser.add_argument('--web-dist',type=Path,help='Optional built React directory; only static web files are accepted.')
    args = parser.parse_args()
    prepare(args.output.resolve(),args.models.resolve(),args.web_dist.resolve() if args.web_dist else None)
