
part of 'form_bloc.dart';

class FormInputState {
  String gearBoxId, fuelId;

  FormInputState({required this.gearBoxId, required this.fuelId});

  FormInputState copyWith({String? gearBoxId, String? fuelId}) {
    return FormInputState(
        gearBoxId: gearBoxId ?? this.gearBoxId,
        fuelId: fuelId ?? this.fuelId,
    );
  }
}