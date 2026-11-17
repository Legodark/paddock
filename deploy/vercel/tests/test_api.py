import json
import os
from pathlib import Path
import sqlite3
import struct
import sys
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0,str(ROOT/'deploy/vercel'))
from paddock_service.app import CATALOG_VERSION, create_app, Resources
from paddock_service.forest import ArtifactError, PriceForest


class ApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.assets = Path(os.environ['PADDOCK_ASSET_DIR'])
        cls.app = create_app(cls.assets)
        cls.client = cls.app.test_client()
        cls.fixture = json.loads((ROOT/'experiments/model-contract/golden-contract-cases.json').read_text())[0]
        x = cls.fixture['expected_vector']
        cls.valid = dict(zip(['year','horses','km','displ_engine','marches','brand_id','model_id','fuel_id','gearbox_id'],x))
        for key in ['brand_id','model_id','fuel_id','gearbox_id']:
            cls.valid[key] = str(int(cls.valid[key]))
        cls.valid['catalog_version'] = CATALOG_VERSION

    @classmethod
    def tearDownClass(cls):
        cls.app.extensions['paddock_close']()

    def test_ready_checks_models_and_snapshot(self):
        response = self.client.get('/api/v1/health')
        self.assertEqual(response.status_code,200)
        self.assertTrue(response.json['ready'])
        self.assertTrue(response.json['frozen_model'])

    def test_catalog_keeps_original_ids_and_limits_selector_scope(self):
        response = self.client.get('/api/v1/catalog')
        self.assertEqual(response.status_code,200)
        catalog = response.json
        self.assertEqual(catalog['catalog_version'],CATALOG_VERSION)
        self.assertEqual(len(catalog['models']),542)
        self.assertEqual(catalog['models']['118']['label'],'Citroen C3 aircross')
        self.assertEqual(catalog['fuels']['5'],'Gasolina y corriente eléctrica')
        self.assertNotIn('4',catalog['fuels'])

    def test_full_prediction_uses_golden_model_and_real_comparables(self):
        response = self.client.post('/api/v1/predict',json=self.valid)
        self.assertEqual(response.status_code,200,response.json)
        data = response.json
        self.assertEqual(data['prediccion'],self.fixture['expected_original_prediction'])
        self.assertLessEqual(data['precio-minimo'],data['prediccion'])
        self.assertGreaterEqual(data['precio-maximo'],data['prediccion'])
        self.assertTrue(data['coches-baratos'] or data['coches-caros'])
        con = sqlite3.connect(self.assets/'cars.sqlite3')
        try:
            for key in ['coches-baratos','coches-caros']:
                self.assertLessEqual(len(data[key]),5)
                for row in data[key]:
                    self.assertEqual(row['modelo'],self.fixture['labels']['modelo'])
                    count = con.execute('SELECT count(*) FROM cars WHERE model=? AND price=? AND km=? AND year=?',(row['modelo'],row['precio'],row['kilometros'],row['año'])).fetchone()[0]
                    self.assertGreater(count,0)
        finally:
            con.close()

    def test_all_exposed_golden_categories_preserve_prediction(self):
        fixtures = json.loads((ROOT/'experiments/model-contract/golden-contract-cases.json').read_text())
        models = self.client.get('/api/v1/catalog').json['models']
        executed = 0
        for case in fixtures:
            x = case['expected_vector']
            if str(int(x[6])) not in models or int(x[7]) == 4:
                continue
            data = dict(zip(['year','horses','km','displ_engine','marches','brand_id','model_id','fuel_id','gearbox_id'],x))
            for key in ['brand_id','model_id','fuel_id','gearbox_id']:
                data[key] = str(int(data[key]))
            data['catalog_version'] = CATALOG_VERSION
            response = self.client.post('/api/v1/predict',json=data)
            self.assertEqual(response.status_code,200,response.json)
            self.assertEqual(response.json['prediccion'],case['expected_original_prediction'])
            executed += 1
        self.assertGreaterEqual(executed,5)

    def test_malformed_or_ambiguous_prediction_is_rejected(self):
        changes = [{'catalog_version':'legacy-542'},{'brand_id':'0'},{'model_id':'../../x'},{'fuel_id':'4'},{'year':2026},{'km':-1},{'km':500000},{'horses':True},{'horses':float('nan')},{'horses':float('inf')},{'horses':10**400},{'marches':2.5},{'extra':1}]
        for change in changes:
            with self.subTest(change=list(change)):
                response = self.client.post('/api/v1/predict',json=self.valid|change)
                self.assertEqual(response.status_code,400,response.json)
        self.assertEqual(self.client.post('/api/v1/predict',data='{}',content_type='text/plain').status_code,415)
        self.assertEqual(self.client.post('/api/v1/predict',json={}).status_code,400)
        self.assertEqual(self.client.post('/api/v1/predict',data='{',content_type='application/json').status_code,400)

    def test_message_classification_and_limits(self):
        for message,expected in [('Muestrame Citroen C3',0),('muestrame coche c3',1),('Mercedes de Málaga con precio inferior a 50000 euros',1),('Hola, ¿qué tiempo hace mañana?',0)]:
            response = self.client.post('/api/v1/message',json={'message':message})
            self.assertEqual(response.status_code,200)
            self.assertEqual(response.json['contexto'],expected)
        for message in ['', '   ', 'x'*2001,None]:
            self.assertEqual(self.client.post('/api/v1/message',json={'message':message}).status_code,400)
        self.assertEqual(self.client.post('/api/v1/message',json={'message':'x'*20000}).status_code,413)

    def test_query_numeric_filters_and_limit(self):
        response = self.client.get('/api/v1/cars',query_string={'brand_id':'10','year_min':2018,'price_max':30000,'km_max':80000,'horses_min':100,'limit':3})
        self.assertEqual(response.status_code,200,response.json)
        self.assertEqual(len(response.json['car_data']),3)
        for row in response.json['car_data']:
            self.assertEqual(row['brand'],'Citroen')
            self.assertGreaterEqual(row['year'],2018)
            self.assertGreaterEqual(row['horses'],100)
            self.assertLessEqual(row['km'],80000)
            self.assertLessEqual(row['price'],30000)
        self.assertLessEqual(len(self.client.get('/api/v1/cars').json['car_data']),10)

    def test_query_rejects_injection_nonfinite_and_duplicate_inputs(self):
        for query in ['brand_id=10%27+OR+1=1--','price_min=nan','year_min=inf','limit=100','limit=-1','limit=1&limit=2','unknown=1','price_min='+'9'*3000]:
            self.assertEqual(self.client.get('/api/v1/cars?'+query).status_code,400)

    def test_search_catalog_includes_snapshot_locations_and_all_query_categories(self):
        response = self.client.get('/api/v1/search-catalog')
        self.assertEqual(response.status_code,200)
        self.assertEqual(response.json['catalog_version'],CATALOG_VERSION)
        self.assertTrue(response.json['historical'])
        self.assertEqual(len(response.json['models']),719)
        self.assertEqual(len(response.json['fuels']),8)
        self.assertEqual(len(response.json['locations']),50)
        self.assertIn('Málaga',response.json['locations'])
        self.assertEqual(response.json['models']['118']['brand_id'],'10')
        self.assertEqual(len(self.client.get('/api/v1/catalog').json['models']),542)

    def test_query_location_and_strict_bounds_match_snapshot(self):
        response = self.client.get('/api/v1/cars',query_string={'brand_id':'10','location':'Málaga','price_lt':20000,'km_lt':100000,'horses_gt':100,'year_gt':2010})
        self.assertEqual(response.status_code,200,response.json)
        self.assertGreater(len(response.json['car_data']),0)
        for row in response.json['car_data']:
            self.assertEqual(row['location'],'Málaga')
            self.assertEqual(row['brand'],'Citroen')
            self.assertLess(row['price'],20000)
            self.assertLess(row['km'],100000)
            self.assertGreater(row['horses'],100)
            self.assertGreater(row['year'],2010)
        # A real exact mileage match exercises the original Dart/Mongo km/year bug.
        with sqlite3.connect(self.assets/'cars.sqlite3') as con:
            mileage = con.execute('SELECT km FROM cars WHERE model=? AND km>1000 LIMIT 1',('Citroen C3 aircross',)).fetchone()[0]
        exact = self.client.get('/api/v1/cars',query_string={'model_id':'118','km_min':mileage,'km_max':mileage})
        self.assertEqual(exact.status_code,200)
        self.assertGreater(len(exact.json['car_data']),0)
        self.assertTrue(all(row['km']==mileage for row in exact.json['car_data']))

    def test_query_rejects_conflicts_locations_and_ambiguous_bounds(self):
        for query in ['location=Mars','location=M%C3%A1laga%27%20OR%201=1--','location=Madrid&location=M%C3%A1laga',
                      'brand_id=0&model_id=118','price_min=20000&price_lt=20000','price_gt=20000&price_max=20000',
                      'year_min=2020&year_max=2018','year_gt=2018.5','marches_lt=5.5','price_gt=nan','price_lte=20000']:
            with self.subTest(query=query):
                self.assertEqual(self.client.get('/api/v1/cars?'+query).status_code,400)

    def test_query_comparison_boundary_is_not_silently_inclusive(self):
        exact = self.client.get('/api/v1/cars',query_string={'brand_id':'10','location':'Málaga','price_min':1900,'price_max':1900})
        self.assertEqual(exact.status_code,200)
        self.assertGreater(len(exact.json['car_data']),0)
        strict = self.client.get('/api/v1/cars',query_string={'brand_id':'10','location':'Málaga','price_gt':1900})
        self.assertEqual(strict.status_code,200)
        self.assertGreater(len(strict.json['car_data']),0)
        self.assertTrue(all(row['price']>1900 for row in strict.json['car_data']))

    def test_no_broad_cors_or_artifact_route(self):
        response = self.client.get('/api/v1/health',headers={'Origin':'https://evil.example'})
        self.assertNotIn('Access-Control-Allow-Origin',response.headers)
        self.assertEqual(response.headers['Cache-Control'],'no-store')
        self.assertEqual(response.headers['X-Content-Type-Options'],'nosniff')
        for path in ['/assets/price.bin','/assets/manifest.json','/api/../assets/contract.json','/static/assets/price.bin']:
            self.assertEqual(self.client.get(path).status_code,404)

    def test_database_connection_is_read_only(self):
        r = Resources(self.assets)
        try:
            with r.connect() as con:
                with self.assertRaises(sqlite3.OperationalError):
                    con.execute('DELETE FROM cars')
        finally:
            r.close()

    def test_integrity_failure_is_not_a_ready_service(self):
        with tempfile.TemporaryDirectory() as directory:
            manifest = json.loads((self.assets/'manifest.json').read_text())
            manifest['files']['price.bin']['bytes'] = 1
            Path(directory,'manifest.json').write_text(json.dumps(manifest))
            app = create_app(directory)
            response = app.test_client().get('/api/v1/health')
            self.assertEqual(response.status_code,503)
            self.assertNotIn(directory,response.get_data(as_text=True))
            app.extensions['paddock_close']()

    def test_no_ml_dependency_loaded(self):
        self.assertFalse(any(name.split('.')[0] in {'numpy','sklearn','scipy','joblib','pymongo'} for name in sys.modules))


class ForestFormatTests(unittest.TestCase):
    def test_truncated_and_out_of_tree_children_are_rejected(self):
        for kind in ['truncated','invalid_child']:
            with self.subTest(kind=kind),tempfile.TemporaryDirectory() as directory:
                path = Path(directory,'bad.bin')
                if kind == 'truncated':
                    path.write_bytes(b'bad')
                else:
                    # 100 one-node trees; first root cannot have children.
                    header = struct.pack('<8sIIQ',b'PADRF001',1,100,100)
                    roots = struct.pack('<100I',*range(100))
                    features = bytes([0]+[255]*99)
                    padding = b'\0'*((-(len(header)+len(roots)+len(features)))%8)
                    path.write_bytes(header+roots+features+padding+struct.pack('<100d',*([1.0]*100))+struct.pack('<100I',*([2]+[0]*99)))
                with self.assertRaises((ArtifactError,ValueError)):
                    PriceForest(path)
