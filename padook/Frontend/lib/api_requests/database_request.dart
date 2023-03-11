import 'dart:convert';

import 'package:http/http.dart' as http;

//Esta funcion se encarga de realizar una peticcion a la paddock api donde se extraera los coches mediante una consulta

Future<List<dynamic>> getCarQueryData(String url) async {
  http.Response response = await http.get(Uri.parse(url));
  if (response.statusCode == 200) {
    Map data = jsonDecode(response.body);
    Map<String, dynamic> dataJsonified = Map.from(data).cast<String, dynamic>();
    return dataJsonified["car_data"];
  }
    return [];
}