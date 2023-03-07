
import 'package:flutter_bloc/flutter_bloc.dart';

part 'form_state.dart';

class FormBloc extends Cubit<FormInputState> {
  FormBloc() : super(FormInputState(gearBoxId: "0", fuelId: "0"));

  void selectGearBoxId(String gearBoxId) {
    emit(state.copyWith(gearBoxId: gearBoxId));
  }

  void selectFuelId(String fuelId) {
    emit(state.copyWith(fuelId: fuelId));
  }
}