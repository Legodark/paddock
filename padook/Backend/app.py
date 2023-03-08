from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_cors import cross_origin
from tokenizer.tokenizer import Tokenizer
from queries.query_cars import *
from recollect_cars.recollect_cars import get_collection
from sklearn.feature_extraction.text import CountVectorizer
import joblib
import json
import pymongo

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Carga el modelo desde el archivo
car_model = joblib.load('models/cars_model.pkl')
json_file = open('dictionary/dic_cars_modelo.json')
model_dictionary = json.load(json_file)
message_model, vectorizer = joblib.load('models/message_model.pkl')

@app.route('/car_predict')
@cross_origin()
def car_api():
    try:
        # Obtiene el parámetro de la petición GET
        year = request.args.get('year')
        horses = request.args.get('horses')
        km = request.args.get('km')
        displ_engine = request.args.get('displ_engine')
        marches = request.args.get('marches')
        card_brand_id = request.args.get('card_brand_id')
        model_id = request.args.get('model_id')
        fuel_id = request.args.get('fuel_id')
        gearbox_id = request.args.get('gearbox_id')

        # Utiliza la lista para hacer las predicciones
        prediction = car_model.predict([[year, horses, km, displ_engine, marches, card_brand_id, model_id, fuel_id, gearbox_id]])

        # Consigue la coleccion de mongodb
        collection = get_collection()

        # Crea un diccionario con las predicciones
        response = {'prediccion': list(prediction)[0],
                    'precio-minimo': get_min_price_from_model(collection,  model_dictionary[model_id], list(prediction)[0]),
                    'precio-maximo': get_max_price_from_model(collection, model_dictionary[model_id], list(prediction)[0]),
                    }
    except ValueError:
        response = {"error": "No pusiste los parametros correctos"}

    # Devuelve la respuesta en formato JSON
    return jsonify(response)

@app.route('/message_clasify')
@cross_origin()
def message_api():
    try:
        # Obtiene el parámetro de la petición GET
        message = request.args.get("message")

        # Utiliza la lista para hacer las predicciones
        prediction = message_model.predict(vectorizer.transform([message]))
        print(prediction)
        # Crea un diccionario con las predicciones
        response = {'prediccion': int(list(prediction)[0])}
    except ValueError:
        response = {"error": "No pusiste los parametros correctos"}

    # Devuelve la respuesta en formato JSON
    return jsonify(response)

app.run()