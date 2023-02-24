from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_cors import cross_origin
import joblib

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Carga el modelo desde el archivo
modelo = joblib.load('cars_fit_model.pkl')

@app.route('/')
@cross_origin()
def index():
    # Obtiene el parámetro de la petición GET
    entrada_str = request.args.get('entrada')

    # Convierte la cadena a una lista de valores
    entrada = [float(x) for x in entrada_str.split(',')]

    # Utiliza la lista para hacer las predicciones
    predicciones = modelo.predict([entrada])

    # Crea un diccionario con las predicciones
    respuesta = {'predicciones': list(predicciones)}

    # Devuelve la respuesta en formato JSON
    return jsonify(respuesta)

app.run()