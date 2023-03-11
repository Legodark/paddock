
part of 'car_query_grid_bloc.dart';

class CarQueryGridState {
  int widgetActive;
  List<dynamic> data;

  CarQueryGridState({required this.widgetActive, required this.data});

  CarQueryGridState copyWith({int? widgetActive, List<dynamic>? data}) {
    return CarQueryGridState(widgetActive: widgetActive ?? this.widgetActive,
    data: data ?? this.data);
  }
}