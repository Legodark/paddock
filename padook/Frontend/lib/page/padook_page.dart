import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:padook/bloc/chart_bloc/chart_bloc.dart';
import 'package:padook/bloc/json_bloc/json_data_bloc.dart';
import 'package:padook/widgets/main_widgets/form_widget.dart';
import 'package:padook/widgets/main_widgets/predict_chart_widget.dart';

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

  Future<void> setFormWidget() async {
    BlocProvider.of<MainWidgetBloc>(context)
        .changeFormWidget(buttonToActiveForm(context));
  }

  @override
  void initState() {
    super.initState();
    readDictData();
    setFormWidget();
  }

  @override
  void dispose() {
    // TODO: implement dispose
    super.dispose();
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
                        builder: (context, state) => AnimatedSwitcher(
                          duration: const Duration(milliseconds: 300),
                          switchInCurve: Curves.fastOutSlowIn,
                          switchOutCurve: Curves.fastOutSlowIn,
                          transitionBuilder:
                              (Widget child, Animation<double> animation) {
                            return SizeTransition(
                              sizeFactor: animation,
                              axisAlignment: 0.0,
                              child: Align(
                                child: Container(
                                    padding: const EdgeInsets.symmetric(
                                        vertical: 10),
                                    child: child),
                              ),
                            );
                          },
                          child: state.formWidget,
                        ),
                      ),
                      BlocBuilder<ChartBloc, ChartState>(
                          builder: (context, state) {
                        return AnimatedSwitcher(duration: const Duration(milliseconds: 300),
                        child: loadCorrectWidget(state),);
                      })
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
