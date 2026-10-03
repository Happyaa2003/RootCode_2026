import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/route_provider.dart';
import '../../providers/offline_provider.dart';
import '../../core/theme/app_colors.dart';

class ReportExceptionScreen extends StatefulWidget {
  const ReportExceptionScreen({super.key});

  @override
  State<ReportExceptionScreen> createState() => _ReportExceptionScreenState();
}

class _ReportExceptionScreenState extends State<ReportExceptionScreen> {
  String _selectedType = 'Traffic Congestion';
  String _selectedSeverity = 'Medium';
  double _delayMinutes = 20.0;
  final _descriptionController = TextEditingController();
  bool _isSubmitting = false;

  final List<String> _exceptionTypes = [
    'Traffic Congestion',
    'Vehicle Reefer Fault',
    'Road Flooding / Blockade',
    'Store Closed / Unreachable',
    'Customer Order Rejected',
    'Mechanical / Tire Puncture',
  ];

  final List<String> _severities = ['Low', 'Medium', 'High', 'Critical'];

  @override
  void dispose() {
    _descriptionController.dispose();
    super.dispose();
  }

  void _handleSubmit() async {
    setState(() => _isSubmitting = true);
    final route = context.read<RouteProvider>();
    final offline = context.read<OfflineProvider>();

    await route.submitExceptionReport(
      type: _selectedType,
      severity: _selectedSeverity,
      description: _descriptionController.text.trim().isNotEmpty
          ? _descriptionController.text.trim()
          : 'Reported $_selectedType with approx ${_delayMinutes.toInt()} min delay',
      estimatedDelayMinutes: _delayMinutes.toInt(),
      isOffline: offline.isOffline,
    );

    if (mounted) {
      setState(() => _isSubmitting = false);
      Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Driver SOS / Exception Report'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Alert Banner
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.warningBg.withValues(alpha: 0.4),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.warning.withValues(alpha: 0.5)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.warning_amber_rounded, color: AppColors.warning, size: 28),
                  SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Instant Dispatcher Notification',
                          style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: Colors.white),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'Reporting will instantly adjust dynamic ETAs and notify Colombo Fleet HQ.',
                          style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 18),

            // Incident Category
            const Text(
              '1. SELECT INCIDENT TYPE',
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.textMuted, letterSpacing: 0.5),
            ),
            const SizedBox(height: 8),

            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _exceptionTypes.map((type) {
                final isSelected = _selectedType == type;
                return ChoiceChip(
                  label: Text(type, style: TextStyle(fontSize: 12, fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500)),
                  selected: isSelected,
                  selectedColor: AppColors.primary,
                  backgroundColor: AppColors.surfaceSubtle,
                  side: BorderSide(color: isSelected ? AppColors.primary : AppColors.border),
                  onSelected: (selected) {
                    if (selected) setState(() => _selectedType = type);
                  },
                );
              }).toList(),
            ),

            const SizedBox(height: 18),

            // Severity
            const Text(
              '2. SEVERITY LEVEL',
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.textMuted, letterSpacing: 0.5),
            ),
            const SizedBox(height: 8),

            Row(
              children: _severities.map((sev) {
                final isSelected = _selectedSeverity == sev;
                Color sevColor = sev == 'Critical'
                    ? AppColors.error
                    : (sev == 'High' ? Colors.orange : (sev == 'Medium' ? AppColors.warning : AppColors.info));

                return Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    child: InkWell(
                      onTap: () => setState(() => _selectedSeverity = sev),
                      borderRadius: BorderRadius.circular(8),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: isSelected ? sevColor.withValues(alpha: 0.2) : AppColors.surfaceSubtle,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: isSelected ? sevColor : AppColors.border,
                            width: isSelected ? 1.5 : 1,
                          ),
                        ),
                        child: Text(
                          sev,
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w700,
                            color: isSelected ? sevColor : AppColors.textSecondary,
                          ),
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),

            const SizedBox(height: 18),

            // Estimated Delay Slider
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  '3. ESTIMATED SCHEDULE DELAY',
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.textMuted, letterSpacing: 0.5),
                ),
                Text(
                  '+${_delayMinutes.toInt()} Minutes',
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.warning),
                ),
              ],
            ),
            Slider(
              value: _delayMinutes,
              min: 5,
              max: 120,
              divisions: 23,
              activeColor: AppColors.warning,
              inactiveColor: AppColors.border,
              onChanged: (val) => setState(() => _delayMinutes = val),
            ),

            const SizedBox(height: 10),

            // Details / Description
            const Text(
              '4. INCIDENT DETAILS',
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.textMuted, letterSpacing: 0.5),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _descriptionController,
              maxLines: 3,
              decoration: const InputDecoration(
                hintText: 'Describe location or road conditions (e.g. Galle Road near Wellawatte flooded due to heavy rain).',
              ),
            ),

            const SizedBox(height: 24),

            // Submit SOS Button
            ElevatedButton.icon(
              onPressed: _isSubmitting ? null : _handleSubmit,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.error,
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              icon: const Icon(Icons.send_rounded, color: Colors.white),
              label: _isSubmitting
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : const Text('Broadcast Exception to Dispatcher', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800)),
            ),
          ],
        ),
      ),
    );
  }
}
