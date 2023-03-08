import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

part 'main_widget_state.dart';

class MainWidgetBloc extends Cubit<MainWidgetState> {
  MainWidgetBloc()
      : super(MainWidgetState(formWidget: const Center(
    child: CircularProgressIndicator(),
  )));

  void changeFormWidget(Widget formWidget) {
    emit(MainWidgetState(formWidget: formWidget));
  }
}