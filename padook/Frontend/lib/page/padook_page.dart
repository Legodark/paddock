import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:padook/bloc/json_bloc/json_data_bloc.dart';
import 'package:padook/widgets/main_widgets/form_widget.dart';

import '../bloc/widget_bloc/main_widget_bloc.dart';

class PadookPage extends StatefulWidget {
  const PadookPage({Key? key}) : super(key: key);

  @override
  State<PadookPage> createState() => _PadookPageState();
}

class _PadookPageState extends State<PadookPage> {
  Future<void> showChat() async {}

  void readDictData() async {
    BlocProvider.of<JsonDataBloc>(context).fillData();
  }

  void setFormWidget() {
    BlocProvider.of<MainWidgetBloc>(context).changeFormWidget(buttonToActiveForm(context));
  }

  @override
  void initState() {
    super.initState();
    readDictData();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    setFormWidget();
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
                      BlocBuilder<MainWidgetBloc, MainWidgetState>(
                        builder: (context, state) => state.formWidget,
                      )
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
