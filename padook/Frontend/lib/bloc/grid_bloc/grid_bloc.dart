import 'package:flutter_bloc/flutter_bloc.dart';

part 'grid_state.dart';

class GridBloc extends Cubit<GridState> {
  GridBloc() : super(GridState(cheapestCars: [], expensiveCars: []));

  void setLists(List<Map<String, dynamic>> cheapestCars, List<Map<String, dynamic>> expensiveCars) {
    emit(GridState(cheapestCars: cheapestCars, expensiveCars: expensiveCars));
  }
}