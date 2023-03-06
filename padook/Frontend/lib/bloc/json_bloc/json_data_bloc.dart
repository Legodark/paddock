import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:padook/data/json/read_json.dart';

part 'json_data_state.dart';

class JsonDataBloc extends Cubit<JsonDataState> {
  JsonDataBloc()
      : super(JsonDataState(marchesData: const {}, marchSelected: "0", modelsData: {}, modelSelected: "0"));

  Future<void> fillData() async {
    emit(JsonDataState(marchesData: await readMarchesJson(), marchSelected: "0", modelsData: await readModelJson("Abarth"), modelSelected: "0"));
  }

  void selectMarch(String march) {
    emit(state.copyWith(marchSelected: march));
  }

  Future<void> filterModel(String march) async {
    emit(state.copyWith(modelsData: await readModelJson(state.marchesData[march])));
    selectModel(state.modelsData.keys.first);
  }

  void selectModel(String model) {
    emit(state.copyWith(modelSelected: model));
  }
}
