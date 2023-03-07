import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:padook/bloc/form_bloc/form_bloc.dart';
import 'package:padook/widgets/form_widgets.dart';

List<Widget> getFormInputList(
    BuildContext context, Map<String, TextEditingController> mapControllers) {
  List<Widget> formInputList = [];
  Map<String, String> fuelDict = {
    "0": "Corriente eléctrica",
    "1": "Diesel",
    "2": "Diesel y corriente eléctrica",
    "3": "Gasolina",
    "4": "Gasolina y corriente eléctrica",
    "5": "Gasolina/Gas",
    "6": "Mixto Gasolina/Etanol"
  };
  mapControllers["km"]?.text = "190000";
  mapControllers["horses"]?.text = "150";
  mapControllers["displEngine"]?.text = "1910";
  mapControllers["marches"]?.text = "6";
  mapControllers["year"]?.text = "2005";
  Map<String, String> gearBoxDict = {"0": "Automatico", "1": "Manual"};
  formInputList.add(getTextField(mapControllers["km"],
      "Los kilometros no pueden estar vacio", "Kilometros"));
  formInputList.add(getTextField(mapControllers["horses"],
      "Los caballos no pueden estar vacio", "Caballos"));
  formInputList.add(getTextField(mapControllers["displEngine"],
      "La cilindrada no puede estar vacio", "Cilindrada"));
  formInputList.add(getTextField(mapControllers["marches"],
      "Las marchas no pueden estar vacia", "Marcha"));
  formInputList.add(BlocBuilder<FormBloc, FormInputState>(
      builder: (context, state) =>
          getGearBoxMenu(context, state, gearBoxDict)));
  formInputList.add(BlocBuilder<FormBloc, FormInputState>(
      builder: (context, state) =>
          getFuelMenu(context, state, fuelDict)));
  return formInputList;
}
