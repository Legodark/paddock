

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
  String newText =
  message.replaceAllMapped(RegExp(synonymous.join("|")), (match) {
    return "coche";
  });
  return newText;
}