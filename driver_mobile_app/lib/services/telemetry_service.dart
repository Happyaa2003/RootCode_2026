import 'dart:async';
import 'dart:math';
import '../models/telemetry.dart';

class TelemetryService {
  VehicleTelemetry _telemetry = VehicleTelemetry();
  Timer? _simulationTimer;
  final _random = Random();
  final List<void Function(VehicleTelemetry)> _listeners = [];

  VehicleTelemetry get currentTelemetry => _telemetry;

  void addListener(void Function(VehicleTelemetry) listener) {
    _listeners.add(listener);
  }

  void removeListener(void Function(VehicleTelemetry) listener) {
    _listeners.remove(listener);
  }

  void startSimulation({void Function(VehicleTelemetry)? onUpdate}) {
    _simulationTimer?.cancel();
    _simulationTimer = Timer.periodic(const Duration(seconds: 3), (timer) {
      // Simulate subtle realistic cold-chain drift
      final tempDelta = (_random.nextDouble() - 0.5) * 0.2;
      final newTemp = double.parse((_telemetry.currentTemp + tempDelta).clamp(2.5, 4.2).toStringAsFixed(1));
      
      // Speed variation
      final speedDelta = (_random.nextDouble() - 0.48) * 4.0;
      final newSpeed = double.parse((_telemetry.speedKmh + speedDelta).clamp(25.0, 58.0).toStringAsFixed(0));
      
      // Battery voltage
      final volts = double.parse((24.0 + _random.nextDouble() * 0.4).toStringAsFixed(1));
      
      _telemetry = _telemetry.copyWith(
        currentTemp: newTemp,
        speedKmh: newSpeed,
        batteryVolts: volts,
      );

      for (final listener in _listeners) {
        listener(_telemetry);
      }
      onUpdate?.call(_telemetry);
    });
  }

  void toggleDoor() {
    _telemetry = _telemetry.copyWith(doorOpen: !_telemetry.doorOpen);
    for (final listener in _listeners) {
      listener(_telemetry);
    }
  }

  void toggleReefer() {
    _telemetry = _telemetry.copyWith(reeferActive: !_telemetry.reeferActive);
    for (final listener in _listeners) {
      listener(_telemetry);
    }
  }

  void setTemperature(double target) {
    _telemetry = _telemetry.copyWith(targetTemp: target);
    for (final listener in _listeners) {
      listener(_telemetry);
    }
  }

  void dispose() {
    _simulationTimer?.cancel();
    _listeners.clear();
  }
}
