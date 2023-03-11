
import 'package:flutter/material.dart';
import 'package:syncfusion_flutter_datagrid/datagrid.dart';

class QueryCarDataSource extends DataGridSource {
  QueryCarDataSource(
      {required List<dynamic> cars}) {
    _cars = cars
        .map<DataGridRow>((c) => DataGridRow(cells: [
      DataGridCell<String>(columnName: 'modelo', value: c["modelo"]),
      DataGridCell<String>(columnName: 'localidad', value: c["localidad"]),
      DataGridCell<int>(columnName: 'año', value: double.parse(c["año"]).toInt()),
      DataGridCell<int>(columnName: 'cv', value: double.parse(c["motor (CV)"]).toInt()),
      DataGridCell<int>(columnName: 'cilindrada', value: double.parse(c["cilindrada"]).toInt()),
      DataGridCell<String>(columnName: 'combustible', value: c["combustible"]),
      DataGridCell<int>(columnName: 'kilometros', value: double.parse(c["kilometros"]).toInt()),
      DataGridCell<String>(columnName: 'cambio', value: c["cambio"]),
      DataGridCell<int>(columnName: 'marchas', value: double.parse(c["marchas"]).toInt()),
      DataGridCell<int>(columnName: 'precio', value: double.parse(c["precio"]).toInt()),
    ]))
        .toList();
  }

  List<DataGridRow> _cars = [];

  @override
  List<DataGridRow> get rows => _cars;

  @override
  DataGridRowAdapter? buildRow(DataGridRow row) {
    return DataGridRowAdapter(
        cells: row.getCells().map<Widget>((dataGridCell) {
          return Container(
            alignment: Alignment.center,
            child: Text(
              "${dataGridCell.value.toString()}${(dataGridCell.columnName == "precio" ? " €" : "")}",
              style: const TextStyle(
                  color: Colors.white, fontSize: 12),
            ),
          );
        }).toList());
  }
}