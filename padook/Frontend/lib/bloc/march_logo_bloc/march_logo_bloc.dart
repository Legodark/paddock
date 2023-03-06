import 'package:flutter_bloc/flutter_bloc.dart';
part 'march_logo_state.dart';

class MarchLogoBloc extends Cubit<String> {
  MarchLogoBloc() : super("assets/images/marcas/abarth.png");

  void setUrl(asset) {
    emit("assets/images/marcas/$asset.png");
  }
}