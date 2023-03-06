import 'dart:convert';

import 'package:flutter/services.dart';

Future<dynamic> readMarchesJson() async {
  final String response =
      await rootBundle.loadString('assets/json/dic_cars_marca.json');
  final data = await json.decode(response);
  return Map.from(data);
}

Future<dynamic> readModelJson(String march) async {
  final String response =
  await rootBundle.loadString('assets/json/dic_cars_modelo.json');
  final data = await json.decode(response);
  Map result = Map.from(data);
  result.removeWhere((key, value) => !value.startsWith(march));
  return result;
}
