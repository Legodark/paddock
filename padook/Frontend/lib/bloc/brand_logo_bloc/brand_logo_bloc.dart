import 'package:flutter_bloc/flutter_bloc.dart';

class MarchLogoBloc extends Cubit<String> {
  MarchLogoBloc() : super("assets/images/marcas/abarth.png");

  void setUrl(asset) {
    emit("assets/images/marcas/$asset.png");
  }
}