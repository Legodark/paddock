import 'package:flutter/material.dart';

InputDecorationTheme getInputTheme() {
  return const InputDecorationTheme(
      filled: true,
      fillColor: Colors.transparent,
      focusedBorder: OutlineInputBorder(
        borderSide: BorderSide(
          color: Colors.white,
        ),
      ),
      enabledBorder: OutlineInputBorder(
        borderSide: BorderSide(
          color: Colors.white,
          width: 2.0,
        ),
      ),
      labelStyle: TextStyle(color: Colors.white));
}
