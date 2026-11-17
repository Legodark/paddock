"""Check a materialized official function, public artifacts and resource budgets.

Invoke with Python -I -S: application dependencies must come from the bundle.
No network requests, provider authentication or deployment are performed.
"""
import argparse
import gzip
import hashlib
import importlib.metadata
import json
import os
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]


def check(package, function, build_report, output):
    budgets = json.loads((ROOT / 'ci/budgets.json').read_text())
    bundle = json.loads(build_report.read_text())
    if bundle['uncompressed_bytes'] > budgets['function_uncompressed_bytes']:
        raise ValueError('Function exceeds the local resource budget')
    public = package / 'public'
    if not (public / 'index.html').is_file():
        raise ValueError('React build is missing')
    files = []
    forbidden = {'.bin', '.pkl', '.sqlite', '.sqlite3', '.csv', '.map', '.pem', '.key'}
    for path in sorted(public.rglob('*')):
        if path.is_symlink() or path.name.startswith('.'):
            raise ValueError('Unexpected public path')
        if not path.is_file():
            continue
        if path.suffix in forbidden:
            raise ValueError('Private artifact in public output')
        data = path.read_bytes()
        files.append({'path': str(path.relative_to(public)), 'bytes': len(data), 'gzip_bytes': len(gzip.compress(data, mtime=0)), 'sha256': hashlib.sha256(data).hexdigest()})
    total = sum(row['bytes'] for row in files)
    compressed = sum(row['gzip_bytes'] for row in files)
    if total > budgets['public_bytes'] or compressed > budgets['public_gzip_bytes']:
        raise ValueError('Public output exceeds the local resource budget')
    for path in function.rglob('*'):
        name = path.name
        if path.is_symlink() or name.startswith('.env') or name == '.git' or path.suffix in {'.pkl', '.csv'}:
            raise ValueError('Unexpected private/legacy path in function output')
    if (function / 'public').exists() or (function / 'tests').exists():
        raise ValueError('Unnecessary frontend or tests in function output')
    installed = {distribution.metadata['Name'].lower().replace('_', '-'): distribution.version for distribution in importlib.metadata.distributions(path=[str(function / '_vendor')])}
    if any(name in installed for name in ['numpy', 'scipy', 'scikit-learn', 'joblib', 'pymongo', 'dnspython']):
        raise ValueError('Legacy dependency in production function')
    os.environ.pop('PADDOCK_ASSET_DIR', None)
    sys.path[:0] = [str(function), str(function / '_vendor')]
    from api.index import app
    from paddock_service import app as service_module
    if not Path(service_module.__file__).resolve().is_relative_to(function):
        raise ValueError('Smoke test imported source files outside the materialized function')
    client = app.test_client()
    health = client.get('/api/v1/health')
    if health.status_code != 200 or not health.json.get('ready'):
        raise ValueError('Materialized function is not ready')
    catalog = client.get('/api/v1/search-catalog')
    if catalog.status_code != 200 or len(catalog.json['models']) != 719 or len(catalog.json['locations']) != 50:
        raise ValueError('Unexpected materialized catalog')
    data = {'catalog_version': 'tfm-original-csv-v1', 'year': 2022, 'horses': 110, 'km': 7119, 'displ_engine': 1199, 'marches': 6, 'brand_id': '10', 'model_id': '118', 'fuel_id': '3', 'gearbox_id': '1'}
    prediction = client.post('/api/v1/predict', json=data)
    if prediction.status_code != 200 or prediction.json['prediccion'] != 20155.0:
        raise ValueError('Historical prediction regression')
    for message, expected in [('busco coche coche de menos de 20.000 euros en málaga', 1), ('málaga', 0)]:
        response = client.post('/api/v1/message', json={'message': message})
        if response.status_code != 200 or response.json['contexto'] != expected:
            raise ValueError('Historical classifier regression')
    cars = client.get('/api/v1/cars', query_string={'brand_id': '10', 'location': 'Málaga', 'price_lt': 20000})
    if cars.status_code != 200 or len(cars.json['car_data']) != 10 or any(row['brand'] != 'Citroen' or row['location'] != 'Málaga' or row['price'] >= 20000 for row in cars.json['car_data']):
        raise ValueError('Historical query regression')
    for path in ['/assets/price.bin', '/assets/cars.sqlite3', '/static/assets/price.bin']:
        if client.get(path).status_code != 404:
            raise ValueError('Private artifact route is exposed')
    result = {'scope': 'Local official bundle + WSGI only; not platform routing, rate limiting or billing.', 'ready': True, 'prediction': prediction.json['prediccion'], 'query_rows': len(cars.json['car_data']), 'catalog_models': 719, 'locations': 50, 'function_uncompressed_bytes': bundle['uncompressed_bytes'], 'public_bytes': total, 'public_gzip_bytes': compressed, 'public_files': files, 'installed_packages': installed, 'private_artifact_routes_status': 404, 'budgets': budgets}
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({key: result[key] for key in ['ready', 'prediction', 'query_rows', 'function_uncompressed_bytes', 'public_bytes', 'public_gzip_bytes']}, indent=2))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ['package', 'function', 'build-report', 'report']:
        parser.add_argument('--' + name, type=Path, required=True)
    arguments = parser.parse_args()
    check(arguments.package.resolve(), arguments.function.resolve(), arguments.build_report.resolve(), arguments.report.resolve())
