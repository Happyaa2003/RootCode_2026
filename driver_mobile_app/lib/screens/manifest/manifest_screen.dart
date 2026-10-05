import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/route_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../widgets/sla_confidence_badge.dart';
import '../pod/proof_of_delivery_screen.dart';

class ManifestScreen extends StatefulWidget {
  const ManifestScreen({super.key});

  @override
  State<ManifestScreen> createState() => _ManifestScreenState();
}

class _ManifestScreenState extends State<ManifestScreen> {
  String _filter = 'All'; // 'All', 'Pending', 'Delivered'

  @override
  Widget build(BuildContext context) {
    final routeProv = context.watch<RouteProvider>();
    final route = routeProv.currentRoute;
    final stops = route?.stops ?? [];

    final filteredStops = stops.where((s) {
      if (_filter == 'Pending') return s.status != 'Delivered';
      if (_filter == 'Delivered') return s.status == 'Delivered';
      return true;
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Delivery Route Manifest'),
            if (route != null)
              Text(
                '${route.name} · ${route.stops.length} Outlets',
                style: const TextStyle(fontSize: 11, color: AppColors.textMuted, fontWeight: FontWeight.normal),
              ),
          ],
        ),
      ),
      body: Column(
        children: [
          // Route Progress Summary Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            color: AppColors.surface,
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'ROUTE PROGRESS: ${routeProv.completedStopsCount} OF ${routeProv.totalStopsCount} COMPLETED',
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.textSecondary),
                    ),
                    Text(
                      '${(routeProv.progressPercentage * 100).toInt()}%',
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppColors.primaryLight),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: routeProv.progressPercentage,
                    backgroundColor: AppColors.surfaceSubtle,
                    valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
                    minHeight: 6,
                  ),
                ),
              ],
            ),
          ),

          // Filter Segment Chips
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: const BoxDecoration(
              border: Border(bottom: BorderSide(color: AppColors.border, width: 1)),
            ),
            child: Row(
              children: ['All', 'Pending', 'Delivered'].map((f) {
                final isSelected = _filter == f;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    label: Text(f, style: TextStyle(fontSize: 11.5, fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500)),
                    selected: isSelected,
                    selectedColor: AppColors.primary,
                    backgroundColor: AppColors.surface,
                    side: BorderSide(color: isSelected ? AppColors.primary : AppColors.border),
                    onSelected: (_) => setState(() => _filter = f),
                  ),
                );
              }).toList(),
            ),
          ),

          // Scrollable List of Stops
          Expanded(
            child: filteredStops.isEmpty
                ? const Center(
                    child: Text('No stops found for selected filter', style: TextStyle(color: AppColors.textMuted)),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: filteredStops.length,
                    separatorBuilder: (context, index) => const SizedBox(height: 12),
                    itemBuilder: (context, idx) {
                      final stop = filteredStops[idx];
                      final isDelivered = stop.status == 'Delivered';
                      final isCurrent = routeProv.currentStop?.order.id == stop.order.id;

                      return Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: isCurrent ? const Color(0xFF1E293B) : AppColors.surface,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: isCurrent
                                ? AppColors.primary
                                : (isDelivered ? AppColors.success.withValues(alpha: 0.5) : AppColors.border),
                            width: isCurrent ? 2 : 1,
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      width: 28,
                                      height: 28,
                                      decoration: BoxDecoration(
                                        color: isDelivered
                                            ? AppColors.success
                                            : (isCurrent ? AppColors.primary : AppColors.surfaceSubtle),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Center(
                                        child: isDelivered
                                            ? const Icon(Icons.check, size: 16, color: Colors.white)
                                            : Text(
                                                '${stop.sequence}',
                                                style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 12),
                                              ),
                                      ),
                                    ),
                                    const SizedBox(width: 10),
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          stop.order.outlet.name,
                                          style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13.5),
                                        ),
                                        Text(
                                          '${stop.order.id} · ETA ${stop.eta}',
                                          style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                                if (isDelivered)
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: AppColors.successBg,
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: const Text(
                                      'Delivered',
                                      style: TextStyle(color: AppColors.success, fontSize: 10.5, fontWeight: FontWeight.w700),
                                    ),
                                  )
                                else
                                  SlaConfidenceBadge(confidencePct: stop.order.onTimeProbability ?? 95.0),
                              ],
                            ),
                            const SizedBox(height: 10),
                            Text(
                              stop.order.outlet.address,
                              style: const TextStyle(fontSize: 11.5, color: AppColors.textSecondary),
                            ),
                            const SizedBox(height: 10),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  '${stop.order.units} Units · ${stop.order.volume} m³ · ${stop.order.temp}',
                                  style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                                ),
                                if (!isDelivered)
                                  TextButton.icon(
                                    onPressed: () {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (_) => ProofOfDeliveryScreen(order: stop.order),
                                        ),
                                      );
                                    },
                                    icon: const Icon(Icons.camera_alt_outlined, size: 14),
                                    label: const Text('Capture POD', style: TextStyle(fontSize: 11)),
                                    style: TextButton.styleFrom(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    ),
                                  ),
                              ],
                            ),
                          ],
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
