part of "chart_bloc.dart";

class ChartState {
  bool widgetActive;
  Map<String, double>? priceResult;

  ChartState({required this.widgetActive, required this.priceResult});

  ChartState copyWith({bool? widgetActive, Map<String, double>? priceResult}) {
    return ChartState(widgetActive: widgetActive ?? this.widgetActive,
        priceResult: priceResult ?? this.priceResult);
  }
}