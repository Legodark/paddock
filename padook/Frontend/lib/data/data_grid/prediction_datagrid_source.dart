import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:syncfusion_flutter_datagrid/datagrid.dart';

class CarDataSource extends DataGridSource {
  CarDataSource(
      {required List<Map<String, dynamic>> cars, required this.color, required this.isExpensiveTable}) {
    _cars = cars
        .map<DataGridRow>((c) => DataGridRow(cells: [
              DataGridCell<String>(columnName: isExpensiveTable ? 'año' : 'precio', value: c[isExpensiveTable ? 'año' : 'precio']),
              DataGridCell<String>(columnName: 'marca', value: c["marca"]),
              DataGridCell<String>(columnName: 'modelo', value: c["modelo"]),
              DataGridCell<String>(columnName: isExpensiveTable ? 'precio' : 'año', value: c[isExpensiveTable ? 'precio' : 'año']),
            ]))
        .toList();
  }

  Color color;
  bool isExpensiveTable;
  List<DataGridRow> _cars = [];

  @override
  List<DataGridRow> get rows => _cars;

  @override
  DataGridRowAdapter? buildRow(DataGridRow row) {
    return DataGridRowAdapter(
        cells: row.getCells().map<Widget>((dataGridCell) {
      return Container(
        alignment: Alignment.center,
        padding: const EdgeInsets.all(5.0),
        child: Text(
          dataGridCell.value.toString(),
          style: TextStyle(
              color:
                  dataGridCell.columnName == "precio" ? color : Colors.white),
        ),
      );
    }).toList());
  }
}
