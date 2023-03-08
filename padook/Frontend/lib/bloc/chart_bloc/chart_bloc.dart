
import 'package:flutter_bloc/flutter_bloc.dart';

part "chart_state.dart";

class ChartBloc extends Cubit<ChartState> {
  ChartBloc() : super(ChartState(widgetActive: 0, priceResult: {}));

  void activeWidget(int widgetActive) {
    emit(state.copyWith(widgetActive: widgetActive));
  }

  void updateMap(Map<String, double> priceResult) {
    emit(state.copyWith(priceResult: priceResult));
  }

}