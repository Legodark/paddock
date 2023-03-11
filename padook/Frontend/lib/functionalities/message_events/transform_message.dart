

import 'package:padook/data/data_lists/get_brands_list.dart';

String replaceSubstrings(String message) {
  List<String> synonymous = [
    "vehiculo",
    "vehículo",
    "auto",
    "carro",
    "automovil",
    "vehiculos",
    "vehículos",
    "autos",
    "carros",
    "automoviles",
    "coches"
  ];

  List<String> brands = getBrandsList();
  String newText =
  message.replaceAllMapped(RegExp(synonymous.join("|")), (match) {
    return "coche";
  }).replaceAllMapped(RegExp(brands.join("|")), (match) {
    return "coche";
  });
  return newText;
}