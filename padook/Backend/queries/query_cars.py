import pymongo


def get_min_price_from_model(collection, model, price):
    result = collection.aggregate([
        {'$match': {'modelo': model}},
        {'$addFields': {'decimal_price': {'$toDouble': '$precio'}}},
        {'$match': {'decimal_price': {"$gte": price - 5000, "$lte": price}}},
        {'$sort': {'decimal_price': -1}},
        {'$group': {'_id': None, 'min_value': {'$min': '$decimal_price'}}}
    ])

    try:
        return result.next()['min_value']
    except StopIteration:
        return price


def get_max_price_from_model(collection, model, price):
    pipeline = [
        {'$match': {'modelo': model}},
        {'$addFields': {'decimal_price': {'$toDouble': '$precio'}}},
        {'$match': {'decimal_price': {"$gte": price, "$lte": price + 5000}}},
        {'$sort': {'decimal_price': -1}},
        {'$group': {'_id': None, 'max_value': {'$max': '$decimal_price'}}}
    ]
    result = collection.aggregate(pipeline)
    try:
        return result.next()['max_value']
    except StopIteration:
        return price


def get_cheapest_cars(collection, model, price):
    pipeline = [
        {'$match': {'modelo': model}},
        {'$addFields': {'decimal_price': {'$toDouble': '$precio'}}},
        {'$match': {'decimal_price': {"$gte": price - 5000, "$lte": price}}},
        {'$sort': {'decimal_price': 1}},
        {'$project': {"_id": 0, "modelo": 1, "kilometros": 1, "precio": 1, "año": 1}},
        {'$limit': 5}
    ]
    result = collection.aggregate(pipeline)
    list = []
    for document in result:
        list.append(document)
    return list


def get_most_expensive_cars(collection, model, price):
    pipeline = [
        {'$match': {'modelo': model}},
        {'$addFields': {'decimal_price': {'$toDouble': '$precio'}}},
        {'$match': {'decimal_price': {"$gte": price, "$lte": price + 5000}}},
        {'$sort': {'decimal_price': -1}},
        {'$project': {"_id": 0, "modelo": 1, "kilometros": 1, "precio": 1, "año": 1}},
        {'$limit': 5}
    ]
    result = collection.aggregate(pipeline)
    list = []
    for document in result:
        list.append(document)
    return list


# Esta funcion se usa cuando la aplicación flutter manda un mensaje del usuario y se encarga de extraer
# Los coches segun sus propiedades

def get_multiple_cars(collection, brand, model, year, year_condition, horses, horses_condition, km, km_condition, fuel,
                      gearbox, location, price, price_condition, displ_engine, displ_engine_condition, marches, sample):
    match = check_fields_is_not_empty(brand, model, year, year_condition, horses, horses_condition, km, km_condition,
                                      fuel,
                                      gearbox, location, price, price_condition, displ_engine, displ_engine_condition,
                                      marches)
    pipeline = [
        {'$addFields': {'precio_numerico': {'$toDouble': '$precio'},
                        'año_numerico': {'$toDouble': '$año'},
                        'caballos_numerico': {'$toDouble': '$motor (CV)'},
                        'cilindrada_numerico': {'$toDouble': '$cilindrada'},
                        'kilometros_numerico': {'$toDouble': '$kilometros'},
                        'marchas_numerico': {'$toDouble': '$marchas'}}},
        {'$match': match},
        {'$project': {"_id": 0, "motor (CV)": 1, "combustible": 1, "cilindrada": 1, "kilometros": 1, "cambio": 1,
                      "modelo": 1, "marca": 1, "precio": 1, "año": 1, "localidad": 1, "marchas": 1}},
        {'$sort': {'precio_numerico': 1, "año_numerico": 1,
                   "caballos_numerico": 1, "cilindrada_numerico": 1, "kilometros_numerico": 1}},
        {'$limit': 10},
    ]
    if sample == "1":
        pipeline = [{'$project': {"_id": 0, "motor (CV)": 1, "combustible": 1, "cilindrada": 1, "kilometros": 1, "cambio": 1,
                                          "modelo": 1, "marca": 1, "precio": 1, "año": 1, "localidad": 1, "marchas": 1}},
                                          {"$sample": {"size": 10}}]
    print(match)
    result = collection.aggregate(pipeline)
    list = []
    for document in result:
        list.append(document)
    return list


def check_fields_is_not_empty(brand, model, year, year_condition, horses, horses_condition, km, km_condition, fuel,
                              gearbox, location, price, price_condition, displ_engine, displ_engine_condition, marches):
    match = {}
    if brand != "":
        match["marca"] = brand
    if model != "":
        match["modelo"] = model
    if gearbox != "":
        match["cambio"] = gearbox
    if fuel != "":
        match["combustible"] = fuel
    if location != "":
        match["localidad"] = location
    if year != "":
        match["año_numerico"] = int(year) if year_condition == "equal" else {"$lt" if year_condition == "less" else "$gte": int(year)}
    if price != "":
        match["precio_numerico"] = int(price) if price_condition == "equal" else {"$lt" if price_condition == "less" else "$gte": int(price)}
    if displ_engine != "":
        match["cilindrada_numerico"] = int(displ_engine) if displ_engine_condition == "equal" else {"$lt" if displ_engine_condition == "less" else "$gte": int(displ_engine)}
    if km != "":
        match["kilometros_numerico"] = int(year) if km_condition == "equal" else {"$lt" if km_condition == "less" else "$gte": int(km)}
    if marches != "":
        match["marchas_numerico"] = int(marches)
    return match
