import 'dart:convert';

import 'package:http/http.dart' as http;

Future<List<dynamic>> getCarQueryData(String url) async {
  http.Response response = await http.get(Uri.parse(url));
  if (response.statusCode == 200) {
    Map data = jsonDecode(response.body);
    Map<String, dynamic> dataJsonified = Map.from(data).cast<String, dynamic>();
    return dataJsonified["car_data"];
  }
    return [];
}