import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/route_provider.dart';
import '../../providers/offline_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../widgets/signature_pad.dart';
import '../../models/order.dart';

class ProofOfDeliveryScreen extends StatefulWidget {
  final Order order;

  const ProofOfDeliveryScreen({super.key, required this.order});

  @override
  State<ProofOfDeliveryScreen> createState() => _ProofOfDeliveryScreenState();
}

class _ProofOfDeliveryScreenState extends State<ProofOfDeliveryScreen> {
  final _signeeController = TextEditingController(text: 'M. Fernando (Store Lead)');
  final _notesController = TextEditingController();
  final GlobalKey<SignaturePadState> _sigPadKey = GlobalKey<SignaturePadState>();
  bool _photoTaken = false;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _signeeController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  void _handleSubmit() async {
    if (_signeeController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter the store signee name')),
      );
      return;
    }

    setState(() => _isSubmitting = true);
    final route = context.read<RouteProvider>();
    final offline = context.read<OfflineProvider>();

    await route.submitProofOfDelivery(
      signeeName: _signeeController.text.trim(),
      signatureBase64: 'base64_captured_signature_vector',
      photoBase64: _photoTaken ? 'base64_delivery_crate_photo' : null,
      notes: _notesController.text.trim().isNotEmpty ? _notesController.text.trim() : null,
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
        title: const Text('Proof of Delivery (POD)'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Target Outlet Details Card
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border),
              ),
              child: Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.storefront_outlined, color: AppColors.primaryLight),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.order.outlet.name,
                          style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '${widget.order.id} · ${widget.order.brand} Chilled · ${widget.order.volume} m³',
                          style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Camera Viewfinder & Crate Barcode Scanner Simulation
            const Text(
              '1. BARCODE SCAN & PHOTO EVIDENCE',
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.textMuted, letterSpacing: 0.5),
            ),
            const SizedBox(height: 8),

            GestureDetector(
              onTap: () {
                setState(() => _photoTaken = !_photoTaken);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(_photoTaken ? 'Photo & Crate Barcode Captured!' : 'Photo cleared'),
                    duration: const Duration(seconds: 2),
                  ),
                );
              },
              child: Container(
                height: 160,
                decoration: BoxDecoration(
                  color: AppColors.surfaceSubtle,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: _photoTaken ? AppColors.success : AppColors.border,
                    width: _photoTaken ? 2 : 1,
                  ),
                ),
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    if (_photoTaken)
                      Container(
                        decoration: BoxDecoration(
                          color: const Color(0xFF0F172A),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Container(
                                padding: const EdgeInsets.all(10),
                                decoration: const BoxDecoration(
                                  color: AppColors.successBg,
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(Icons.check_circle, color: AppColors.success, size: 28),
                              ),
                              const SizedBox(height: 8),
                              const Text(
                                'Crate Photo & Barcode Verified (100% Match)',
                                style: TextStyle(color: AppColors.success, fontWeight: FontWeight.w700, fontSize: 12),
                              ),
                              const SizedBox(height: 4),
                              const Text('Tap to retake photo', style: TextStyle(color: AppColors.textMuted, fontSize: 10)),
                            ],
                          ),
                        ),
                      )
                    else
                      Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: AppColors.surfaceElevated,
                              shape: BoxShape.circle,
                              border: Border.all(color: AppColors.border),
                            ),
                            child: const Icon(Icons.camera_alt_outlined, size: 28, color: AppColors.primaryLight),
                          ),
                          const SizedBox(height: 10),
                          const Text(
                            'Tap to Frame Crate Barcode & Unloading Area',
                            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            'Geo-stamped with high precision GPS',
                            style: TextStyle(fontSize: 10, color: AppColors.textMuted),
                          ),
                        ],
                      ),
                    Positioned(
                      bottom: 8,
                      left: 12,
                      child: Text(
                        'GPS: ${widget.order.outlet.location.lat.toStringAsFixed(4)}°N, ${widget.order.outlet.location.lng.toStringAsFixed(4)}°E',
                        style: const TextStyle(
                          fontSize: 9.5,
                          fontFamily: 'monospace',
                          color: AppColors.success,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 18),

            // Store Receiver Signee Name
            const Text(
              '2. STORE SIGNEE & RECEIVER NAME',
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.textMuted, letterSpacing: 0.5),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _signeeController,
              decoration: const InputDecoration(
                hintText: 'e.g. Kamal Jayawardena (Shift Lead)',
                prefixIcon: Icon(Icons.person_outline, size: 18),
              ),
            ),

            const SizedBox(height: 18),

            // Digital Signature Pad
            const Text(
              '3. DIGITAL TOUCH SIGNATURE',
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.textMuted, letterSpacing: 0.5),
            ),
            const SizedBox(height: 8),
            SignaturePad(key: _sigPadKey),

            const SizedBox(height: 18),

            // Unloading Notes / Crate Count
            const Text(
              '4. UNLOADING REMARKS (OPTIONAL)',
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.textMuted, letterSpacing: 0.5),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _notesController,
              maxLines: 2,
              decoration: const InputDecoration(
                hintText: 'e.g. All 40 chilled units received in perfect condition at +3.2°C.',
              ),
            ),

            const SizedBox(height: 24),

            // Submit Button
            ElevatedButton.icon(
              onPressed: _isSubmitting ? null : _handleSubmit,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.success,
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              icon: const Icon(Icons.check_circle_outline, color: Colors.white),
              label: _isSubmitting
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : const Text(
                      'Confirm & Complete Proof of Delivery',
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
