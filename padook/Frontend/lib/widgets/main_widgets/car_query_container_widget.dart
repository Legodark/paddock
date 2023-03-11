

import 'package:flutter/material.dart';
import 'package:padook/bloc/car_query_grid_bloc/car_query_grid_bloc.dart';
import 'package:padook/data/data_grid/querycar_datagrid_source.dart';
import 'package:padook/widgets/grid_widgets/grid_widget.dart';

Widget loadCorrectQueryWidget(BuildContext context, CarQueryGridState state) {
  if (state.widgetActive == 2) {
    return getDataQueryContainer(context, state);
  } else if (state.widgetActive == 1) {
    return const Center(
      child: CircularProgressIndicator(color: Color(0xFFDC9A54)),
    );
  } else {
    return Container();
  }
}

Container getDataQueryContainer(BuildContext context, CarQueryGridState state) {
  QueryCarDataSource dataSource = QueryCarDataSource(
      cars: state.data);
  return Container(
    width: 1000,
    decoration: BoxDecoration(
      borderRadius: BorderRadius.circular(10),
      color: const Color(0x664e4e4e),
      border: Border.all(color: const Color(0xFFDC9A54), width: 3),
    ),
    padding: const EdgeInsets.symmetric(vertical: 20),
    child: getQueryDataGrid(dataSource),
  );
}