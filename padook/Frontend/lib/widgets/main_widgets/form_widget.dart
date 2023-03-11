
import 'package:animated_loading_border/animated_loading_border.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:padook/bloc/car_query_grid_bloc/car_query_grid_bloc.dart';
import 'package:padook/bloc/chart_bloc/chart_bloc.dart';
import 'package:padook/bloc/chatbot_bloc/chatbot_bloc.dart';
import 'package:simple_gradient_text/simple_gradient_text.dart';

import '../../api_requests/requests_ai_results.dart';
import '../../bloc/brand_logo_bloc/brand_logo_bloc.dart';
import '../../bloc/form_bloc/form_bloc.dart';
import '../../bloc/grid_bloc/grid_bloc.dart';
import '../../bloc/json_bloc/json_data_bloc.dart';
import '../../bloc/widget_bloc/main_widget_bloc.dart';
import '../form_input_list/form_input_list.dart';
import '../form_widgets.dart';

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
                    "El año no pueden estar vacio", "Año"),
              ),
              BlocBuilder<JsonDataBloc, JsonDataState>(
                  builder: (maincontext, jsonstate) =>
                      BlocBuilder<FormBloc, FormInputState>(
                          builder: (context, state) => OutlinedButton(
                              onPressed: () {
                                if(formKey.currentState!.validate()) {
                                  BlocProvider.of<ChartBloc>(mainContext)
                                      .activeWidget(1);
                                  getCarPricePrediction(
                                      controllerList,
                                      jsonstate.brandSelected,
                                      jsonstate.modelSelected,
                                      state.gearBoxId,
                                      state.fuelId)
                                      .then((Map value) {
                                    final carExpensives = value["coches-caros"]
                                        .map((i) =>
                                        Map.from(i).cast<String, dynamic>())
                                        .toList()
                                        .cast<Map<String, dynamic>>();
                                    final carCheaps = value["coches-baratos"]
                                        .map((i) =>
                                        Map.from(i).cast<String, dynamic>())
                                        .toList()
                                        .cast<Map<String, dynamic>>();
                                    BlocProvider.of<GridBloc>(mainContext)
                                        .setLists(carCheaps,
                                        carExpensives);
                                    BlocProvider.of<ChartBloc>(mainContext)
                                        .activeWidget(2);
                                    BlocProvider.of<ChartBloc>(mainContext)
                                        .updateMap(Map.from({
                                      "Precio Mínimo": value["precio-minimo"],
                                      "Predicción": value["prediccion"],
                                      "Precio Máximo": value["precio-maximo"]
                                    }).cast<String, double>());
                                  });
                                  BlocProvider.of<MainWidgetBloc>(context)
                                      .changeFormWidget(
                                      buttonToActiveForm(mainContext));
                                }
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

BlocBuilder buttonToActiveForm(BuildContext mainContext) {
  return BlocBuilder<CarQueryGridBloc, CarQueryGridState>(builder: (builder, gridState) =>BlocBuilder<ChartBloc, ChartState>(builder: (context, state) => Container(
    width: 700,
    decoration: BoxDecoration(
        border: Border.all(color: const Color(0xFFDC9A54)),
        borderRadius: BorderRadius.circular(10)),
    child: ElevatedButton(
        onPressed: () {
          if (state.widgetActive != 1 && gridState.widgetActive != 1) {
            BlocProvider.of<ChartBloc>(mainContext).activeWidget(0);
            BlocProvider.of<CarQueryGridBloc>(mainContext).activeWidget(0);
            BlocProvider.of<ChartBloc>(mainContext).updateMap({});
            BlocProvider.of<MainWidgetBloc>(mainContext)
                .changeFormWidget(carForm(mainContext));
            BlocProvider.of<ChatBotBloc>(mainContext).activeChatBot(false);
          }
        },
        child: ListTile(
          title: GradientText(
            "elige una marca",
            style: const TextStyle(fontFamily: "bttf", fontSize: 13),
            colors: const [
              Colors.blue,
              Color(0xFFDC9A54),
              Color(0xFFDC9A54),
              Color(0xFFDC9A54),
              Color(0xFFDC9A54),
              Color(0xFFDC9A54)
            ],
          ),
          trailing: const Icon(
            Icons.arrow_drop_down,
            color: Color(0xFFDC9A54),
          ),
        )),
  )));
}
