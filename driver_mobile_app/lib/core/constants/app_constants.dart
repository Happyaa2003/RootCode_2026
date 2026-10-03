class AppConstants {
  static const String appName = 'WayPilot Driver';
  static const String appVersion = '1.0.0 (Enterprise)';
  static const String appSubtitle = 'Sri Lanka Fleet Logistics Intelligence';
  
  // Default values
  static const String defaultDepot = 'DEP-PEL (Peliyagoda Central)';
  static const String defaultVehicle = 'WP-CAD-4821 (Reefer 12.4m³)';
  static const String defaultDriverId = 'DRV-002';
  static const String defaultDriverName = 'Nimal Silva';
  static const String defaultDriverPhone = '+94 71 234 5678';
  
  // Storage keys
  static const String keyAuthToken = 'waypilot_auth_token';
  static const String keyCurrentUser = 'waypilot_current_user';
  static const String keyQueuedActions = 'waypilot_offline_queue';
  static const String keyCachedRoutes = 'waypilot_cached_routes';
  static const String keyCachedOrders = 'waypilot_cached_orders';
  static const String keyApiBaseUrl = 'waypilot_api_base_url';
}
