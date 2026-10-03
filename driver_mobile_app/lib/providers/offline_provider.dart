import 'package:flutter/foundation.dart';
import '../services/api_service.dart';
import '../services/offline_storage_service.dart';

class OfflineProvider extends ChangeNotifier {
  final ApiService _apiService;
  bool _isOffline = false;
  bool _isSyncing = false;
  int _queuedCount = 0;
  String? _lastSyncMessage;

  OfflineProvider(this._apiService) {
    _refreshQueueCount();
  }

  bool get isOffline => _isOffline;
  bool get isSyncing => _isSyncing;
  int get queuedCount => _queuedCount;
  String? get lastSyncMessage => _lastSyncMessage;

  void toggleOffline() {
    _isOffline = !_isOffline;
    if (!_isOffline) {
      syncNow();
    }
    notifyListeners();
  }

  void _refreshQueueCount() {
    _queuedCount = OfflineStorageService.getQueuedActions().length;
    notifyListeners();
  }

  Future<void> syncNow() async {
    if (_isSyncing) return;
    _isSyncing = true;
    notifyListeners();

    final synced = await _apiService.syncQueuedActions();
    _isSyncing = false;
    _refreshQueueCount();

    if (synced > 0) {
      _lastSyncMessage = 'Successfully synced $synced offline actions with Colombo HQ!';
    } else if (_queuedCount == 0) {
      _lastSyncMessage = 'All records are up to date.';
    }
    notifyListeners();
  }
}
