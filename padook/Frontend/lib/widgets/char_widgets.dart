
import 'package:flutter/material.dart';
import 'package:syncfusion_flutter_gauges/gauges.dart';

SfRadialGauge priceValue(price) {
  return SfRadialGauge(
      title: const GaugeTitle(
          text: 'Precio',
          textStyle:
          TextStyle(fontSize: 20.0, fontWeight: FontWeight.bold)),
      enableLoadingAnimation: true,
      animationDuration: 2000,
      axes: <RadialAxis>[
        RadialAxis(minimum: 0, maximum: 0.3, showLabels: false, ranges: <GaugeRange>[
          GaugeRange(
              startValue: 0,
              endValue: 0.1,
              color: Colors.green,
              startWidth: 10,
              endWidth: 10),
          GaugeRange(
              startValue: 0.1,
              endValue: 0.2,
              color: Colors.orange,
              startWidth: 10,
              endWidth: 10),
          GaugeRange(
              startValue: 0.2,
              endValue: 0.3,
              color: Colors.red,
              startWidth: 10,
              endWidth: 10)
        ], pointers: <GaugePointer>[
          NeedlePointer(value: price)
        ], annotations: <GaugeAnnotation>[
          GaugeAnnotation(
              widget: Container(
                  child: Text(price.toString(),
                      style: TextStyle(
                          fontSize: 25, fontWeight: FontWeight.bold))),
              angle: 90,
              positionFactor: 0.5)
        ])
      ]);
}