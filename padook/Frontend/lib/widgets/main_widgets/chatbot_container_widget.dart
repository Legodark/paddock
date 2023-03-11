
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:padook/widgets/chatbot_widgets/chatbot_widgets.dart';

import '../../bloc/chatbot_bloc/chatbot_bloc.dart';

import '../../functionalities/message_events/message_send.dart';

Container chatBotMainWidget(BuildContext mainContext) {
  TextEditingController messageCtrl = TextEditingController();
  ScrollController scrollController = ScrollController();
  var focusNode = FocusNode();
  return Container(
    height: 600,
    width: 350,
    decoration: BoxDecoration(
        color: Colors.white, borderRadius: BorderRadius.circular(20)),
    child: Stack(
      children: [
        Align(
          alignment: Alignment.topLeft,
          child: Container(
            padding: const EdgeInsets.all(10),
            decoration: const BoxDecoration(
                color: Color(0xFFDC9A54),
                borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(20),
                    topRight: Radius.circular(20))),
            child: Row(
              children: [
                Container(
                  decoration: BoxDecoration(
                      border: Border.all(color: Colors.black),
                      borderRadius: BorderRadius.circular(30)),
                  margin: const EdgeInsets.only(right: 10),
                  child: const CircleAvatar(
                    radius: 30,
                    backgroundImage:
                        AssetImage("assets/images/icono_chatbot.png"),
                    backgroundColor: Colors.white,
                  ),
                ),
                const Text(
                  "einstein",
                  style: TextStyle(fontSize: 15, fontFamily: "bttf"),
                ),
              ],
            ),
          ),
        ),
        Align(
          alignment: Alignment.topRight,
          child: Container(
            margin: const EdgeInsets.only(top: 20, right: 20),
            child: IconButton(
                onPressed: () {
                  BlocProvider.of<ChatBotBloc>(mainContext).activeChatBot(false);
                },
                icon: const Icon(Icons.close)),
          ),
        ),
        Align(
          alignment: Alignment.center,
          child: BlocBuilder<ChatBotBloc, ChatBotState>(
            builder: (context, state) => SizedBox(
              height: 400,
              child: ListView.builder(
                controller: scrollController,
                itemCount: state.messages.length,
                reverse: true,
                itemBuilder: (BuildContext context, int index) {
                  return messageWidget(state.messages[index]);
                },
              ),
            ),
          ),
        ),
        Align(
          alignment: Alignment.bottomCenter,
          child: Container(
            margin: const EdgeInsets.only(bottom: 10),
            width: 320,
            child: BlocBuilder<ChatBotBloc, ChatBotState>(builder: (context, state) => TextField(
              controller: messageCtrl,
              focusNode: focusNode,
              readOnly: state.readOnlyField,
              onSubmitted: (value) {
                if (value.isNotEmpty) {
                  sendFunction(mainContext, value, focusNode, scrollController);
                }
                focusNode.requestFocus();
              },
              decoration: InputDecoration(
                suffixIcon: Container(
                    margin: const EdgeInsets.only(right: 10),
                    child: IconButton(
                      onPressed: () {
                        if (messageCtrl.text.isNotEmpty) {
                          sendFunction(mainContext, messageCtrl.text, focusNode, scrollController);
                        }
                        focusNode.requestFocus();
                      },
                      icon: const Icon(Icons.keyboard_return_outlined),
                      color: Colors.black,
                    )),
                focusedBorder: OutlineInputBorder(
                    borderSide:
                    const BorderSide(color: Colors.black, width: 1.5),
                    borderRadius: BorderRadius.circular(50)),
                enabledBorder: OutlineInputBorder(
                    borderSide: const BorderSide(color: Colors.black, width: 1),
                    borderRadius: BorderRadius.circular(50)),
              ),
            ),),
          ),
        )
      ],
    ),
  );
}
