import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:padook/bloc/json_bloc/json_data_bloc.dart';
import 'package:padook/bloc/march_logo_bloc/march_logo_bloc.dart';

Container getTextField(inputCtrl, emptyMessage, textField) {
  return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20),
      child: TextFormField(
          controller: inputCtrl,
          validator: (inputText) {
            if (inputText!.isEmpty) {
              return emptyMessage;
            }
            return null;
          },
          style: const TextStyle(color: Colors.white),
          decoration: InputDecoration(
            labelText: textField,
          )));
}

Container getMarchesMenu(BuildContext context, JsonDataState state) {
  return Container(
    width: 200,
    margin: const EdgeInsets.symmetric(vertical: 10, horizontal: 20),
    child: DropdownButtonFormField(
        style: const TextStyle(color: Colors.white),
        dropdownColor: const Color(0xFF6e6e6e),
        decoration: const InputDecoration(
          labelText: 'Marca',
        ),
        items:
        state.marchesData.entries.map((MapEntry<dynamic, dynamic> entry) {
          return DropdownMenuItem(
            value: entry.key,
            child: Text(entry.value),
          );
        }).toList(),
        value: state.marchSelected,
        onChanged: (Object? value) {
          BlocProvider.of<JsonDataBloc>(context).selectMarch(value as String);
          BlocProvider.of<JsonDataBloc>(context).filterModel(value);
          BlocProvider.of<MarchLogoBloc>(context).setUrl(
              state.marchesData[value].toLowerCase().replaceAll(
                  " ", "_").replaceAll("-", "_"));
        }),
  );
}

Container getModelMenu(BuildContext context, JsonDataState state) {
  return Container(
    width: 500,
    margin: const EdgeInsets.symmetric(vertical: 10),
    child: DropdownButtonFormField(
        style: const TextStyle(color: Colors.white),
        dropdownColor: const Color(0xFF6e6e6e),
        decoration: const InputDecoration(
          labelText: 'Modelo',
        ),
        items:
        state.modelsData.entries.map((MapEntry<dynamic, dynamic> entry) {
          return DropdownMenuItem(
            value: entry.key,
            child: Text(entry.value),
          );
        }).toList(),
        value: state.modelSelected,
        onChanged: (Object? value) {
          BlocProvider.of<JsonDataBloc>(context).selectModel(value as String);
        }),
  );
}
