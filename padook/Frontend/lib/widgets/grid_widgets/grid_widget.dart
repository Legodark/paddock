

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
          columnName: 'modelo',
          label: Container(
              padding: const EdgeInsets.all(5.0),
              alignment: Alignment.center,
              child: const Text('Modelo', style: TextStyle(color: Colors.white),), )),
      GridColumn(
          columnName: 'kilometros',
          label: Container(
              padding: const EdgeInsets.all(5.0),
              alignment: Alignment.center,
              child: const Text('Kilometros', style: TextStyle(color: Colors.white),))),
      GridColumn(
          columnName: isCheapTable ? 'precio' : 'año',
          label: Container(
              padding: const EdgeInsets.all(5.0),
              alignment: Alignment.center,
              child: Text(isCheapTable ? 'Precio' : 'Año', style: const TextStyle(color: Colors.white),))),
    ],
  );
}

SfDataGrid getQueryDataGrid(DataGridSource dataSource) {
  return SfDataGrid(
    source: dataSource,
    columns: <GridColumn>[
      GridColumn(
          columnName: 'modelo',
          label: Container(
            alignment: Alignment.center,
            child: const Text('Modelo', style: TextStyle(color: Colors.white),), )),
      GridColumn(
          columnName: 'localidad',
          label: Container(
            alignment: Alignment.center,
            child: const Text('Localidad', style: TextStyle(color: Colors.white),), )),
      GridColumn(
          columnName: "año",
          label: Container(
              alignment: Alignment.center,
              child: const Text('Año', style: TextStyle(color: Colors.white),
              ))),
      GridColumn(
          columnName: "cv",
          label: Container(
              alignment: Alignment.center,
              child: const Text('Motor (CV)', style: TextStyle(color: Colors.white),
              ))),
      GridColumn(
          columnName: "cilindrada",
          label: Container(
              alignment: Alignment.center,
              child: const Text('Cilindrada', style: TextStyle(color: Colors.white),
              ))),
      GridColumn(
          columnName: "combustible",
          label: Container(
              alignment: Alignment.center,
              child: const Text('Combustible', style: TextStyle(color: Colors.white),
              ))),
      GridColumn(
          columnName: 'kilometros',
          label: Container(
              alignment: Alignment.center,
              child: const Text('Kilometros', style: TextStyle(color: Colors.white),))),
      GridColumn(
          columnName: "cambio",
          label: Container(
              alignment: Alignment.center,
              child: const Text('Cambio', style: TextStyle(color: Colors.white),
              ))),
      GridColumn(
          columnName: "marchas",
          label: Container(
              alignment: Alignment.center,
              child: const Text('Marchas', style: TextStyle(color: Colors.white),
              ))),
      GridColumn(
          columnName: 'precio',
          label: Container(
              alignment: Alignment.center,
              child: const Text('Precio', style: TextStyle(color: Colors.white),))),
    ],
  );
}