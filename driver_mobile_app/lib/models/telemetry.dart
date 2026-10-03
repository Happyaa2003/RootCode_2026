class VehicleTelemetry {
  final double currentTemp; // Celsius
  final double targetTemp; // Celsius
  final bool reeferActive;
  final bool doorOpen;
  final double fuelLevelPct; // 0-100%
  final double speedKmh;
  final double batteryVolts;
  final double tirePressurePsi;
  final double latitude;
  final double longitude;
  final double heading;

  VehicleTelemetry({
    this.currentTemp = 3.2,
    this.targetTemp = 3.0,
    this.reeferActive = true,
    this.doorOpen = false,
    this.fuelLevelPct = 78.5,
    this.speedKmh = 42.0,
    this.batteryVolts = 24.2,
    this.tirePressurePsi = 36.0,
    this.latitude = 6.9271,
    this.longitude = 79.8612,
    this.heading = 45.0,
  });

  VehicleTelemetry copyWith({
    double? currentTemp,
    double? targetTemp,
    bool? reeferActive,
    bool? doorOpen,
    double? fuelLevelPct,
    double? speedKmh,
    double? batteryVolts,
    double? tirePressurePsi,
    double? latitude,
    double? longitude,
    double? heading,
  }) {
    return VehicleTelemetry(
      currentTemp: currentTemp ?? this.currentTemp,
      targetTemp: targetTemp ?? this.targetTemp,
      reeferActive: reeferActive ?? this.reeferActive,
      doorOpen: doorOpen ?? this.doorOpen,
      fuelLevelPct: fuelLevelPct ?? this.fuelLevelPct,
      speedKmh: speedKmh ?? this.speedKmh,
      batteryVolts: batteryVolts ?? this.batteryVolts,
      tirePressurePsi: tirePressurePsi ?? this.tirePressurePsi,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      heading: heading ?? this.heading,
    );
  }
}
