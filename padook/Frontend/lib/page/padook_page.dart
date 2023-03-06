import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:padook/bloc/json_bloc/json_data_bloc.dart';
import 'package:padook/bloc/march_logo_bloc/march_logo_bloc.dart';
import 'package:padook/widgets/form%20widgets.dart';

import '../data/json/read_json.dart';

class PadookPage extends StatefulWidget {
  const PadookPage({Key? key}) : super(key: key);

  @override
  State<PadookPage> createState() => _PadookPageState();
}

class _PadookPageState extends State<PadookPage> {
  final _formKey = GlobalKey<FormState>();
  TextEditingController year = TextEditingController();
  TextEditingController horses = TextEditingController();
  TextEditingController km = TextEditingController();
  TextEditingController displEngine = TextEditingController();
  TextEditingController marches = TextEditingController();
  TextEditingController cardBrandId = TextEditingController();
  TextEditingController modelId = TextEditingController();
  TextEditingController fuelId = TextEditingController();
  TextEditingController gearboxId = TextEditingController();

  Future<void> showChat() async {
    await await readModelJson("Abarth");
  }

  void readDictData() async {
    BlocProvider.of<JsonDataBloc>(context).fillData();
  }

  @override
  void initState() {
    // TODO: implement initState
    super.initState();
    readDictData();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: SizedBox(
            width: MediaQuery.of(context).size.width,
            height: 1000,
            child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Image.asset(
                    "assets/images/logo.png",
                    width: 600,
                  ),
                  Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(10),
                      color: const Color(0xFF4e4e4e),
                    ),
                    padding: const EdgeInsets.symmetric(vertical: 20),
                    width: 700,
                    child: Form(
                      key: _formKey,
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [BlocBuilder<JsonDataBloc, JsonDataState>(
                              builder: (context, state) =>
                                  getMarchesMenu(context, state)),
                          BlocBuilder<MarchLogoBloc, String>(builder: (context, state) =>
                          Image.asset(state, width: 100, height: 100,))],),
                          BlocBuilder<JsonDataBloc, JsonDataState>(
                              builder: (context, state) =>
                                  getModelMenu(context, state))
                        ],
                      ),
                    ),
                  )
                ])),
        floatingActionButton: FloatingActionButton(
          onPressed: showChat,
          tooltip: 'Show chatbot',
          child: const Icon(Icons.comment),
        ));
  }
}
