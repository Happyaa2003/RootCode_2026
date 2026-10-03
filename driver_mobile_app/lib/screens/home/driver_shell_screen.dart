import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/route_provider.dart';
import '../../providers/offline_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../widgets/offline_status_bar.dart';
import '../navigation/active_delivery_screen.dart';
import '../manifest/manifest_screen.dart';
import '../telemetry/reefer_telemetry_screen.dart';
import '../exceptions/report_exception_screen.dart';
import '../profile/driver_profile_screen.dart';

class DriverShellScreen extends StatefulWidget {
  const DriverShellScreen({super.key});

  @override
  State<DriverShellScreen> createState() => _DriverShellScreenState();
}

class _DriverShellScreenState extends State<DriverShellScreen> {
  int _currentIndex = 0;

  final List<Widget> _tabs = const [
    ActiveDeliveryScreen(),
    ManifestScreen(),
    ReeferTelemetryScreen(),
    ReportExceptionScreen(),
    DriverProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final routeProv = context.watch<RouteProvider>();
    final offlineProv = context.watch<OfflineProvider>();

    // Listen for toast messages from route provider
    if (routeProv.toastMessage != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.check_circle, color: AppColors.success, size: 18),
                const SizedBox(width: 8),
                Expanded(child: Text(routeProv.toastMessage!)),
              ],
            ),
            backgroundColor: const Color(0xFF0F172A),
            behavior: SnackBarBehavior.floating,
            duration: const Duration(seconds: 3),
          ),
        );
        routeProv.clearToast();
      });
    }

    return Scaffold(
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(60),
        child: AppBar(
          backgroundColor: AppColors.surfaceSubtle,
          elevation: 0,
          title: Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.local_shipping_rounded, color: Colors.white, size: 18),
              ),
              const SizedBox(width: 10),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text(
                    'WAYPILOT DRIVER',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 0.8,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  Text(
                    'Route 01 · WP-CAD-4821',
                    style: TextStyle(
                      fontSize: 10,
                      fontFamily: 'monospace',
                      color: AppColors.textMuted,
                    ),
                  ),
                ],
              ),
            ],
          ),
          actions: [
            IconButton(
              icon: Icon(
                offlineProv.isOffline ? Icons.wifi_off_rounded : Icons.wifi_rounded,
                color: offlineProv.isOffline ? AppColors.error : AppColors.success,
                size: 20,
              ),
              tooltip: 'Network Status (Tap to toggle offline)',
              onPressed: () => offlineProv.toggleOffline(),
            ),
            IconButton(
              icon: const Icon(Icons.refresh_rounded, size: 20, color: AppColors.textSecondary),
              tooltip: 'Refresh Routes',
              onPressed: () => routeProv.loadRoutes(),
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          const OfflineStatusBar(),
          Expanded(child: _tabs[_currentIndex]),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        items: [
          const BottomNavigationBarItem(
            icon: Icon(Icons.navigation_outlined),
            activeIcon: Icon(Icons.navigation),
            label: 'Mission',
          ),
          BottomNavigationBarItem(
            icon: Stack(
              children: [
                const Icon(Icons.format_list_bulleted_outlined),
                if (routeProv.totalStopsCount > 0)
                  Positioned(
                    right: 0,
                    top: 0,
                    child: Container(
                      padding: const EdgeInsets.all(2),
                      decoration: const BoxDecoration(
                        color: AppColors.primary,
                        shape: BoxShape.circle,
                      ),
                      constraints: const BoxConstraints(minWidth: 12, minHeight: 12),
                    ),
                  ),
              ],
            ),
            activeIcon: const Icon(Icons.format_list_bulleted),
            label: 'Manifest',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.ac_unit_outlined),
            activeIcon: Icon(Icons.ac_unit),
            label: 'Cold Chain',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.warning_amber_rounded),
            activeIcon: Icon(Icons.warning_rounded),
            label: 'SOS Alert',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.person_outline),
            activeIcon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}
