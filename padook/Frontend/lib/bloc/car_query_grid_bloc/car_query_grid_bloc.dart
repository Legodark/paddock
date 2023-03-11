
import 'package:flutter_bloc/flutter_bloc.dart';

part 'car_query_grid_state.dart';

class CarQueryGridBloc extends Cubit<CarQueryGridState> {
  CarQueryGridBloc() : super(CarQueryGridState(widgetActive: 0, data: []));

  void activeWidget(int widgetActive) {
    emit(state.copyWith(widgetActive: widgetActive));
  }

  void updateMap(List<dynamic> data) {
    emit(state.copyWith(data: data));
  }

}