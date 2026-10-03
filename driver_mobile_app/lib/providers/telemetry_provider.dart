import 'package:flutter/foundation.dart';
import '../models/telemetry.dart';
import '../services/telemetry_service.dart';

class TelemetryProvider extends ChangeNotifier {
  final TelemetryService _telemetryService;
  VehicleTelemetry _telemetry = VehicleTelemetry();

  TelemetryProvider(this._telemetryService) {
    _telemetryService.addListener((telemetry) {
      _telemetry = telemetry;
      notifyListeners();
    });
    _telemetryService.startSimulation();
  }

  VehicleTelemetry get telemetry => _telemetry;

  void toggleDoor() {
    _telemetryService.toggleDoor();
  }

  void toggleReefer() {
    _telemetryService.toggleReefer();
  }

  void setTemperature(double temp) {
    _telemetryService.setTemperature(temp);
  }

  @override
  void dispose() {
    _telemetryService.dispose();
    super.dispose();
  }
}
