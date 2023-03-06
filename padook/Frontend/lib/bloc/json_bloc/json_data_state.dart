part of 'json_data_bloc.dart';

class JsonDataState {
  final Map marchesData;
  String marchSelected;
  Map modelsData;
  String modelSelected;

  JsonDataState({required this.marchesData, required this.marchSelected, required this.modelsData, required this.modelSelected});

  JsonDataState copyWith({Map? marchesData, String? marchSelected, Map? modelsData, String? modelSelected}) {
    return JsonDataState(
      marchesData: marchesData ?? this.marchesData,
      marchSelected: marchSelected ?? this.marchSelected,
      modelsData: modelsData ?? this.modelsData,
      modelSelected: modelSelected ?? this.modelSelected
    );
  }
}
