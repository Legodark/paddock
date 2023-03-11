import 'package:flutter_bloc/flutter_bloc.dart';

part 'chatbot_state.dart';

class ChatBotBloc extends Cubit<ChatBotState> {
  ChatBotBloc()
      : super(ChatBotState(
            isChatBotActive: false,
            messages: [
              {
                "user": "Eistein",
                "message":
                    "Buenas. Soy Eistein y soy un chatbot programado para extraer datos de coches segun tus peticiones"
              }
            ],
            readOnlyField: false));

  void activeChatBot(bool isChatBotActive) {
    emit(state.copyWith(isChatBotActive: isChatBotActive));
  }

  void turnOffTextField(bool readOnlyField) {
    emit(state.copyWith(readOnlyField: readOnlyField));
  }

  void addMessage(String message, String user) {
    List<Map<String, String>> newMessagesList = state.messages;
    newMessagesList.insert(0, {"user": user, "message": message});
    emit(state.copyWith(messages: newMessagesList));
  }
}
