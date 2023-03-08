import 'package:flutter/material.dart';
import 'package:padook/bloc/chart_bloc/chart_bloc.dart';
import 'package:padook/widgets/char_widgets.dart';
import 'package:syncfusion_flutter_charts/charts.dart';

Widget loadCorrectWidget(ChartState state) {
  if (state.widgetActive == 2) {
    return getChartPredictWidget(state);
  } else if (state.widgetActive == 1) {
    return const Center(
      child: CircularProgressIndicator(color: Color(0xFFDC9A54)),
    );
  } else {
    return Container();
  }
}

Container getChartPredictWidget(ChartState state) {
  List<Map<String, Object>>? data = state.priceResult?.entries
      .map((entry) => {"type": entry.key, "price": entry.value})
      .toList();
  Map<String, Color> columnColors = {
    "Precio Máximo": Colors.red,
    "Predicción": Colors.yellow,
    "Precio Mínimo": Colors.green
  };
  return Container(
    decoration: BoxDecoration(
      borderRadius: BorderRadius.circular(10),
      color: Colors.white,
      border: Border.all(color: Colors.blue, width: 3),
    ),
    padding: const EdgeInsets.symmetric(vertical: 20),
    width: 700,
    child: Row(
      children: [
        SfCartesianChart(
          primaryXAxis: CategoryAxis(),
          series: <ColumnSeries>[
            ColumnSeries<Map<String, Object>, String>(
                dataSource: data!,
                xValueMapper: (data, _) => data['type'].toString(),
                yValueMapper: (data, _) => data['price'] as double,
                pointColorMapper: (data, _) => columnColors[data["type"]]),
          ],
        ),
        priceValue(
            state.priceResult!["Predicción"],
            state.priceResult!["Precio Mínimo"],
            state.priceResult!["Precio Máximo"])
      ],
    ),
  );
}
