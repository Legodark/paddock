import 'package:animated_loading_border/animated_loading_border.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:padook/bloc/chart_bloc/chart_bloc.dart';
import 'package:padook/bloc/grid_bloc/grid_bloc.dart';
import 'package:padook/data/data_grid/prediction_datagrid_source.dart';
import 'package:padook/widgets/chart_widgets/radial_gauge_widget.dart';
import 'package:padook/widgets/grid_widgets/grid_widget.dart';
import 'package:syncfusion_flutter_charts/charts.dart';

Widget loadCorrectWidget(BuildContext context, ChartState state) {
  if (state.widgetActive == 2) {
    return getChartPredictWidget(context, state);
  } else if (state.widgetActive == 1) {
    return const Center(
      child: CircularProgressIndicator(color: Color(0xFFDC9A54)),
    );
  } else {
    return Container();
  }
}

Container getChartPredictWidget(BuildContext context, ChartState state) {
  List<Map<String, Object>>? data = state.priceResult?.entries
      .map((entry) => {"type": entry.key, "price": entry.value})
      .toList();
  return Container(
    decoration: BoxDecoration(
      borderRadius: BorderRadius.circular(10),
      color: const Color(0x664e4e4e),
      border: Border.all(color: const Color(0xFFDC9A54), width: 3),
    ),
    padding: const EdgeInsets.symmetric(vertical: 20),
    width: 1050,
    child: Column(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        BlocBuilder<GridBloc, GridState>(
          builder: (context, state) {
            CarDataSource expensiveCarSource = CarDataSource(
                cars: state.expensiveCars,
                color: Colors.red,
                isExpensiveTable: false);
            CarDataSource cheapestCarSource = CarDataSource(
                cars: state.cheapestCars,
                color: Colors.green,
                isExpensiveTable: true);
            return Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Column(
                  children: [
                    const Text("Precio mínimo",
                        style: TextStyle(color: Colors.white, fontSize: 20)),
                    Container(
                      width: 400,
                      height: 310,
                      decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                              color: const Color(0xFFDC9A54), width: 1)),
                      child: getPredictionDataGrid(cheapestCarSource, true),
                    )
                  ],
                ),
                AnimatedLoadingBorder(
                    borderColor: const Color(0xFFDC9A54),
                    cornerRadius: 200,
                    borderWidth: 8,
                    duration: const Duration(seconds: 2),
                    child:
                    Container(
                  decoration: BoxDecoration(
                      border: Border.all(color: Colors.blue, width: 4),
                      borderRadius: BorderRadius.circular(200)),
                  padding: const EdgeInsets.all(20),
                  width: 170,
                  height: 170,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      const Text("Valoración obtenida",
                          style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold, ), textAlign: TextAlign.center,),
                      Container(
                        margin: const EdgeInsets.symmetric(horizontal: 5),
                        child: Text(
                          "${data![1]["price"]} €",
                          style: const TextStyle(
                              fontSize: 20, color: Colors.white, fontWeight: FontWeight.bold),
                        ),
                      )
                    ],
                  ),
                )),
                Column(
                  children: [
                    const Text("Precio máximo",
                        style: TextStyle(color: Colors.white, fontSize: 20)),
                    Container(
                      width: 400,
                      height: 310,
                      decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                              color: const Color(0xFFDC9A54), width: 1)),
                      child: getPredictionDataGrid(expensiveCarSource, false),
                    )
                  ],
                )
              ],
            );
          },
        )
      ],
    ),
  );
}

Container getChartsWidget(BuildContext context, ChartState state) {
  List<Map<String, Object>>? data = state.priceResult?.entries
      .map((entry) => {"type": entry.key, "price": entry.value})
      .toList();
  Map<String, Color> columnColors = {
    "Precio Máximo": Colors.red,
    "Predicción": Colors.yellow,
    "Precio Mínimo": Colors.green
  };
  return Container(
      margin: const EdgeInsets.symmetric(vertical: 10),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(10),
        color: const Color(0x664e4e4e),
        border: Border.all(color: const Color(0xFFDC9A54), width: 3),
      ),
      padding: const EdgeInsets.symmetric(vertical: 20),
      width: 1050,
      height: 300,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          SfCartesianChart(
            primaryXAxis:
                CategoryAxis(labelStyle: const TextStyle(color: Colors.white)),
            primaryYAxis:
                CategoryAxis(labelStyle: const TextStyle(color: Colors.white)),
            series: <ColumnSeries>[
              ColumnSeries<Map<String, Object>, String>(
                  dataSource: data!,
                  xValueMapper: (data, _) => data['type'].toString(),
                  yValueMapper: (data, _) => data['price'] as double,
                  dataLabelSettings: const DataLabelSettings(
                      isVisible: true,
                      textStyle: TextStyle(color: Colors.white)),
                  pointColorMapper: (data, _) => columnColors[data["type"]]),
            ],
          ),
          priceValue(
              state.priceResult!["Predicción"],
              state.priceResult!["Precio Mínimo"],
              state.priceResult!["Precio Máximo"])
        ],
      ));
}
