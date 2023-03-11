

import 'package:padook/data/data_lists/get_brands_list.dart';

//Aqui realizamos transformaciones para que la api de la ia pueda clasificar correctamente el texto

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