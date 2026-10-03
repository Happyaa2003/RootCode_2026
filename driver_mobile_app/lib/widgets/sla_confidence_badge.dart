import 'package:flutter/material.dart';
import '../core/theme/app_colors.dart';

class SlaConfidenceBadge extends StatelessWidget {
  final double confidencePct;

  const SlaConfidenceBadge({super.key, required this.confidencePct});

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color fg;
    String label;

    if (confidencePct >= 95.0) {
      bg = const Color(0xFF064E3B);
      fg = AppColors.success;
      label = '${confidencePct.toInt()}% SLA High Confidence';
    } else if (confidencePct >= 80.0) {
      bg = const Color(0xFF78350F);
      fg = AppColors.warning;
      label = '${confidencePct.toInt()}% SLA Medium Risk';
    } else {
      bg = const Color(0xFF7F1D1D);
      fg = AppColors.error;
      label = '${confidencePct.toInt()}% SLA At Risk';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: fg.withValues(alpha: 0.4)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(
              color: fg,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 5),
          Text(
            label,
            style: TextStyle(
              fontSize: 10.5,
              fontWeight: FontWeight.w700,
              color: fg,
            ),
          ),
        ],
      ),
    );
  }
}
