import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/telemetry_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../widgets/metric_card.dart';

class ReeferTelemetryScreen extends StatelessWidget {
  const ReeferTelemetryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final telemetryProv = context.watch<TelemetryProvider>();
    final telemetry = telemetryProv.telemetry;
    final isTempSafe = telemetry.currentTemp <= 4.0 && telemetry.currentTemp >= 1.0;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Cold Chain & Vehicle Telematics'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Reefer Temperature Hero Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: isTempSafe
                      ? [const Color(0xFF0F2B48), const Color(0xFF131B2E)]
                      : [const Color(0xFF4A1515), const Color(0xFF1E1010)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isTempSafe ? AppColors.coldChilled.withValues(alpha: 0.4) : AppColors.error,
                  width: 1.5,
                ),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Icon(
                            Icons.ac_unit_rounded,
                            color: isTempSafe ? AppColors.coldChilled : AppColors.error,
                            size: 22,
                          ),
                          const SizedBox(width: 8),
                          const Text(
                            'REEFER CARGO BAY',
                            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, letterSpacing: 0.8),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: (isTempSafe ? AppColors.success : AppColors.error).withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          isTempSafe ? 'OPTIMAL CHILLED' : 'TEMPERATURE ALERT',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            color: isTempSafe ? AppColors.success : AppColors.error,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Text(
                    '${telemetry.currentTemp > 0 ? '+' : ''}${telemetry.currentTemp.toStringAsFixed(1)}°C',
                    style: TextStyle(
                      fontSize: 48,
                      fontWeight: FontWeight.w900,
                      color: isTempSafe ? AppColors.coldChilled : AppColors.error,
                      letterSpacing: -1,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Target: +${telemetry.targetTemp.toStringAsFixed(1)}°C · Tolerance: ±1.5°C',
                    style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                  ),
                  const SizedBox(height: 18),
                  // Progress indicator of cold zone
                  ClipRRect(
                    borderRadius: BorderRadius.circular(6),
                    child: LinearProgressIndicator(
                      value: (telemetry.currentTemp / 10.0).clamp(0.0, 1.0),
                      backgroundColor: AppColors.surfaceSubtle,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        isTempSafe ? AppColors.coldChilled : AppColors.error,
                      ),
                      minHeight: 8,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Door Sensor Alert Banner if open
            if (telemetry.doorOpen)
              Container(
                margin: const EdgeInsets.only(bottom: 16),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.errorBg,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.error),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.door_front_door_outlined, color: AppColors.error, size: 22),
                    SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Warning: Cargo Door Open',
                            style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12, color: Colors.white),
                          ),
                          Text(
                            'Close rear doors immediately after unloading to preserve cold-chain.',
                            style: TextStyle(fontSize: 10.5, color: AppColors.textSecondary),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

            // 4 Grid Telematics Metrics
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1.35,
              children: [
                MetricCard(
                  title: 'GPS SPEED',
                  value: '${telemetry.speedKmh.toInt()} km/h',
                  subtitle: 'Peliyagoda Corridor',
                  icon: Icons.speed_rounded,
                  accentColor: AppColors.info,
                ),
                MetricCard(
                  title: 'DIESEL FUEL',
                  value: '${telemetry.fuelLevelPct.toStringAsFixed(0)}%',
                  subtitle: '118 L Remaining',
                  icon: Icons.local_gas_station_rounded,
                  accentColor: AppColors.success,
                ),
                MetricCard(
                  title: 'BATTERY HEALTH',
                  value: '${telemetry.batteryVolts} V',
                  subtitle: 'Dual Alternator OK',
                  icon: Icons.battery_charging_full_rounded,
                  accentColor: AppColors.warning,
                ),
                MetricCard(
                  title: 'TIRE PRESSURE',
                  value: '${telemetry.tirePressurePsi.toInt()} PSI',
                  subtitle: 'All 6 Wheels Normal',
                  icon: Icons.tire_repair_rounded,
                  accentColor: AppColors.primaryLight,
                ),
              ],
            ),

            const SizedBox(height: 20),

            // Telematics Hardware & Sensor Simulator Controls
            const Text(
              'TELEMETRY SENSOR CONTROLS (DEMO)',
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.textMuted, letterSpacing: 0.5),
            ),
            const SizedBox(height: 10),

            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                children: [
                  SwitchListTile(
                    title: const Text('Reefer Cooling Unit', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
                    subtitle: Text(
                      telemetry.reeferActive ? 'Compressor Active (Auto-regulating)' : 'Standby / Eco Mode',
                      style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                    ),
                    value: telemetry.reeferActive,
                    activeThumbColor: AppColors.coldChilled,
                    onChanged: (_) => telemetryProv.toggleReefer(),
                  ),
                  const Divider(color: AppColors.border),
                  SwitchListTile(
                    title: const Text('Cargo Rear Door Sensor', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
                    subtitle: Text(
                      telemetry.doorOpen ? 'DOOR OPEN (Unloading)' : 'DOOR SEALED & LOCKED',
                      style: TextStyle(
                        fontSize: 11,
                        color: telemetry.doorOpen ? AppColors.error : AppColors.success,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    value: telemetry.doorOpen,
                    activeThumbColor: AppColors.error,
                    onChanged: (_) => telemetryProv.toggleDoor(),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
