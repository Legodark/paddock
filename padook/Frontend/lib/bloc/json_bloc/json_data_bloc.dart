import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:padook/data/json/read_json.dart';

part 'json_data_state.dart';

class JsonDataBloc extends Cubit<JsonDataState> {
  JsonDataBloc()
      : super(JsonDataState(brandsData: const {}, brandSelected: "0", modelsData: {}, modelSelected: "0"));

  Future<void> fillData() async {
    emit(JsonDataState(brandsData: await readBrandsJson(), brandSelected: "0", modelsData: await readModelJson("Abarth"), modelSelected: "0"));
  }

  void selectMarch(String brand) {
    emit(state.copyWith(brandSelected: brand));
  }

  Future<void> filterModel(String brand) async {
    emit(state.copyWith(modelsData: await readModelJson(state.brandsData[brand])));
    selectModel(state.modelsData.keys.first);
  }

  void selectModel(String model) {
    emit(state.copyWith(modelSelected: model));
  }
}
