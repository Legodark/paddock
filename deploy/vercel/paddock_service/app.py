"""Candidate API. Frozen models/data, versioned canonical IDs, read-only SQLite."""
import atexit
from contextlib import contextmanager
import hashlib
import json
import math
import os
from pathlib import Path
import sqlite3
import threading

from flask import Flask, jsonify, request
from werkzeug.exceptions import BadRequest, HTTPException, ServiceUnavailable

from .forest import ArtifactError, MessageForest, PriceForest

CATALOG_VERSION = 'tfm-original-csv-v1'
MODEL_SHA = '1c36a9dca5b7ac0076d6fef0f1c6db9952aba5b42fae92db647b1f4750a11b87'
RELEASE_FILES = {
    'price.bin':'862e15962e6866b34a36d9f13906dcdcaf8aba6b9023fd028a47290a8c7984b7',
    'message.json.gz':'820505cfffa425d4c8502e7dcfe08aff37de25e6ad029a546daa9cd6376d0470',
}


def digest(path):
    h = hashlib.sha256()
    with path.open('rb') as f:
        for block in iter(lambda:f.read(1024*1024),b''):
            h.update(block)
    return h.hexdigest()


class Resources:
    def __init__(self,directory):
        self.directory = Path(directory)
        manifest = json.loads((self.directory/'manifest.json').read_text())
        required = {'price.bin','message.json.gz','contract.json','legacy.json','cars.sqlite3'}
        if manifest.get('version') != 1 or set(manifest['files']) != required:
            raise ArtifactError('Unexpected artifact manifest')
        for name in sorted(required):
            path = self.directory/name
            if path.is_symlink() or not path.is_file() or path.stat().st_size != manifest['files'][name]['bytes']:
                raise ArtifactError('Unexpected artifact file')
            actual = digest(path)
            if actual != manifest['files'][name]['sha256'] or (name in RELEASE_FILES and actual != RELEASE_FILES[name]):
                raise ArtifactError('Artifact checksum mismatch')
        self.contract = json.loads((self.directory/'contract.json').read_text())
        legacy = json.loads((self.directory/'legacy.json').read_text())
        if self.contract['catalog_version'] != CATALOG_VERSION or self.contract['model_sha256'] != MODEL_SHA:
            raise ArtifactError('Unexpected catalog version')
        self.models = {x['canonical_id'] for x in legacy['models'].values()}
        self.fuels = {x['canonical_id'] for x in legacy['fuels'].values()}
        self.catalog = self.contract['categories']
        self.database = self.directory/'cars.sqlite3'
        with self.connect() as con:
            if con.execute('SELECT count(*) FROM cars').fetchone()[0] != self.contract['dataset_rows']:
                raise ArtifactError('Unexpected catalog row count')
            self.locations = tuple(row[0] for row in con.execute('SELECT DISTINCT location FROM cars ORDER BY location'))
        self.price = PriceForest(self.directory/'price.bin')
        try:
            self.message = MessageForest(self.directory/'message.json.gz')
        except Exception:
            self.price.close()
            raise

    @contextmanager
    def connect(self):
        con = sqlite3.connect(self.database.as_uri()+'?mode=ro&immutable=1',uri=True)
        try:
            con.row_factory = sqlite3.Row
            con.execute('PRAGMA query_only=ON')
            yield con
        finally:
            con.close()

    def close(self):
        self.price.close()


def number(value,minimum,maximum,integer=False):
    if isinstance(value,bool) or not isinstance(value,(int,float)):
        raise BadRequest('Se requiere un número finito.')
    try:
        value = float(value)
    except OverflowError:
        raise BadRequest('Valor fuera del rango admitido.') from None
    if not math.isfinite(value):
        raise BadRequest('Se requiere un número finito.')
    if not minimum <= value <= maximum or (integer and not value.is_integer()):
        raise BadRequest('Valor fuera del rango admitido.')
    return float(value)


def category(value,mapping):
    if isinstance(value,bool) or not isinstance(value,(str,int)):
        raise BadRequest('Identificador de categoría inválido.')
    key = str(value)
    if key not in mapping:
        raise BadRequest('Categoría no admitida.')
    return key


def body(fields):
    if not request.is_json:
        from werkzeug.exceptions import UnsupportedMediaType
        raise UnsupportedMediaType('Se requiere JSON.')
    data = request.get_json()
    if not isinstance(data,dict) or set(data) != set(fields):
        raise BadRequest('Campos ausentes o desconocidos.')
    return data


def create_app(asset_dir=None):
    app = Flask(__name__,static_folder=None)
    app.config.update(MAX_CONTENT_LENGTH=16384,JSON_SORT_KEYS=False)
    directory = Path(asset_dir or os.environ.get('PADDOCK_ASSET_DIR') or Path(__file__).resolve().parent.parent/'assets').resolve()
    lock = threading.Lock()
    state = {}

    def resources():
        if 'resources' not in state:
            with lock:
                if 'resources' not in state:
                    try:
                        state['resources'] = Resources(directory)
                    except Exception as exc:
                        app.logger.error('asset_initialization_failed: %s',type(exc).__name__)
                        raise ServiceUnavailable('El servicio no está disponible.') from None
        return state['resources']

    def close():
        if 'resources' in state:
            state.pop('resources').close()
    app.extensions['paddock_close'] = close
    atexit.register(close)

    @app.before_request
    def bound_query_string():
        if len(request.query_string) > 2048:
            raise BadRequest('La consulta es demasiado larga.')

    @app.after_request
    def headers(response):
        response.headers['Cache-Control'] = 'no-store'
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['Referrer-Policy'] = 'no-referrer'
        response.headers['Content-Security-Policy'] = "default-src 'none'; frame-ancestors 'none'"
        return response

    @app.errorhandler(HTTPException)
    def http_error(exc):
        message = exc.description if exc.code in {400,415,503} else 'Solicitud no admitida.'
        return jsonify(error={'code':exc.code,'message':message}),exc.code

    @app.errorhandler(Exception)
    def unexpected(exc):
        app.logger.error('request_failed: %s',type(exc).__name__)
        return jsonify(error={'code':500,'message':'No se pudo completar la solicitud.'}),500

    @app.get('/api/v1/health')
    def health():
        resources()
        return jsonify(ready=True,catalog_version=CATALOG_VERSION,frozen_model=True)

    @app.get('/api/v1/catalog')
    def catalog():
        r = resources()
        models = {key:{'label':r.catalog['models'][key],'brand_id':r.contract['model_brand_ids'][key]} for key in sorted(r.models,key=int)}
        brand_ids = {item['brand_id'] for item in models.values()}
        return jsonify(catalog_version=CATALOG_VERSION,brands={key:r.catalog['brands'][key] for key in sorted(brand_ids,key=int)},models=models,fuels={key:r.catalog['fuels'][key] for key in sorted(r.fuels,key=int)},gearboxes=r.catalog['gearboxes'],historical=True)

    @app.post('/api/v1/predict')
    def predict():
        data = body(['catalog_version','year','horses','km','displ_engine','marches','brand_id','model_id','fuel_id','gearbox_id'])
        if data['catalog_version'] != CATALOG_VERSION:
            raise BadRequest('Versión del catálogo incompatible.')
        r = resources()
        brand_id = category(data['brand_id'],r.catalog['brands'])
        model_id = category(data['model_id'],r.models)
        fuel_id = category(data['fuel_id'],r.fuels)
        gear_id = category(data['gearbox_id'],r.catalog['gearboxes'])
        if r.contract['model_brand_ids'][model_id] != brand_id:
            raise BadRequest('El modelo no pertenece a la marca seleccionada.')
        values = [number(data['year'],1993,2023,True),number(data['horses'],1,887),number(data['km'],0,499999),number(data['displ_engine'],0,8300),number(data['marches'],0,10,True),int(brand_id),int(model_id),int(fuel_id),int(gear_id)]
        price = r.price.predict_one(values)
        model = r.catalog['models'][model_id]
        with r.connect() as con:
            low = con.execute('SELECT min(price) FROM cars WHERE model=? AND price BETWEEN ? AND ?',(model,price-5000,price)).fetchone()[0]
            high = con.execute('SELECT max(price) FROM cars WHERE model=? AND price BETWEEN ? AND ?',(model,price,price+5000)).fetchone()[0]
            fields = 'model AS modelo,km AS kilometros,price AS precio,year AS año'
            cheap = [dict(row) for row in con.execute(f'SELECT {fields} FROM cars WHERE model=? AND price BETWEEN ? AND ? ORDER BY price ASC,id ASC LIMIT 5',(model,price-5000,price))]
            expensive = [dict(row) for row in con.execute(f'SELECT {fields} FROM cars WHERE model=? AND price BETWEEN ? AND ? ORDER BY price DESC,id ASC LIMIT 5',(model,price,price+5000))]
        return jsonify(catalog_version=CATALOG_VERSION,prediccion=price,**{'precio-minimo':price if low is None else low,'precio-maximo':price if high is None else high,'coches-baratos':cheap,'coches-caros':expensive},historical=True)

    @app.get('/api/v1/search-catalog')
    def search_catalog():
        r = resources()
        models = {key:{'label':label,'brand_id':r.contract['model_brand_ids'][key]} for key,label in r.catalog['models'].items()}
        return jsonify(catalog_version=CATALOG_VERSION,brands=r.catalog['brands'],models=models,fuels=r.catalog['fuels'],gearboxes=r.catalog['gearboxes'],locations=r.locations,historical=True)

    @app.post('/api/v1/message')
    def message():
        data = body(['message'])
        if not isinstance(data['message'],str) or not 1 <= len(data['message']) <= 2000 or not data['message'].strip():
            raise BadRequest('El mensaje debe tener entre 1 y 2000 caracteres.')
        return jsonify(contexto=resources().message.predict_one(data['message']),historical=True)

    @app.get('/api/v1/cars')
    def cars():
        numeric = {'year':(1993,2023),'horses':(0,887),'km':(0,2890000),'engine':(0,8300),'marches':(0,10),'price':(0,10000000)}
        categorical = {'brand_id':('brands','brand'),'model_id':('models','model'),'fuel_id':('fuels','fuel'),'gearbox_id':('gearboxes','gearbox')}
        allowed = {'limit','location'} | set(categorical) | {name+'_'+bound for name in numeric for bound in ['min','max','gt','lt']}
        if set(request.args)-allowed or any(len(request.args.getlist(k)) != 1 for k in request.args):
            raise BadRequest('Filtro desconocido o duplicado.')
        r = resources()
        conditions,params = [],[]
        if 'brand_id' in request.args and 'model_id' in request.args:
            brand = category(request.args['brand_id'],r.catalog['brands'])
            model = category(request.args['model_id'],r.catalog['models'])
            if r.contract['model_brand_ids'][model] != brand:
                raise BadRequest('El modelo no pertenece a la marca seleccionada.')
        if 'location' in request.args:
            if request.args['location'] not in r.locations:
                raise BadRequest('Provincia no admitida.')
            conditions.append('location=?')
            params.append(request.args['location'])
        for key,(group,column) in categorical.items():
            if key in request.args:
                value = category(request.args[key],r.catalog[group])
                conditions.append(column+'=?')
                params.append(r.catalog[group][value])
        for name,(minimum,maximum) in numeric.items():
            bounds = []
            for suffix,operator in [('min','>='),('max','<='),('gt','>'),('lt','<')]:
                key = name+'_'+suffix
                if key in request.args:
                    try:
                        value = float(request.args[key])
                    except ValueError:
                        raise BadRequest('Filtro numérico inválido.') from None
                    value = number(value,minimum,maximum,integer=name in {'year','marches'})
                    conditions.append(name+operator+'?')
                    params.append(value)
                    bounds.append((suffix,value))
            lower = [(value,suffix == 'gt') for suffix,value in bounds if suffix in {'min','gt'}]
            upper = [(value,suffix == 'lt') for suffix,value in bounds if suffix in {'max','lt'}]
            if lower and upper:
                low,low_strict = max(lower)
                high,high_strict = min(upper,key=lambda bound:(bound[0],not bound[1]))
                if low > high or (low == high and (low_strict or high_strict)):
                    raise BadRequest('Los límites del filtro son incompatibles.')
        try:
            limit = int(request.args.get('limit','10'))
        except ValueError:
            raise BadRequest('Límite inválido.') from None
        number(limit,1,10,True)
        where = ' AND '.join(conditions) if conditions else '1=1'
        with r.connect() as con:
            rows = [dict(row) for row in con.execute('SELECT location,brand,model,year,horses,km,fuel,gearbox,price,engine,marches FROM cars WHERE '+where+' ORDER BY price ASC,year ASC,id ASC LIMIT ?',params+[limit])]
        return jsonify(car_data=rows,historical=True)

    return app
