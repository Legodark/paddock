import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:padook/bloc/json_bloc/json_data_bloc.dart';
import 'package:padook/bloc/march_logo_bloc/march_logo_bloc.dart';
import 'package:padook/page/padook_page.dart';

import 'Themes/input_decoration_theme.dart';

void main() {
  runApp(MultiBlocProvider(
      providers: [
        BlocProvider(
          create: (BuildContext context) => JsonDataBloc(),
        ),
        BlocProvider(
          create: (BuildContext context) => MarchLogoBloc(),
        )
      ],
      child: MaterialApp(
          debugShowCheckedModeBanner: false,
          theme: ThemeData(
              scaffoldBackgroundColor: const Color(0xFF0D0F24),
              floatingActionButtonTheme: const FloatingActionButtonThemeData(
                  backgroundColor: Color(0xFFDC9A54)),
              inputDecorationTheme: getInputTheme()),
          routes: {
            '/': (context) => const PadookPage(),
          })));
}
