import 'dart:convert';

import 'package:animated_loading_border/animated_loading_border.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:padook/bloc/chart_bloc/chart_bloc.dart';
import 'package:simple_gradient_text/simple_gradient_text.dart';

import '../../bloc/brand_logo_bloc/brand_logo_bloc.dart';
import '../../bloc/form_bloc/form_bloc.dart';
import '../../bloc/json_bloc/json_data_bloc.dart';
import '../../bloc/widget_bloc/main_widget_bloc.dart';
import '../form_input_list/form_input_list.dart';
import '../form_widgets.dart';
import 'package:http/http.dart' as http;

Future<Object> getPrediction(Map controllerList, String brandSelected,
    String modelSelected, String gearBoxId, String fuelId) async {
  String url =
      "http://127.0.0.1:5000/car_predict?year=${controllerList["year"]?.text}"
      "&horses=${controllerList["horses"]?.text}&km=${controllerList["km"]?.text}"
      "&displ_engine=${controllerList["displEngine"]?.text}"
      "&marches=${controllerList["marches"]?.text}"
      "&card_brand_id=$brandSelected&model_id=$modelSelected"
      "&fuel_id=$fuelId&gearbox_id=$gearBoxId";
  http.Response response = await http.get(Uri.parse(url));
  if (response.statusCode == 200) {
    Map data = jsonDecode(response.body);
    Map<String, double> dataJsonified = Map.from(data).cast<String, double>();
    return Map.from({"Precio Mínimo": dataJsonified["precio-minimo"],
      "Predicción": dataJsonified["prediccion"],
      "Precio Máximo": dataJsonified["precio-maximo"]}).cast<String, double>();
  }
  return {
    "error 404": 0,
    "La api esta en mantenimiento": 0,
    "Lo sentimos :(": 0
  };
}

AnimatedLoadingBorder carForm(BuildContext mainContext) {
  final formKey = GlobalKey<FormState>();
  Map<String, TextEditingController> controllerList = {
    "year": TextEditingController(),
    "horses": TextEditingController(),
    "km": TextEditingController(),
    "displEngine": TextEditingController(),
    "marches": TextEditingController(),
  };

  return AnimatedLoadingBorder(
      borderColor: const Color(0xFFDC9A54),
      cornerRadius: 10,
      borderWidth: 6,
      duration: const Duration(seconds: 10),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(10),
          color: const Color(0x664e4e4e),
          border: Border.all(color: Colors.blue, width: 3),
        ),
        padding: const EdgeInsets.symmetric(vertical: 20),
        width: 700,
        child: Form(
          key: formKey,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              BlocBuilder<JsonDataBloc, JsonDataState>(
                  builder: (context, state) => getMarchesMenu(context, state)),
              BlocBuilder<MarchLogoBloc, String>(
                  builder: (context, state) => Image.asset(
                        state,
                        width: 80,
                        height: 80,
                      )),
              BlocBuilder<JsonDataBloc, JsonDataState>(
                  builder: (context, state) => getModelMenu(context, state)),
              Container(
                width: 550,
                height: 250,
                margin: const EdgeInsets.symmetric(vertical: 20),
                child: GridView.count(
                  primary: false,
                  childAspectRatio: 3.4,
                  crossAxisCount: 2,
                  children: getFormInputList(mainContext, controllerList),
                ),
              ),
              Container(
                margin: const EdgeInsets.only(bottom: 10),
                width: 550,
                child: getTextField(controllerList["year"],
                    "El año no pueden estar vacia", "Año"),
              ),
              BlocBuilder<JsonDataBloc, JsonDataState>(
                  builder: (maincontext, jsonstate) =>
                      BlocBuilder<FormBloc, FormInputState>(
                          builder: (context, state) => OutlinedButton(
                              onPressed: () {
                                BlocProvider.of<ChartBloc>(mainContext)
                                    .activeWidget(1);
                                getPrediction(
                                        controllerList,
                                        jsonstate.brandSelected,
                                        jsonstate.modelSelected,
                                        state.gearBoxId,
                                        state.fuelId)
                                    .then((value) {
                                  BlocProvider.of<ChartBloc>(mainContext)
                                      .activeWidget(2);
                                  BlocProvider.of<ChartBloc>(mainContext)
                                      .updateMap(value as Map<String, double>);
                                });
                                BlocProvider.of<MainWidgetBloc>(context)
                                    .changeFormWidget(
                                        buttonToActiveForm(mainContext));
                              },
                              child: const Text(
                                "Predecir",
                                style: TextStyle(color: Colors.white),
                              ))))
            ],
          ),
        ),
      ));
}

Container buttonToActiveForm(BuildContext mainContext) {
  return Container(
    width: 700,
    decoration: BoxDecoration(
        border: Border.all(color: const Color(0xFFDC9A54)),
        borderRadius: BorderRadius.circular(10)),
    child: ElevatedButton(
        onPressed: () {
          BlocProvider.of<ChartBloc>(mainContext)
              .activeWidget(0);
          BlocProvider.of<ChartBloc>(mainContext)
              .updateMap({});
          BlocProvider.of<MainWidgetBloc>(mainContext)
              .changeFormWidget(carForm(mainContext));
        },
        child: ListTile(
          title: Row(
            children: [
              GradientText(
                "elige una marca",
                style: const TextStyle(fontFamily: "bttf", fontSize: 13),
                colors: const [
                  Colors.blue,
                  Colors.blue,
                  Color(0xFFDC9A54),
                  Color(0xFFDC9A54),
                ],
              ),
              Image.asset(
                "assets/images/favicon.png",
                width: 60,
              )
            ],
          ),
          trailing: const Icon(
            Icons.arrow_drop_down,
            color: Color(0xFFDC9A54),
          ),
        )),
  );
}
