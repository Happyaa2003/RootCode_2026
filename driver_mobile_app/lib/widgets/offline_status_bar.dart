import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/offline_provider.dart';
import '../core/theme/app_colors.dart';

class OfflineStatusBar extends StatelessWidget {
  const OfflineStatusBar({super.key});

  @override
  Widget build(BuildContext context) {
    final offline = context.watch<OfflineProvider>();
    final isOffline = offline.isOffline;
    final isSyncing = offline.isSyncing;
    final queued = offline.queuedCount;

    return Material(
      color: isOffline ? AppColors.errorBg : const Color(0xFF064E3B),
      child: InkWell(
        onTap: () => offline.toggleOffline(),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
          decoration: BoxDecoration(
            border: Border(
              bottom: BorderSide(
                color: isOffline ? AppColors.error.withValues(alpha: 0.5) : AppColors.success.withValues(alpha: 0.4),
                width: 1,
              ),
            ),
          ),
          child: Row(
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isOffline ? AppColors.error : AppColors.success,
                  boxShadow: [
                    BoxShadow(
                      color: (isOffline ? AppColors.error : AppColors.success).withValues(alpha: 0.8),
                      blurRadius: 6,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  isOffline
                      ? 'OFFLINE DEGRADED MODE ${queued > 0 ? '($queued queued)' : ''}'
                      : '4G NETWORK ONLINE · CACHE SYNCED',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: isOffline ? Colors.white : const Color(0xFF6EE7B7),
                    letterSpacing: 0.3,
                  ),
                ),
              ),
              if (isSyncing)
                const SizedBox(
                  width: 14,
                  height: 14,
                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                )
              else
                Text(
                  isOffline ? 'Tap to Reconnect' : 'Tap to Simulate Offline',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    color: (isOffline ? Colors.white : Colors.white70).withValues(alpha: 0.8),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
