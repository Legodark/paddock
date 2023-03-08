import 'dart:convert';

import 'package:animated_loading_border/animated_loading_border.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:padook/bloc/form_bloc/form_bloc.dart';
import 'package:padook/bloc/json_bloc/json_data_bloc.dart';
import 'package:padook/bloc/brand_logo_bloc/brand_logo_bloc.dart';
import 'package:padook/widgets/form_input_list/form_input_list.dart';
import 'package:padook/widgets/form_widgets.dart';
import 'package:http/http.dart' as http;

class PadookPage extends StatefulWidget {
  const PadookPage({Key? key}) : super(key: key);

  @override
  State<PadookPage> createState() => _PadookPageState();
}

class _PadookPageState extends State<PadookPage> {
  final _formKey = GlobalKey<FormState>();
  Map<String, TextEditingController> controllerList = {
    "year": TextEditingController(),
    "horses": TextEditingController(),
    "km": TextEditingController(),
    "displEngine": TextEditingController(),
    "marches": TextEditingController(),
  };

  Future<void> showChat() async {}

  Future<void> getPrediction(String brandSelected, String modelSelected,
      String gearBoxId, String fuelId) async {
    String url = "http://127.0.0.1:5000/car_predict?year=${controllerList["year"]?.text}"
        "&horses=${controllerList["horses"]?.text}&km=${controllerList["km"]?.text}"
        "&displ_engine=${controllerList["displEngine"]?.text}"
        "&marches=${controllerList["marches"]?.text}"
        "&card_brand_id=$brandSelected&model_id=$modelSelected"
        "&fuel_id=$fuelId&gearbox_id=$gearBoxId";
    http.Response response = await http.get(Uri.parse(url));
    if(response.statusCode == 200){
      Map data = jsonDecode(response.body);
      print(data);
    }

  }

  void readDictData() async {
    BlocProvider.of<JsonDataBloc>(context).fillData();
  }

  @override
  void initState() {
    super.initState();
    readDictData();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: SizedBox(
            width: MediaQuery.of(context).size.width,
            height: MediaQuery.of(context).size.height + 40,
            child: SingleChildScrollView(
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 20),
                child: Column(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Image.asset(
                        "assets/images/logo.png",
                        width: 600,
                        height: 150,
                      ),
                      AnimatedLoadingBorder(
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
                              key: _formKey,
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                crossAxisAlignment: CrossAxisAlignment.center,
                                children: [
                                  BlocBuilder<JsonDataBloc, JsonDataState>(
                                      builder: (context, state) =>
                                          getMarchesMenu(context, state)),
                                  BlocBuilder<MarchLogoBloc, String>(
                                      builder: (context, state) => Image.asset(
                                            state,
                                            width: 80,
                                            height: 80,
                                          )),
                                  BlocBuilder<JsonDataBloc, JsonDataState>(
                                      builder: (context, state) =>
                                          getModelMenu(context, state)),
                                  Container(
                                    width: 550,
                                    height: 250,
                                    margin: const EdgeInsets.symmetric(
                                        vertical: 20),
                                    child: GridView.count(
                                      primary: false,
                                      childAspectRatio: MediaQuery.of(context)
                                              .size
                                              .width /
                                          MediaQuery.of(context).size.height /
                                          0.6,
                                      crossAxisCount: 2,
                                      children: getFormInputList(
                                          context, controllerList),
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
                                              builder: (context, state) =>
                                                  OutlinedButton(
                                                      onPressed: () {
                                                        getPrediction(
                                                            jsonstate
                                                                .brandSelected,
                                                            jsonstate
                                                                .modelSelected,
                                                            state.gearBoxId,
                                                            state.fuelId);
                                                      },
                                                      child: const Text(
                                                        "Predecir",
                                                        style: TextStyle(
                                                            color:
                                                                Colors.white),
                                                      ))))
                                ],
                              ),
                            ),
                          ))
                    ]),
              ),
            )),
        floatingActionButton: FloatingActionButton(
          onPressed: showChat,
          tooltip: 'Show chatbot',
          child: const Icon(Icons.comment),
        ));
  }
}
