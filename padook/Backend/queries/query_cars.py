import pymongo

def get_min_price_from_model(collection, model, price):
    result = collection.aggregate([
        {'$match': {'modelo': model}},
        {'$addFields': {'decimal_price': {'$toDouble': '$precio'}}},
        {'$match': {'decimal_price': {"$gte": price-5000, "$lte": price}}},
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
        {'$match': {'decimal_price': {"$gte": price, "$lte": price+5000}}},
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
        {'$match': {'decimal_price': {"$gte": price-5000, "$lte": price}}},
        {'$sort': {'decimal_price': 1}},
        {'$project': {"_id": 0, "modelo": 1, "marca": 1, "precio": 1, "año": 1}},
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
        {'$match': {'decimal_price': {"$gte": price, "$lte": price+5000}}},
        {'$sort': {'decimal_price': -1}},
        {'$project': {"_id": 0, "modelo": 1, "marca": 1, "precio": 1, "año": 1}},
        {'$limit': 5}
    ]
    result = collection.aggregate(pipeline)
    list = []
    for document in result:
        list.append(document)
    return list
