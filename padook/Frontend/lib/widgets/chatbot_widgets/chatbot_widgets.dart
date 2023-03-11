import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:padook/bloc/chatbot_bloc/chatbot_bloc.dart';

import '../../bloc/chart_bloc/chart_bloc.dart';
import '../../bloc/widget_bloc/main_widget_bloc.dart';
import '../main_widgets/form_widget.dart';

FloatingActionButton chatBotButton(BuildContext context) {
  return FloatingActionButton(
    onPressed: () {
      BlocProvider.of<ChatBotBloc>(context).activeChatBot(true);
      BlocProvider.of<ChartBloc>(context).activeWidget(0);
      BlocProvider.of<MainWidgetBloc>(context)
          .changeFormWidget(buttonToActiveForm(context));
    },
    tooltip: 'Mostrar chatbot',
    child: Stack(
      children: [
        const Align(alignment: Alignment.center, child: CircleAvatar(
          radius: 26,
          backgroundImage: AssetImage("assets/images/icono_chatbot.png"),
          backgroundColor: Colors.white,
        ),),
        Align(
          alignment: Alignment.topRight,
          child: Container(
            width: 15,
            height: 15,
            decoration: BoxDecoration(borderRadius: BorderRadius.circular(15), color: Colors.red),
          ),
        )
      ],
    ),
  );
}

Container messageWidget(Map<String, String> message) {
  return Container(
    padding: const EdgeInsets.all(10),
    child: Align(
      alignment: (message["user"] == "Eistein")
          ? Alignment.centerLeft
          : Alignment.centerRight,
      child: Container(
        padding: const EdgeInsets.all(10),
        constraints: const BoxConstraints(maxWidth: 280),
        decoration: BoxDecoration(
            color: Colors.white,
            border: Border.all(
                color: (message["user"] == "Eistein")
                    ? const Color(0xFFDC9A54)
                    : Colors.blue),
            boxShadow: [
              BoxShadow(
                color: Colors.grey.withOpacity(0.5),
                spreadRadius: 1,
                blurRadius: 3,
                offset: const Offset(0, 3),
              )
            ],
            borderRadius: BorderRadius.only(
                topLeft:
                    Radius.circular((message["user"] == "Eistein") ? 0 : 20),
                topRight:
                    Radius.circular((message["user"] == "Eistein") ? 20 : 0),
                bottomLeft: const Radius.circular(20),
                bottomRight: const Radius.circular(20))),
        child: Text(
          message["message"].toString(),
          textAlign:
              (message["user"] == "Eistein") ? TextAlign.end : TextAlign.start,
        ),
      ),
    ),
  );
}
