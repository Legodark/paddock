
import 'package:flutter/material.dart';
import 'package:padook/price_classifier/price_classifier.dart';
import 'package:syncfusion_flutter_gauges/gauges.dart';

SfRadialGauge priceValue(price, minimumPrice, maximumPrice) {
  String priceClassified = priceClasifier(price, minimumPrice, maximumPrice);
  double middleRight = (maximumPrice - minimumPrice) / 1.33 + minimumPrice;
  double middleLeft = (maximumPrice - minimumPrice) / 4 + minimumPrice;
  return SfRadialGauge(
      title: const GaugeTitle(
          text: 'Precio',
          textStyle:
          TextStyle(color: Colors.white,fontSize: 20.0, fontWeight: FontWeight.bold)),
      enableLoadingAnimation: true,
      animationDuration: 2000,
      axes: <RadialAxis>[
        RadialAxis(minimum: minimumPrice, maximum: maximumPrice != minimumPrice ? maximumPrice: maximumPrice + 1, showLabels: false, ranges: <GaugeRange>[
          GaugeRange(
              startValue: minimumPrice,
              endValue: middleLeft,
              color: Colors.green,
              startWidth: 10,
              endWidth: 10),
          GaugeRange(
              startValue: middleLeft,
              endValue: middleRight,
              color: Colors.yellow,
              startWidth: 10,
              endWidth: 10),
          GaugeRange(
              startValue: middleRight,
              endValue: maximumPrice,
              color: Colors.red,
              startWidth: 10,
              endWidth: 10)
        ], pointers: <GaugePointer>[
          NeedlePointer(value: price, needleColor: Colors.white, knobStyle: const KnobStyle(color: Colors.white),)
        ], annotations: <GaugeAnnotation>[
          GaugeAnnotation(
              widget: Text(priceClassified,
                  style: const TextStyle(
                      fontSize: 25, fontWeight: FontWeight.bold, color: Colors.white)),
              angle: 90,
              positionFactor: 0.5)
        ])
      ]);
}