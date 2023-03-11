

import 'package:diacritic/diacritic.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:padook/api_requests/database_request.dart';
import 'package:padook/bloc/car_query_grid_bloc/car_query_grid_bloc.dart';

import '../../api_requests/requests_ai_results.dart';
import '../../bloc/chatbot_bloc/chatbot_bloc.dart';
import '../generate_response/read_properties.dart';

void sendFunction(BuildContext context, String message, FocusNode focusNode, ScrollController scrollController) {
  BlocProvider.of<ChatBotBloc>(context)
      .addMessage(message, "usuario");
  String messageCopy = message.toLowerCase();
  getContext(message).then((value) {
    if(value == 1) {
      BlocProvider.of<CarQueryGridBloc>(context)
          .activeWidget(1);
      BlocProvider.of<ChatBotBloc>(context)
          .turnOffTextField(true);
      String url = createApiUrl(removeDiacritics(messageCopy).replaceAll(RegExp(r'\s+'), ' '));
      getCarQueryData(url).then((value) {
        BlocProvider.of<CarQueryGridBloc>(context)
            .updateMap(value);
        BlocProvider.of<ChatBotBloc>(context)
            .turnOffTextField(false);
        BlocProvider.of<CarQueryGridBloc>(context)
            .activeWidget(2);
        BlocProvider.of<ChatBotBloc>(context)
            .addMessage("Le he obtenido los datos con las propiedades pedidas", "Eistein");
      }
      );
    } else {
      BlocProvider.of<ChatBotBloc>(context)
          .addMessage("Yo solo estoy programado para consultar coches. Por lo que no puedo entender o conversar sobre otros temas. Lo siento", "Eistein");
    }
  });
  message = "";
  scrollController.jumpTo(0);
}