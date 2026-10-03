import 'package:flutter/foundation.dart';

class ApiEndpoints {
  // Configurable base URL
  static String get defaultBaseUrl {
    if (kIsWeb) return 'http://localhost:8000/api/v1';
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return 'http://10.0.2.2:8000/api/v1';
      default:
        return 'http://localhost:8000/api/v1';
    }
  }

  // Endpoints
  static const String login = '/auth/login';
  static const String me = '/auth/me';
  static const String routes = '/routes';
  static const String orders = '/orders';
  static const String fleet = '/fleet';
  static const String drivers = '/drivers';
  static const String updateLocation = '/fleet'; // PATCH /fleet/{id}/location
  static const String updateOrderStatus = '/orders'; // PATCH /orders/{id}/status
  static const String telemetryWs = '/ws/telemetry';
}
