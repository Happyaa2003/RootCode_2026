import 'coordinates.dart';
import 'driver.dart';

class Vehicle {
  final String id;
  final String plate;
  final String type; // 'Standard', 'Reefer', 'Large'
  final double capacityVolume;
  final double capacityWeight;
  final bool hasRefrigeration;
  final String status;
  final Driver? driver;
  final Coordinates? location;
  final double? heading;
  final double kmPerL;
  final double weeklyFuelQuotaL;
  final double fuelConsumedL;
  final String? depotId;

  Vehicle({
    required this.id,
    required this.plate,
    required this.type,
    required this.capacityVolume,
    required this.capacityWeight,
    required this.hasRefrigeration,
    required this.status,
    this.driver,
    this.location,
    this.heading,
    this.kmPerL = 5.5,
    this.weeklyFuelQuotaL = 120.0,
    this.fuelConsumedL = 0.0,
    this.depotId,
  });

  factory Vehicle.fromJson(Map<String, dynamic> json) {
    return Vehicle(
      id: json['id'] as String? ?? '',
      plate: json['plate'] as String? ?? '',
      type: json['type'] as String? ?? 'Standard',
      capacityVolume: (json['capacityVolume'] as num?)?.toDouble() ?? 10.0,
      capacityWeight: (json['capacityWeight'] as num?)?.toDouble() ?? 1500.0,
      hasRefrigeration: json['hasRefrigeration'] as bool? ?? false,
      status: json['status'] as String? ?? 'Active',
      driver: json['driver'] != null ? Driver.fromJson(json['driver']) : null,
      location: json['location'] != null ? Coordinates.fromJson(json['location']) : null,
      heading: (json['heading'] as num?)?.toDouble(),
      kmPerL: (json['kmPerL'] as num?)?.toDouble() ?? 5.5,
      weeklyFuelQuotaL: (json['weeklyFuelQuotaL'] as num?)?.toDouble() ?? 120.0,
      fuelConsumedL: (json['fuelConsumedL'] as num?)?.toDouble() ?? 0.0,
      depotId: json['depotId'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'plate': plate,
    'type': type,
    'capacityVolume': capacityVolume,
    'capacityWeight': capacityWeight,
    'hasRefrigeration': hasRefrigeration,
    'status': status,
    'driver': driver?.toJson(),
    'location': location?.toJson(),
    'heading': heading,
    'kmPerL': kmPerL,
    'weeklyFuelQuotaL': weeklyFuelQuotaL,
    'fuelConsumedL': fuelConsumedL,
    'depotId': depotId,
  };
}
