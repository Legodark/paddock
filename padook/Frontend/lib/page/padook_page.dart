import 'package:animated_loading_border/animated_loading_border.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:gradient_borders/box_borders/gradient_box_border.dart';
import 'package:padook/bloc/json_bloc/json_data_bloc.dart';
import 'package:padook/bloc/brand_logo_bloc/brand_logo_bloc.dart';
import 'package:padook/widgets/form_input_list/form_input_list.dart';
import 'package:padook/widgets/form_widgets.dart';

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
            child: SingleChildScrollView(child: Container(padding: EdgeInsets.symmetric(vertical: 20),child: Column(
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
                      borderWidth: 10,
                      duration: const Duration(seconds: 10),
                      child: Container(
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(10),
                          color: const Color(0x664e4e4e),
                          border: Border.all(color: Colors.blue, width: 5),
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
                              Container(width: 550, height: 250, margin: const EdgeInsets.symmetric(vertical: 20), child: GridView.count(
                                primary: false,
                                childAspectRatio: MediaQuery.of(context).size.width / MediaQuery.of(context).size.height / 0.6,
                                crossAxisCount: 2,
                                children: getFormInputList(context, controllerList),
                              ),),
                              Container(margin: const EdgeInsets.only(bottom: 10),width: 550, child: getTextField(controllerList["year"],
                                  "El año no pueden estar vacia", "Año"),),
                              OutlinedButton(onPressed: () {}, child: const Text("Predecir", style: TextStyle(color: Colors.white),))
                            ],
                          ),
                        ),
                      ))
                ]),),)),
        floatingActionButton: FloatingActionButton(
          onPressed: showChat,
          tooltip: 'Show chatbot',
          child: const Icon(Icons.comment),
        ));
  }
}
