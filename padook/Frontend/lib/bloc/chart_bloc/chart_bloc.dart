
import 'package:flutter_bloc/flutter_bloc.dart';

part "chart_state.dart";

class ChartBloc extends Cubit<ChartState> {
  ChartBloc() : super(ChartState(widgetActive: false, priceResult: {}));

  void activeWidget(bool widgetActive) {
    emit(state.copyWith(widgetActive: widgetActive));
  }

  void updateMap(Map<String, double> priceResult) {
    emit(state.copyWith(priceResult: priceResult));
  }

}