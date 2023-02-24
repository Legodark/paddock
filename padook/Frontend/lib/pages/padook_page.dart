import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class PadookPage extends StatefulWidget {
  const PadookPage({Key? key}) : super(key: key);

  @override
  State<PadookPage> createState() => _PadookPageState();
}

class _PadookPageState extends State<PadookPage> {

  void showChat() {

  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(body: const Text("prueba"),
        floatingActionButton: FloatingActionButton(
          onPressed: showChat,
          tooltip: 'Show chatbot',
          child: const Icon(Icons.comment),
        ));
  }
}
