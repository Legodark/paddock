
import 'dart:convert';

import '../functionalities/message_events/transform_message.dart';
import 'package:http/http.dart' as http;

Future<int> getContext(String message) async {
  message = replaceSubstrings(message.toLowerCase());
  String url = "https://padook-api-rrp6s7iauq-no.a.run.app/message_clasify?message=$message";
  http.Response response = await http.get(Uri.parse(url));
  if (response.statusCode == 200) {
    Map data = jsonDecode(response.body);
    return data["contexto"] as int;
  } else {
    return 0;
  }
}

Future<Map> getCarPricePrediction(Map controllerList, String brandSelected,
    String modelSelected, String gearBoxId, String fuelId) async {
  String url =
      "https://padook-api-rrp6s7iauq-no.a.run.app/car_predict?year=${controllerList["year"]?.text}"
      "&horses=${controllerList["horses"]?.text}&km=${controllerList["km"]?.text}"
      "&displ_engine=${controllerList["displEngine"]?.text}"
      "&marches=${controllerList["marches"]?.text}"
      "&card_brand_id=$brandSelected&model_id=$modelSelected"
      "&fuel_id=$fuelId&gearbox_id=$gearBoxId";
  http.Response response = await http.get(Uri.parse(url));
  if (response.statusCode == 200) {
    Map data = jsonDecode(response.body);
    Map<String, dynamic> dataJsonified = Map.from(data).cast<String, dynamic>();
    return dataJsonified;
  }
  return {
    "precio-maximo": 0,
    "precio-minimo": 0,
    "prediccion": 0,
    "coches-baratos": [],
    "coches-caros": []
  };
}