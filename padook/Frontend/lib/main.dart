import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:padook/bloc/chart_bloc/chart_bloc.dart';
import 'package:padook/bloc/json_bloc/json_data_bloc.dart';
import 'package:padook/bloc/brand_logo_bloc/brand_logo_bloc.dart';
import 'package:padook/page/padook_page.dart';

import 'bloc/grid_bloc/grid_bloc.dart';
import 'themes/input_decoration_theme.dart';
import 'bloc/form_bloc/form_bloc.dart';
import 'bloc/widget_bloc/main_widget_bloc.dart';

void main() {
  runApp(MultiBlocProvider(
      providers: [
        BlocProvider(
          create: (BuildContext context) => JsonDataBloc(),
        ),
        BlocProvider(
          create: (BuildContext context) => MarchLogoBloc(),
        ),
        BlocProvider(
          create: (BuildContext context) => FormBloc(),
        ),
        BlocProvider(
          create: (BuildContext context) => MainWidgetBloc(),
        ),
        BlocProvider(
            create: (BuildContext context) => ChartBloc()
        ),
        BlocProvider(
            create: (BuildContext context) => GridBloc()
        ),
      ],
      child: MaterialApp(
          debugShowCheckedModeBanner: false,
          theme: ThemeData(
              scaffoldBackgroundColor: const Color(0xFF0D0F24),
              floatingActionButtonTheme: const FloatingActionButtonThemeData(
                  backgroundColor: Color(0xFFDC9A54)),
              inputDecorationTheme: getInputTheme(),
              outlinedButtonTheme: OutlinedButtonThemeData(
                style: ButtonStyle(
                    backgroundColor:
                        MaterialStateProperty.all(const Color(0xFFDC9A54)),
                    textStyle: MaterialStateProperty.all(
                        const TextStyle(color: Colors.white)),
                    shape: MaterialStateProperty.all(RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(30.0)))),
              ),
              elevatedButtonTheme: ElevatedButtonThemeData(
                  style: ButtonStyle(
                      backgroundColor:
                          MaterialStateProperty.all(const Color(0x664e4e4e)))),
              scrollbarTheme: ScrollbarThemeData(
                  thumbVisibility: MaterialStateProperty.all(true),
                  thumbColor: MaterialStateProperty.all(Colors.white))),
          routes: {
            '/': (context) => const PadookPage(),
          })));
}
