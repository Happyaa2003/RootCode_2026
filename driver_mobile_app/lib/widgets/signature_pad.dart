import 'package:flutter/material.dart';
import '../core/theme/app_colors.dart';

class SignaturePad extends StatefulWidget {
  final ValueChanged<List<Offset?>>? onSigned;
  final VoidCallback? onClear;

  const SignaturePad({super.key, this.onSigned, this.onClear});

  @override
  State<SignaturePad> createState() => SignaturePadState();
}

class SignaturePadState extends State<SignaturePad> {
  final List<Offset?> _points = [];

  bool get hasSignature => _points.where((p) => p != null).isNotEmpty;

  void clear() {
    setState(() {
      _points.clear();
    });
    widget.onClear?.call();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 140,
      width: double.infinity,
      decoration: BoxDecoration(
        color: AppColors.surfaceSubtle,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: Stack(
        children: [
          GestureDetector(
            onPanUpdate: (details) {
              final RenderBox renderBox = context.findRenderObject() as RenderBox;
              final localPos = renderBox.globalToLocal(details.globalPosition);
              setState(() {
                _points.add(localPos);
              });
              widget.onSigned?.call(_points);
            },
            onPanEnd: (_) {
              setState(() {
                _points.add(null);
              });
              widget.onSigned?.call(_points);
            },
            child: CustomPaint(
              painter: _SignaturePainter(_points),
              size: Size.infinite,
            ),
          ),
          if (!hasSignature)
            const Center(
              child: Text(
                'Draw Customer / Store Signee Signature Here',
                style: TextStyle(
                  color: AppColors.textMuted,
                  fontSize: 12,
                  fontStyle: FontStyle.italic,
                ),
              ),
            ),
          Positioned(
            right: 8,
            top: 8,
            child: IconButton(
              icon: const Icon(Icons.refresh, size: 18, color: AppColors.textSecondary),
              tooltip: 'Clear Signature',
              onPressed: clear,
            ),
          ),
        ],
      ),
    );
  }
}

class _SignaturePainter extends CustomPainter {
  final List<Offset?> points;

  _SignaturePainter(this.points);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppColors.primaryLight
      ..strokeCap = StrokeCap.round
      ..strokeWidth = 2.5;

    for (int i = 0; i < points.length - 1; i++) {
      if (points[i] != null && points[i + 1] != null) {
        canvas.drawLine(points[i]!, points[i + 1]!, paint);
      }
    }
  }

  @override
  bool shouldRepaint(_SignaturePainter oldDelegate) => true;
}
