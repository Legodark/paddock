import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:padook/bloc/form_bloc/form_bloc.dart';
import 'package:padook/bloc/json_bloc/json_data_bloc.dart';
import 'package:padook/bloc/brand_logo_bloc/brand_logo_bloc.dart';

Container getTextField(inputCtrl, emptyMessage, textField) {
  return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20),
      child: TextFormField(
          controller: inputCtrl,
          inputFormatters: [FilteringTextInputFormatter.digitsOnly],
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
    width: 430,
    margin: const EdgeInsets.symmetric(vertical: 10, horizontal: 20),
    child: DropdownButtonFormField(
        style: const TextStyle(color: Colors.white),
        dropdownColor: const Color(0xFF6e6e6e),
        decoration: const InputDecoration(
          labelText: 'Marca',
        ),
        items:
        state.brandsData.entries.map((MapEntry<dynamic, dynamic> entry) {
          return DropdownMenuItem(
            value: entry.key,
            child: Text(entry.value),
          );
        }).toList(),
        value: state.brandSelected,
        onChanged: (Object? value) {
          BlocProvider.of<JsonDataBloc>(context).selectMarch(value as String);
          BlocProvider.of<JsonDataBloc>(context).filterModel(value);
          BlocProvider.of<MarchLogoBloc>(context).setUrl(
              state.brandsData[value].toLowerCase().replaceAll(
                  " ", "_").replaceAll("-", "_"));
        }),
  );
}

Container getModelMenu(BuildContext context, JsonDataState state) {
  return Container(
    width: 510,
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

Container getGearBoxMenu(BuildContext context, FormInputState state, Map<String, String> mapId) {
  return Container(
    width: 10,
    margin: const EdgeInsets.symmetric(horizontal: 20),
    child: DropdownButtonFormField(
        style: const TextStyle(color: Colors.white),
        dropdownColor: const Color(0xFF6e6e6e),
        decoration: const InputDecoration(
          labelText: 'Caja de cambios',
        ),
        items:
        mapId.entries.map((MapEntry<dynamic, dynamic> entry) {
          return DropdownMenuItem(
            value: entry.key,
            child: Text(entry.value),
          );
        }).toList(),
        value: state.gearBoxId,
        onChanged: (Object? value) {
          BlocProvider.of<FormBloc>(context).selectGearBoxId(value as String);
        }),
  );
}

Container getFuelMenu(BuildContext context, FormInputState state, Map<String, String> mapId) {
  return Container(
    width: 100,
    margin: const EdgeInsets.symmetric(horizontal: 20),
    child: DropdownButtonFormField(
        style: const TextStyle(color: Colors.white),
        dropdownColor: const Color(0xFF6e6e6e),
        decoration: const InputDecoration(
          labelText: 'Tipo de combustible',
        ),
        items:
        mapId.entries.map((MapEntry<dynamic, dynamic> entry) {
          return DropdownMenuItem(
            value: entry.key,
            child: Text(entry.value),
          );
        }).toList(),
        value: state.fuelId,
        onChanged: (Object? value) {
          BlocProvider.of<FormBloc>(context).selectFuelId(value as String);
        }),
  );
}