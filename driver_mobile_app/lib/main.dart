import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/theme/app_theme.dart';
import 'services/api_service.dart';
import 'services/offline_storage_service.dart';
import 'services/telemetry_service.dart';
import 'providers/auth_provider.dart';
import 'providers/route_provider.dart';
import 'providers/offline_provider.dart';
import 'providers/telemetry_provider.dart';
import 'screens/auth/login_screen.dart';
import 'screens/home/driver_shell_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await OfflineStorageService.init();

  final apiService = ApiService();
  final telemetryService = TelemetryService();

  runApp(
    MultiProvider(
      providers: [
        Provider<ApiService>.value(value: apiService),
        Provider<TelemetryService>.value(value: telemetryService),
        ChangeNotifierProvider(create: (_) => AuthProvider(apiService)),
        ChangeNotifierProvider(create: (_) => OfflineProvider(apiService)),
        ChangeNotifierProvider(create: (_) => TelemetryProvider(telemetryService)),
        ChangeNotifierProvider(create: (_) => RouteProvider(apiService)),
      ],
      child: const WayPilotDriverApp(),
    ),
  );
}

class WayPilotDriverApp extends StatelessWidget {
  const WayPilotDriverApp({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return MaterialApp(
      title: 'WayPilot Driver',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: auth.isAuthenticated ? const DriverShellScreen() : const LoginScreen(),
    );
  }
}
