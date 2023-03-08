
import pymongo

def get_collection():
    # Crea una conexión con la base de datos MongoDB
    client = pymongo.MongoClient("mongodb+srv://oportnersaladillo:Y1Qnv81Dvoi7pIwY@cluster0.sdgcsdz.mongodb.net/test")

    # Selecciona una base de datos específica
    database = client["Coches"]

    # Selecciona una colección específica
    collection = database["Coches"]

    return collection