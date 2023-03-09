

import 'package:flutter/material.dart';
import 'package:syncfusion_flutter_datagrid/datagrid.dart';

SfDataGrid getPredictionDataGrid(DataGridSource dataSource, bool isCheapTable) {
  return SfDataGrid(
    source: dataSource,
    columnWidthMode: ColumnWidthMode.fill,
    columns: <GridColumn>[
      GridColumn(
          columnName: isCheapTable ? 'año' : 'precio',
          label: Container(
              padding: const EdgeInsets.all(5.0),
              alignment: Alignment.center,
              child: Text(
                isCheapTable ? 'Año' : 'Precio', style: const TextStyle(color: Colors.white),
              ))),
      GridColumn(
          columnName: 'marca',
          label: Container(
              padding: const EdgeInsets.all(5.0),
              alignment: Alignment.center,
              child: const Text('Marca', style: TextStyle(color: Colors.white),), )),
      GridColumn(
          columnName: 'modelo',
          label: Container(
              padding: const EdgeInsets.all(5.0),
              alignment: Alignment.center,
              child: const Text('Modelo', style: TextStyle(color: Colors.white),))),
      GridColumn(
          columnName: isCheapTable ? 'precio' : 'año',
          label: Container(
              padding: const EdgeInsets.all(5.0),
              alignment: Alignment.center,
              child: Text(isCheapTable ? 'Precio' : 'Año', style: const TextStyle(color: Colors.white),))),
    ],
  );
}