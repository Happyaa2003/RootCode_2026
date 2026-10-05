import 'coordinates.dart';
import 'driver.dart';
import 'vehicle.dart';
import 'route_stop.dart';

class RouteModel {
  final String id;
  final String name;
  final Vehicle? vehicle;
  final Driver? driver;
  final List<RouteStop> stops;
  final String status; // 'Draft', 'Planned', 'Active', 'Completed'
  final String color;
  final double usedVolume;
  final double usedWeight;
  final String depotId;
  final String? startTime;
  final String? estimatedFinish;
  final String? firstEta;
  final List<Coordinates>? geometry;
  final double totalCargoValue;
  final double totalRouteCost;
  final double fuelCost;
  final double fuelConsumedL;
  final double laborCost;
  final double profitMargin;
  final double totalDistanceKm;

  RouteModel({
    required this.id,
    required this.name,
    this.vehicle,
    this.driver,
    required this.stops,
    required this.status,
    required this.color,
    required this.usedVolume,
    required this.usedWeight,
    required this.depotId,
    this.startTime,
    this.estimatedFinish,
    this.firstEta,
    this.geometry,
    this.totalCargoValue = 0.0,
    this.totalRouteCost = 0.0,
    this.fuelCost = 0.0,
    this.fuelConsumedL = 0.0,
    this.laborCost = 0.0,
    this.profitMargin = 0.0,
    this.totalDistanceKm = 0.0,
  });

  factory RouteModel.fromJson(Map<String, dynamic> json) {
    return RouteModel(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      vehicle: json['vehicle'] != null ? Vehicle.fromJson(json['vehicle']) : null,
      driver: json['driver'] != null ? Driver.fromJson(json['driver']) : null,
      stops: (json['stops'] as List<dynamic>?)
              ?.map((s) => RouteStop.fromJson(s as Map<String, dynamic>))
              .toList() ??
          [],
      status: json['status'] as String? ?? 'Planned',
      color: json['color'] as String? ?? '#2563EB',
      usedVolume: (json['usedVolume'] as num?)?.toDouble() ?? 0.0,
      usedWeight: (json['usedWeight'] as num?)?.toDouble() ?? 0.0,
      depotId: json['depotId'] as String? ?? 'DEP-PEL',
      startTime: json['startTime'] as String?,
      estimatedFinish: json['estimatedFinish'] as String?,
      firstEta: json['firstEta'] as String?,
      geometry: (json['geometry'] as List<dynamic>?)
          ?.map((g) => Coordinates.fromJson(g as Map<String, dynamic>))
          .toList(),
      totalCargoValue: (json['totalCargoValue'] as num?)?.toDouble() ?? 0.0,
      totalRouteCost: (json['totalRouteCost'] as num?)?.toDouble() ?? 0.0,
      fuelCost: (json['fuelCost'] as num?)?.toDouble() ?? 0.0,
      fuelConsumedL: (json['fuelConsumedL'] as num?)?.toDouble() ?? 0.0,
      laborCost: (json['laborCost'] as num?)?.toDouble() ?? 0.0,
      profitMargin: (json['profitMargin'] as num?)?.toDouble() ?? 0.0,
      totalDistanceKm: (json['totalDistanceKm'] as num?)?.toDouble() ?? 0.0,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'vehicle': vehicle?.toJson(),
    'driver': driver?.toJson(),
    'stops': stops.map((s) => s.toJson()).toList(),
    'status': status,
    'color': color,
    'usedVolume': usedVolume,
    'usedWeight': usedWeight,
    'depotId': depotId,
    'startTime': startTime,
    'estimatedFinish': estimatedFinish,
    'firstEta': firstEta,
    'geometry': geometry?.map((g) => g.toJson()).toList(),
    'totalCargoValue': totalCargoValue,
    'totalRouteCost': totalRouteCost,
    'fuelCost': fuelCost,
    'fuelConsumedL': fuelConsumedL,
    'laborCost': laborCost,
    'profitMargin': profitMargin,
    'totalDistanceKm': totalDistanceKm,
  };
}
