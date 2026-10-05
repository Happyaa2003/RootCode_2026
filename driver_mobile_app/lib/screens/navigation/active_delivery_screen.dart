import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/route_provider.dart';
import '../../providers/telemetry_provider.dart';
import '../../providers/offline_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../widgets/sla_confidence_badge.dart';
import '../../widgets/cargo_chip.dart';
import '../pod/proof_of_delivery_screen.dart';
import '../exceptions/report_exception_screen.dart';

class ActiveDeliveryScreen extends StatelessWidget {
  const ActiveDeliveryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final routeProv = context.watch<RouteProvider>();
    final telemetryProv = context.watch<TelemetryProvider>();
    final offlineProv = context.watch<OfflineProvider>();
    final currentStop = routeProv.currentStop;
    final speed = telemetryProv.telemetry.speedKmh.toInt();

    if (currentStop == null) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.check_circle_outline, size: 64, color: AppColors.success),
              const SizedBox(height: 16),
              const Text('All Route Deliveries Completed!', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
              const SizedBox(height: 8),
              const Text('Great job! Return vehicle to Peliyagoda Central Depot.', style: TextStyle(color: AppColors.textMuted)),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: () => routeProv.loadRoutes(),
                child: const Text('Refresh Route Manifest'),
              ),
            ],
          ),
        ),
      );
    }

    final order = currentStop.order;
    final isDelivered = currentStop.status == 'Delivered';
    final isArrived = currentStop.status == 'Arrived';

    return Scaffold(
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Turn-by-Turn GPS Navigation Banner
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.primary.withValues(alpha: 0.4)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.4),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.navigation_rounded, color: Colors.white, size: 24),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'IN 450 METERS',
                              style: TextStyle(
                                fontSize: 10.5,
                                fontWeight: FontWeight.w800,
                                color: AppColors.primaryLight,
                                letterSpacing: 0.5,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Turn left onto ${order.outlet.address.split(',').first}',
                              style: const TextStyle(
                                fontSize: 14.5,
                                fontWeight: FontWeight.w800,
                                color: Colors.white,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const Divider(color: AppColors.border, height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.access_time, size: 14, color: AppColors.primaryLight),
                          const SizedBox(width: 4),
                          Text(
                            'ETA: ${currentStop.eta}',
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.primaryLight),
                          ),
                        ],
                      ),
                      const Text(
                        '2.4 km remaining',
                        style: TextStyle(fontSize: 11.5, color: AppColors.textMuted),
                      ),
                      Row(
                        children: [
                          const Icon(Icons.speed, size: 14, color: AppColors.success),
                          const SizedBox(width: 4),
                          Text(
                            '$speed km/h',
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.success),
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Current Stop Mission Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isArrived ? AppColors.warning : AppColors.primary,
                  width: 2,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          'CURRENT STOP · ${currentStop.sequence} OF ${routeProv.totalStopsCount}',
                          style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Colors.white, letterSpacing: 0.5),
                        ),
                      ),
                      SlaConfidenceBadge(confidencePct: order.onTimeProbability ?? 95.0),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    order.outlet.name,
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.location_on_outlined, size: 14, color: AppColors.textMuted),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          order.outlet.address,
                          style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                        ),
                      ),
                    ],
                  ),
                  if (order.outlet.accessNotes != null) ...[
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceSubtle,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.info_outline, size: 14, color: AppColors.warning),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              order.outlet.accessNotes!,
                              style: const TextStyle(fontSize: 11, color: AppColors.warning),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                  const SizedBox(height: 14),

                  // Cargo Specifications Pillbox Grid
                  GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisSpacing: 8,
                    mainAxisSpacing: 8,
                    childAspectRatio: 2.3,
                    children: [
                      CargoChip(
                        label: 'Time Window',
                        value: '${order.window.start} – ${order.window.end}',
                        icon: Icons.access_time_filled,
                      ),
                      CargoChip(
                        label: 'Cargo Volume',
                        value: '${order.volume} m³ (${order.units}u)',
                        icon: Icons.inventory_2_outlined,
                      ),
                      CargoChip(
                        label: 'Cold Target',
                        value: '${order.temp} (+3.2°C)',
                        icon: Icons.ac_unit,
                        valueColor: AppColors.coldChilled,
                      ),
                      CargoChip(
                        label: 'Unloading Dock',
                        value: order.dockType.toUpperCase().replaceAll('_', ' '),
                        icon: Icons.local_shipping_outlined,
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),

                  // Driver Quick Actions (Call Store, Arrived at Dock)
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Calling Store Receiving Lead: +94 77 123 4567')),
                            );
                          },
                          icon: const Icon(Icons.phone_outlined, size: 15),
                          label: const Text('Call Store'),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: isArrived
                              ? null
                              : () => routeProv.markArrivedAtDock(isOffline: offlineProv.isOffline),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: isArrived ? AppColors.surfaceElevated : AppColors.surfaceElevated,
                            foregroundColor: isArrived ? AppColors.success : AppColors.primaryLight,
                            side: BorderSide(color: isArrived ? AppColors.success : AppColors.primaryLight),
                          ),
                          icon: Icon(isArrived ? Icons.check : Icons.access_time, size: 15),
                          label: Text(isArrived ? 'Arrived at Dock' : 'Log Arrival'),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 12),

                  // Complete POD Main Action Button
                  ElevatedButton.icon(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => ProofOfDeliveryScreen(order: order),
                        ),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isDelivered ? AppColors.primary : AppColors.success,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    icon: const Icon(Icons.camera_alt, color: Colors.white),
                    label: Text(
                      isDelivered ? 'Review Proof of Delivery' : 'Complete Delivery & POD Signoff',
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // SOS / Report Delay Action Button
            OutlinedButton.icon(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const ReportExceptionScreen()),
                );
              },
              style: OutlinedButton.styleFrom(
                side: BorderSide(color: AppColors.error.withValues(alpha: 0.6)),
                foregroundColor: AppColors.error,
                padding: const EdgeInsets.symmetric(vertical: 12),
              ),
              icon: const Icon(Icons.warning_amber_rounded, size: 18, color: AppColors.error),
              label: const Text('Report Road Traffic / Vehicle Delay (SOS)', style: TextStyle(fontWeight: FontWeight.w700)),
            ),

            const SizedBox(height: 16),

            // Upcoming Next Stops
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'UPCOMING STOPS ON ROUTE 01',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.textMuted, letterSpacing: 0.5),
                  ),
                  const SizedBox(height: 12),
                  ...routeProv.currentRoute!.stops.skip(routeProv.currentStopIndex + 1).take(2).map((s) {
                    return Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceSubtle,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Container(
                                width: 24,
                                height: 24,
                                decoration: BoxDecoration(
                                  color: AppColors.surfaceElevated,
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Center(
                                  child: Text('${s.sequence}', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 11)),
                                ),
                              ),
                              const SizedBox(width: 10),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(s.order.outlet.name, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12.5)),
                                  Text('${s.order.units}u · ${s.order.volume} m³', style: const TextStyle(fontSize: 10.5, color: AppColors.textMuted)),
                                ],
                              ),
                            ],
                          ),
                          Text(s.eta, style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700, color: AppColors.textSecondary)),
                        ],
                      ),
                    );
                  }),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
