import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../core/constants/app_constants.dart';
import '../models/route_model.dart';
import '../models/order.dart';

class QueuedAction {
  final String id;
  final String type; // 'STATUS_UPDATE', 'POD_SUBMISSION', 'EXCEPTION_REPORT', 'GPS_UPDATE'
  final Map<String, dynamic> payload;
  final DateTime createdAt;

  QueuedAction({
    required this.id,
    required this.type,
    required this.payload,
    required this.createdAt,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'type': type,
    'payload': payload,
    'createdAt': createdAt.toIso8601String(),
  };

  factory QueuedAction.fromJson(Map<String, dynamic> json) => QueuedAction(
    id: json['id'] as String,
    type: json['type'] as String,
    payload: json['payload'] as Map<String, dynamic>,
    createdAt: DateTime.parse(json['createdAt'] as String),
  );
}

class OfflineStorageService {
  static SharedPreferences? _prefs;

  static Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  static SharedPreferences get prefs {
    if (_prefs == null) {
      throw Exception("OfflineStorageService not initialized. Call init() first.");
    }
    return _prefs!;
  }

  // Queue actions
  static Future<void> queueAction(String type, Map<String, dynamic> payload) async {
    final list = getQueuedActions();
    final action = QueuedAction(
      id: 'ACT-${DateTime.now().millisecondsSinceEpoch}',
      type: type,
      payload: payload,
      createdAt: DateTime.now(),
    );
    list.add(action);
    await prefs.setString(
      AppConstants.keyQueuedActions,
      jsonEncode(list.map((e) => e.toJson()).toList()),
    );
  }

  static List<QueuedAction> getQueuedActions() {
    final raw = prefs.getString(AppConstants.keyQueuedActions);
    if (raw == null || raw.isEmpty) return [];
    try {
      final List<dynamic> decoded = jsonDecode(raw) as List<dynamic>;
      return decoded.map((e) => QueuedAction.fromJson(e as Map<String, dynamic>)).toList();
    } catch (_) {
      return [];
    }
  }

  static Future<void> removeQueuedAction(String id) async {
    final list = getQueuedActions();
    list.removeWhere((e) => e.id == id);
    await prefs.setString(
      AppConstants.keyQueuedActions,
      jsonEncode(list.map((e) => e.toJson()).toList()),
    );
  }

  static Future<void> clearQueue() async {
    await prefs.remove(AppConstants.keyQueuedActions);
  }

  // Caching Routes
  static Future<void> cacheRoutes(List<RouteModel> routes) async {
    final encoded = jsonEncode(routes.map((r) => r.toJson()).toList());
    await prefs.setString(AppConstants.keyCachedRoutes, encoded);
  }

  static List<RouteModel> getCachedRoutes() {
    final raw = prefs.getString(AppConstants.keyCachedRoutes);
    if (raw == null || raw.isEmpty) return [];
    try {
      final List<dynamic> decoded = jsonDecode(raw) as List<dynamic>;
      return decoded.map((e) => RouteModel.fromJson(e as Map<String, dynamic>)).toList();
    } catch (_) {
      return [];
    }
  }

  // Caching Orders
  static Future<void> cacheOrders(List<Order> orders) async {
    final encoded = jsonEncode(orders.map((o) => o.toJson()).toList());
    await prefs.setString(AppConstants.keyCachedOrders, encoded);
  }

  static List<Order> getCachedOrders() {
    final raw = prefs.getString(AppConstants.keyCachedOrders);
    if (raw == null || raw.isEmpty) return [];
    try {
      final List<dynamic> decoded = jsonDecode(raw) as List<dynamic>;
      return decoded.map((e) => Order.fromJson(e as Map<String, dynamic>)).toList();
    } catch (_) {
      return [];
    }
  }

  // Save auth token
  static Future<void> saveToken(String token) async {
    await prefs.setString(AppConstants.keyAuthToken, token);
  }

  static String? getToken() {
    return prefs.getString(AppConstants.keyAuthToken);
  }

  static Future<void> clearAuth() async {
    await prefs.remove(AppConstants.keyAuthToken);
    await prefs.remove(AppConstants.keyCurrentUser);
  }
}
