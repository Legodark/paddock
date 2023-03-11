import 'package:padook/data/data_lists/get_fuel_list.dart';
import 'package:padook/data/data_lists/get_localtion_list.dart';
import 'package:padook/data/data_lists/get_models_list.dart';
import 'package:string_capitalize/string_capitalize.dart';

import '../../data/data_lists/get_brands_list.dart';

String createApiUrl(String message) {
  List<String> brands = getBrandsList();
  List<String> models = getModelsList();
  List<String> fuels = getFuelList();
  List<String> gearBoxes = ["manual", "automatico", "automatica"];
  List<String> locations = getLocationList();
  List<String> modelsReversed = models.reversed.toList();
  List<String> fuelsReversed = fuels.reversed.toList();
  String year = "",
      km = "",
      displEngine = "",
      price = "",
      cv = "",
      march = "",
      yearCondition = "equal",
      kmCondition = "equal",
      displEngineCondition = "equal",
      priceCondition = "equal",
      cvCondition = "equal";
  String sample = "1";

  String? brandFound = brands
      .firstWhere((word) => message.contains(word.toLowerCase()),
          orElse: () => "")
      .replaceAll("mercedes-benz", "mercedes")
      .replaceAll("mercedes", "mercedes-benz")
      .capitalize();

  String? modelFound = modelsReversed
      .firstWhere((word) => message.contains(word.toLowerCase()),
          orElse: () => "")
      .replaceAll("mercedes-benz", "mercedes")
      .replaceAll("mercedes", "mercedes-benz");

  String? locationFound = locations
      .firstWhere((word) => message.contains(word.toLowerCase()),
          orElse: () => "")
      .capitalize()
      .replaceAll("Almeria", "Almería")
      .replaceAll("Castellon", "Castellón")
      .replaceAll("Caceres", "Cáceres")
      .replaceAll("Cordoba", "Córdoba")
      .replaceAll("Cadiz", "Cádiz")
      .replaceAll("Guipuzcoa", "Guipúzcoa")
      .replaceAll("Jaen", "Jaén")
      .replaceAll("Leon", "León")
      .replaceAll("Malaga", "Málaga")
      .replaceAll("alaya", "Álaya")
      .replaceAll("Avila", "Ávila");

  String? fuelFound = fuelsReversed
      .firstWhere((word) => message.contains(word.toLowerCase()),
          orElse: () => "")
      .replaceAll("electrica", "eléctrica")
      .replaceAll("electrico", "corriente eléctrica")
      .replaceAll("hibrido", "gasolina y corriente eléctrica")
      .capitalize();

  String? gearBoxFound = gearBoxes
      .firstWhere((word) => message.contains(word.toLowerCase()),
          orElse: () => "")
      .replaceAll("automatico", "automático")
      .replaceAll("automatica", "automático")
      .capitalize();

  RegExp regexYear = RegExp(
      r'(despues|antes|posterior|anterior)?\w*\s+(de|a)?\s*(ano|del)\s+(\d{4})');
  Match? matchYear = regexYear.firstMatch(message);

  RegExp regexKM =
      RegExp(r'(mas|menos|mayor|menor|superior|inferior)?\w*\s+(de|a)?\s*(\d+)\s+(kilometro|km)');
  Match? matchKM = regexKM.firstMatch(message);

  RegExp regexCV =
      RegExp(r'(mas|menos|mayor|menor|superior|inferior)?\w*\s+(de|a)?\s*(\d+)\s+(cv|caballo)');
  Match? matchCV = regexCV.firstMatch(message);

  RegExp regexPrice =
      RegExp(r'(mas|menos|mayor|menor|superior|inferior)?\w*\s+(de|a)?\s*(\d+)\s*(€|euros|\$)');
  Match? matchPrice = regexPrice.firstMatch(message);

  RegExp regexMarches =
      RegExp(r'(mas|menos|mayor|menor|superior|inferior)?\w*\s+(de|a)?\s*(\d+)\s*marchas');
  Match? matchMarches = regexMarches.firstMatch(message);

  RegExp regexDisplEngine = RegExp(
      r'(mas|menos)?\s+(de)?\s*(\d+)\s*(de cilindrada|cilindrada|cc|cm)');
  Match? matchDisplEngine = regexDisplEngine.firstMatch(message);

  if (brandFound != "" ||
      modelFound != "" ||
      gearBoxFound != "" ||
      fuelFound != "" ||
      locationFound != "") {
    sample = "0";
  }

  if (modelFound != "") {
    List<String> modelFoundSplitted = modelFound.split(" ");
    for (int i = 0; i < 2 && i < modelFoundSplitted.length; i++) {
      modelFoundSplitted[i] = modelFoundSplitted[i].capitalize();
    }
    modelFound = modelFoundSplitted.join(" ");
  }

  if (matchYear != null) {
    sample = "0";
    year = matchYear.group(4)!;
    yearCondition = (matchYear.group(1) == null)
        ? "equal"
        : ((matchYear.group(1) == "antes" || matchYear.group(1) == "anterior")
            ? "less"
            : "more");
  }

  if (matchKM != null) {
    sample = "0";
    km = matchKM.group(3)!;
    kmCondition = (matchKM.group(1) == null)
        ? "equal"
        : ((matchKM.group(1) == "menos" || matchKM.group(1) == "menor" || matchKM.group(1) == "inferior")
        ? "less"
        : "more");
  }

  if (matchCV != null) {
    sample = "0";
    cv = matchCV.group(3)!;
    cvCondition = (matchCV.group(1) == null)
        ? "equal"
        : ((matchCV.group(1) == "menos" || matchCV.group(1) == "menor" || matchCV.group(1) == "inferior")
        ? "less"
        : "more");
  }

  if (matchPrice != null) {
    sample = "0";
    price = matchPrice.group(3)!;
    priceCondition =(matchPrice.group(1) == null)
        ? "equal"
        :
    ((matchPrice.group(1) == "menos" || matchPrice.group(1) == "menor" || matchPrice.group(1) == "inferior")
            ? "less"
            : "more");
  }

  if (matchMarches != null) {
    sample = "0";
    march = matchMarches.group(3)!;
  }

  if (matchDisplEngine != null) {
    sample = "0";
    displEngine = matchDisplEngine.group(3)!;
    displEngineCondition = (matchDisplEngine.group(1) == "")
        ? "equal"
        : ((matchDisplEngine.group(1) == "menos" ||
            matchDisplEngine.group(1) == "menor" || matchDisplEngine.group(1) == "inferior")
        ? "less"
        : "more");
  }

  print(price);
  print(year);

  return "http://127.0.0.1:5000/get_cars?brand=$brandFound&model=$modelFound"
      "&year=$year&year_condition=$yearCondition&horses=$cv&horses_condition=$cvCondition"
      "&km=$km&km_condition=$kmCondition&fuel=$fuelFound&gearbox=$gearBoxFound"
      "&location=$locationFound&price=$price&price_condition=$priceCondition"
      "&displ_engine=$displEngine&displ_engine_condition=$displEngineCondition&marches=$march&sample=$sample";
}
