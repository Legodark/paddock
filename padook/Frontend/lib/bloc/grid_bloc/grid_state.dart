
part of 'grid_bloc.dart';

class GridState {
  List<Map<String, dynamic>> cheapestCars, expensiveCars;

  GridState({required this.cheapestCars, required this.expensiveCars});

  GridState copyWith({List<Map<String, dynamic>>? cheapestCars, List<Map<String, dynamic>>? expensiveCars}) {
    return GridState(
      cheapestCars: cheapestCars ?? this.cheapestCars,
      expensiveCars: expensiveCars ?? this.expensiveCars,
    );
  }
}