"""Offline audit of frozen model/category contracts. No training or scraping."""
import collections
import csv
import hashlib
import itertools
import json
import math
import os
from pathlib import Path
import random
import re
import statistics
import sys
import unicodedata

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(os.environ.get('PADDOCK_CONTRACT_DIR', ROOT.parent / '.paddock' / 'model-contract'))
OUT.mkdir(parents=True, exist_ok=True)
BACKEND = ROOT / 'padook/Backend'
EXPECTED_SHA = '1c36a9dca5b7ac0076d6fef0f1c6db9952aba5b42fae92db647b1f4750a11b87'

def sha(path):
    digest = hashlib.sha256()
    with path.open('rb') as f:
        for block in iter(lambda: f.read(1024*1024), b''):
            digest.update(block)
    return digest.hexdigest()

assert sha(BACKEND / 'models/cars_model.pkl') == EXPECTED_SHA
os.chdir(BACKEND)
sys.path.insert(0, str(BACKEND))
import app
import numpy as np
sys.path.insert(0, str(ROOT / 'experiments/model-compact'))
from compact_runtime import PriceForest

def load(relative):
    return json.loads((ROOT / relative).read_text())

def normalize(text):
    return ''.join(c for c in unicodedata.normalize('NFD', text.casefold()) if unicodedata.category(c) != 'Mn')

legacy_models = load('padook/Frontend/assets/json/dic_cars_modelo.json')
legacy_brands = load('padook/Frontend/assets/json/dic_cars_marca.json')
full_models = load('diccionarios/dic_cars_modelo.json')
full_brands = load('diccionarios/dic_cars_marca.json')
assert legacy_models == load('padook/Backend/dictionary/dic_cars_modelo.json')
assert legacy_models == load('diccionarios/dic_cars_modelo_less.json')
assert legacy_brands == full_brands
dart = (ROOT / 'padook/Frontend/lib/widgets/form_input_list/form_input_list.dart').read_text()
def dart_map(name):
    match = re.search(r'\b'+name+r'\s*=\s*\{([^}]+)\}', dart, re.S)
    assert match, name
    return dict(re.findall(r'"([0-9]+)"\s*:\s*"([^"\n]+)"', match.group(1)))
legacy_fuels, legacy_gears = dart_map('fuelDict'), dart_map('gearBoxDict')
groups = [('brands','marca_id','marca'),('models','modelo_id','modelo'),('fuels','combustible_id','combustible'),('gearboxes','cambio_id','cambio')]
maps = {name:{} for name, _, _ in groups}
reverse = {name:{} for name, _, _ in groups}
model_brands = {}
rows_by_model = collections.Counter()
rows_by_fuel = collections.Counter()
physical = ['año','motor (CV)','kilometros','cilindrada','marchas']
fields = physical + ['marca_id','modelo_id','combustible_id','cambio_id']
ranges = {name:[math.inf,-math.inf] for name in physical}
legacy_model_reverse = {name: key for key, name in legacy_models.items()}
legacy_fuel_reverse = {normalize(name):key for key,name in legacy_fuels.items()}
legacy_gear_reverse = {normalize(name):key for key,name in legacy_gears.items()}
legacy_brand_reverse = {name:key for key,name in legacy_brands.items()}
rng = random.Random(20261114)
sample = []
eligible = 0
unsupported = collections.Counter()
filtered_brands = collections.Counter()
rows = 0
fixture_rows = {}
filtered_rows_by_brand = collections.Counter()
with (ROOT / 'datasets/ML/cars_ml.csv').open(newline='') as f:
    reader = csv.DictReader(f)
    columns = reader.fieldnames
    dropped = {'','localidad','marca','modelo','combustible','cambio','motor (KW)','emisiones','plazas','deposito','0-100 km/h','localidad_id','precio'}
    assert [c for c in columns if c not in dropped] == fields
    for row in reader:
        rows += 1
        for name,idcol,labelcol in groups:
            number = float(row[idcol])
            assert number.is_integer() and number >= 0
            key,label = str(int(number)),row[labelcol]
            assert key not in maps[name] or maps[name][key] == label
            assert label not in reverse[name] or reverse[name][label] == key
            maps[name][key],reverse[name][label] = label,key
        model_id = str(int(float(row['modelo_id'])))
        brand_id = str(int(float(row['marca_id'])))
        assert model_id not in model_brands or model_brands[model_id] == brand_id
        model_brands[model_id] = brand_id
        rows_by_model[model_id] += 1
        rows_by_fuel[row['combustible']] += 1
        fixture_rows.setdefault(row['combustible'], {k:row[k] for k in fields+['marca','modelo','combustible','cambio']})
        for name in physical:
            value = float(row[name])
            assert math.isfinite(value)
            ranges[name][0] = min(ranges[name][0],value)
            ranges[name][1] = max(ranges[name][1],value)
        if float(row['precio']) <= 80000 and float(row['kilometros']) < 500000:
            filtered_rows_by_brand[row['marca']] += 1
        reasons = []
        if row['modelo'] not in legacy_model_reverse: reasons.append('model_not_in_legacy_selector')
        if normalize(row['combustible']) not in legacy_fuel_reverse: reasons.append('fuel_not_in_legacy_selector')
        if reasons:
            unsupported.update(reasons)
            continue
        x = [float(row[k]) for k in fields]
        legacy_x = x[:5] + [float(legacy_brand_reverse[row['marca']]),float(legacy_model_reverse[row['modelo']]),float(legacy_fuel_reverse[normalize(row['combustible'])]),float(legacy_gear_reverse[normalize(row['cambio'])])]
        eligible += 1
        case = {'canonical':x,'legacy':legacy_x}
        if len(sample)<2000: sample.append(case)
        else:
            j=rng.randrange(eligible)
            if j<len(sample): sample[j]=case

assert maps['models'] == full_models and maps['brands'] == full_brands
aligned_rows = 0
aligned_fields = ['localidad','marca','modelo','año','motor (CV)','kilometros','combustible','cambio','precio','cilindrada','marchas']
numeric_fields = set(physical+['precio'])
with (ROOT/'datasets/car_data.csv').open(newline='') as raw_file, (ROOT/'datasets/ML/cars_ml.csv').open(newline='') as ml_file:
    for raw_row,ml_row in itertools.zip_longest(csv.DictReader(raw_file),csv.DictReader(ml_file)):
        assert raw_row is not None and ml_row is not None
        for field in aligned_fields:
            assert (float(raw_row[field]) == float(ml_row[field])) if field in numeric_fields else (raw_row[field] == ml_row[field]), (aligned_rows,field)
        aligned_rows += 1
assert aligned_rows == rows
for key in maps:
    maps[key] = dict(sorted(maps[key].items(),key=lambda p:int(p[0])))
def crosswalk(legacy,category,normalized=False):
    lookup = {normalize(label) if normalized else label:key for key,label in maps[category].items()}
    return {key:{'label':label,'canonical_id':lookup[normalize(label) if normalized else label]} for key,label in legacy.items()}
walk = {'brands':crosswalk(legacy_brands,'brands'),'models':crosswalk(legacy_models,'models'),'fuels':crosswalk(legacy_fuels,'fuels',True),'gearboxes':crosswalk(legacy_gears,'gearboxes',True)}
changed = {group:sum(key != item['canonical_id'] for key,item in mapping.items()) for group,mapping in walk.items()}
assert changed['brands'] == 0 and changed['gearboxes'] == 0
assert changed['models'] == len(legacy_models)
assert walk['fuels']['4']['canonical_id'] == '5'
assert walk['models']['0']['canonical_id'] == '1'
assert reverse['models']['Citroen C3 aircross'] == '118'

thresholds = {}
names = ['year','horses','km','displ_engine','marches','card_brand_id','model_id','fuel_id','gearbox_id']
for i,name in enumerate(names):
    values = np.concatenate([t.tree_.threshold[t.tree_.feature==i] for t in app.car_model.estimators_])
    thresholds[name] = {'split_count':len(values),'minimum':float(values.min()),'maximum':float(values.max())}
assert thresholds['model_id']['maximum'] > max(map(int,legacy_models))
assert app.car_model.n_features_in_ == len(names) == 9
root_weights = sorted({int(t.tree_.weighted_n_node_samples[0]) for t in app.car_model.estimators_})
filtered_rows = sum(count for count in filtered_rows_by_brand.values() if count >= 10)
expected_train = filtered_rows - math.ceil(filtered_rows*.2)

candidate_path = ROOT.parent / '.paddock/model-evaluation/cars.compact.bin'
assert sha(candidate_path) == load('experiments/model-compact/comparison.json')['artifacts']['cars.compact.bin']['sha256']
compact = PriceForest(candidate_path)
canonical_x = np.array([r['canonical'] for r in sample])
legacy_x = np.array([r['legacy'] for r in sample])
canonical_predictions = app.car_model.predict(canonical_x)
legacy_predictions = app.car_model.predict(legacy_x)
compact_predictions = np.array([compact.predict_one(r['canonical']) for r in sample])
assert np.array_equal(canonical_predictions,compact_predictions)
diff = np.abs(canonical_predictions - legacy_predictions)

contract = {
 'schema_version':1,
 'catalog_version':'tfm-original-csv-v1',
 'status':'candidate_for_integration_not_deployed',
 'model_policy':{'frozen':True,'new_scraping':False,'retraining':False,'note':'The compact representation preserves the same frozen trees; no new model is trained.'},
 'model_sha256':EXPECTED_SHA,
 'dataset_sha256':sha(ROOT/'datasets/ML/cars_ml.csv'),
 'raw_dataset_sha256':sha(ROOT/'datasets/car_data.csv'),
 'raw_and_ml_csv_aligned_rows':aligned_rows,
 'dataset_rows':rows,
 'feature_order':names,
 'csv_feature_order':fields,
 'numeric_behavior':{'input_dtype':'float32','tree_threshold_dtype':'float64','categorical_ids':'original CSV IDs, never renumbered after filtering'},
 'categories':maps,
 'model_brand_ids':dict(sorted(model_brands.items(),key=lambda x:int(x[0]))),
 'legacy_selector_model_ids':{key:walk['models'][key]['canonical_id'] for key in legacy_models},
 'ui_policy':{'initial_model_catalog':'Use the 542 historical selector labels, translated to original CSV IDs; do not renumber them.','initial_fuel_catalog':'Use the seven historical selector labels translated through the explicit crosswalk; retain all eight CSV categories for the catalog.','other_csv_categories':'Presence in CSV does not establish fitted training coverage. Do not silently expand supported predictions.','legacy_requests':'Never infer encoding from the numeric ID. Require an explicit catalog/API version or a separate legacy adapter.'},
 'observed_physical_ranges_not_training_bounds':ranges,
 'coverage_warning':'Dictionary presence and CSV ranges do not establish coverage in the fitted training split. Do not advertise prices as current market valuations.',
 'provenance':{'status':'partially_reconstructed','evidence':'CSV mappings, notebook feature order, application order, and fitted tree split ranges agree with original categorical IDs. Semantic labels are not embedded in the estimator.','root_bootstrap_weights':root_weights,'notebook_filtered_rows':filtered_rows,'notebook_expected_training_rows':expected_train,'exact_training_dataset_and_random_split_recovered':False}
}
report = {
 'rows_checked':rows,
 'mapping_conflicts':0,
 'raw_and_ml_semantic_alignment':{'rows':aligned_rows,'fields':aligned_fields,'differences':0},
 'category_counts':{k:len(v) for k,v in maps.items()},
 'model_to_brand_conflicts':0,
 'legacy_ids_requiring_translation':changed,
 'legacy_selector_eligible_rows':eligible,
 'legacy_selector_unsupported_reason_counts':dict(unsupported),
 'fuel_row_counts':dict(rows_by_fuel),
 'thresholds':thresholds,
 'legacy_reduced_model_id_maximum':max(map(int,legacy_models)),
 'fitted_tree_model_id_threshold_maximum':thresholds['model_id']['maximum'],
 'root_bootstrap_weights':root_weights,
 'notebook_filtered_rows':filtered_rows,
 'notebook_expected_training_rows':expected_train,
 'exact_training_population_recovered':root_weights == [expected_train],
 'input_reencoding_comparison':{'seed':20261114,'cases':len(sample),'cases_with_different_predictions':int(np.count_nonzero(diff)),'median_absolute_price_change':float(np.median(diff)),'maximum_absolute_price_change':float(diff.max()),'compact_vs_original_maximum_difference':float(np.max(np.abs(canonical_predictions-compact_predictions))),'warning':'Change caused by correcting categorical encoding, not retraining. This is not an accuracy evaluation or held-out validation.'}
}
fixtures=[]
for fuel,row in fixture_rows.items():
    vector=[float(row[k]) for k in fields]
    predicted=float(app.car_model.predict([vector])[0])
    assert compact.predict_one(vector) == predicted
    fixtures.append({'labels':{k:row[k] for k in ['marca','modelo','combustible','cambio']},'physical_features':{k:float(row[k]) for k in physical},'expected_vector':vector,'expected_original_prediction':predicted,'warning':'Regression fixture, not an accuracy or training-coverage claim.'})
for name,value in [('feature-contract.json',contract),('legacy-to-canonical.json',walk),('audit.json',report),('golden-contract-cases.json',fixtures)]:
    (OUT/name).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(report,ensure_ascii=False,indent=2))
