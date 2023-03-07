part of 'json_data_bloc.dart';

class JsonDataState {
  final Map brandsData;
  String brandSelected;
  Map modelsData;
  String modelSelected;

  JsonDataState({required this.brandsData, required this.brandSelected, required this.modelsData, required this.modelSelected});

  JsonDataState copyWith({Map? brandsData, String? brandSelected, Map? modelsData, String? modelSelected}) {
    return JsonDataState(
      brandsData: brandsData ?? this.brandsData,
      brandSelected: brandSelected ?? this.brandSelected,
      modelsData: modelsData ?? this.modelsData,
      modelSelected: modelSelected ?? this.modelSelected
    );
  }
}
