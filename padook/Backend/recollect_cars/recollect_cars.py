
import pymongo

def get_collection():
    # Crea una conexión con la base de datos MongoDB
    client = pymongo.MongoClient("No te voy a dar el link al mongoDB atlas >:)")

    # Selecciona una base de datos específica
    database = client["Coches"]

    # Selecciona una colección específica
    collection = database["Coches"]

    return collection