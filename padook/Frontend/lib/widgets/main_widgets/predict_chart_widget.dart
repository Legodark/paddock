import 'package:flutter/material.dart';
import 'package:padook/bloc/chart_bloc/chart_bloc.dart';
import 'package:syncfusion_flutter_charts/charts.dart';

Container getChartPredictWidget(ChartState state) {
  List<Map<String, Object>>? data = state.priceResult?.entries
      .map((entry) => {"type": entry.key, "price": entry.value})
      .toList();
  return Container(
    decoration: BoxDecoration(
      borderRadius: BorderRadius.circular(10),
      color: Colors.white,
      border: Border.all(color: Colors.blue, width: 3),
    ),
    padding: const EdgeInsets.symmetric(vertical: 20),
    width: 700,
    child: Center(
      child: SfCartesianChart(
        primaryXAxis: CategoryAxis(),
        series: <ColumnSeries>[
          ColumnSeries<Map<String, Object>, String>(
            dataSource: data!,
            xValueMapper: (data, _) => data['type'].toString(),
            yValueMapper: (data, _) => data['price'] as double,
          ),
        ],
      ),
    ),
  );
}
