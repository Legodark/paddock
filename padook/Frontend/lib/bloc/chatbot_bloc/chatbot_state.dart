part of 'chatbot_bloc.dart';

class ChatBotState {
  bool isChatBotActive;
  List<Map<String, String>> messages;
  bool readOnlyField;

  ChatBotState(
      {required this.isChatBotActive,
      required this.messages,
      required this.readOnlyField});

  ChatBotState copyWith(
      {bool? isChatBotActive,
      List<Map<String, String>>? messages,
      bool? readOnlyField}) {
    return ChatBotState(
        isChatBotActive: isChatBotActive ?? this.isChatBotActive,
        messages: messages ?? this.messages,
        readOnlyField: readOnlyField ?? this.readOnlyField);
  }
}
