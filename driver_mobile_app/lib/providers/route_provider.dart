import 'package:flutter/foundation.dart';
import '../models/route_model.dart';
import '../models/route_stop.dart';
import '../models/proof_of_delivery.dart';
import '../models/exception_report.dart';
import '../services/api_service.dart';
import '../services/offline_storage_service.dart';

class RouteProvider extends ChangeNotifier {
  final ApiService _apiService;
  List<RouteModel> _routes = [];
  RouteModel? _currentRoute;
  int _currentStopIndex = 0;
  bool _isLoading = false;
  String? _toastMessage;

  final List<ProofOfDelivery> _completedPods = [];
  final List<ExceptionReport> _exceptionReports = [];

  RouteProvider(this._apiService) {
    loadRoutes();
  }

  List<RouteModel> get routes => _routes;
  RouteModel? get currentRoute => _currentRoute;
  int get currentStopIndex => _currentStopIndex;
  bool get isLoading => _isLoading;
  String? get toastMessage => _toastMessage;
  List<ProofOfDelivery> get completedPods => _completedPods;
  List<ExceptionReport> get exceptionReports => _exceptionReports;

  RouteStop? get currentStop {
    if (_currentRoute == null || _currentRoute!.stops.isEmpty) return null;
    if (_currentStopIndex >= 0 && _currentStopIndex < _currentRoute!.stops.length) {
      return _currentRoute!.stops[_currentStopIndex];
    }
    return null;
  }

  int get totalStopsCount => _currentRoute?.stops.length ?? 0;
  int get completedStopsCount =>
      _currentRoute?.stops.where((s) => s.status == 'Delivered').length ?? 0;

  double get progressPercentage {
    if (totalStopsCount == 0) return 0.0;
    return completedStopsCount / totalStopsCount;
  }

  void showToast(String msg) {
    _toastMessage = msg;
    notifyListeners();
  }

  void clearToast() {
    _toastMessage = null;
    notifyListeners();
  }

  Future<void> loadRoutes({bool isOffline = false}) async {
    _isLoading = true;
    notifyListeners();

    try {
      final routes = await _apiService.getRoutes();
      _routes = routes;
      if (_routes.isNotEmpty) {
        _currentRoute = _routes.first;
        // Find first non-delivered stop
        final firstActive = _currentRoute!.stops.indexWhere((s) => s.status != 'Delivered');
        _currentStopIndex = firstActive >= 0 ? firstActive : 0;
      }
    } catch (_) {
      // Handled in ApiService fallback
    }

    _isLoading = false;
    notifyListeners();
  }

  void setCurrentStopIndex(int index) {
    if (_currentRoute != null && index >= 0 && index < _currentRoute!.stops.length) {
      _currentStopIndex = index;
      notifyListeners();
    }
  }

  Future<void> markArrivedAtDock({bool isOffline = false}) async {
    final stop = currentStop;
    if (stop == null) return;

    stop.status = 'Arrived';
    stop.actualArrival = DateTime.now().toIso8601String();
    stop.order.status = 'Arrived';

    await _apiService.updateOrderStatus(stop.order.id, 'Arrived', isOffline: isOffline);
    showToast('Arrival logged for ${stop.order.outlet.name} at dock.');
    notifyListeners();
  }

  Future<void> submitProofOfDelivery({
    required String signeeName,
    String? signatureBase64,
    String? photoBase64,
    String? notes,
    bool isOffline = false,
  }) async {
    final stop = currentStop;
    if (stop == null) return;

    stop.status = 'Delivered';
    stop.order.status = 'Delivered';

    final pod = ProofOfDelivery(
      orderId: stop.order.id,
      outletName: stop.order.outlet.name,
      signeeName: signeeName,
      signatureBase64: signatureBase64,
      photoBase64: photoBase64,
      latitude: stop.order.outlet.location.lat,
      longitude: stop.order.outlet.location.lng,
      timestamp: DateTime.now().toIso8601String(),
      notes: notes,
      isSynced: !isOffline,
    );

    _completedPods.add(pod);

    if (isOffline) {
      await OfflineStorageService.queueAction('POD_SUBMISSION', pod.toJson());
      await _apiService.updateOrderStatus(stop.order.id, 'Delivered', isOffline: true);
      showToast('POD saved offline! Route advancing to next outlet.');
    } else {
      await _apiService.updateOrderStatus(stop.order.id, 'Delivered', isOffline: false);
      showToast('POD photo & signature synced with Colombo dispatch!');
    }

    // Advance to next stop
    if (_currentStopIndex + 1 < (_currentRoute?.stops.length ?? 0)) {
      _currentStopIndex++;
      _currentRoute!.stops[_currentStopIndex].status = 'En Route';
      _currentRoute!.stops[_currentStopIndex].order.status = 'En Route';
    }

    notifyListeners();
  }

  Future<void> submitExceptionReport({
    required String type,
    required String severity,
    required String description,
    required int estimatedDelayMinutes,
    bool isOffline = false,
  }) async {
    final stop = currentStop;
    if (stop == null) return;

    final report = ExceptionReport(
      id: 'EXC-${DateTime.now().millisecondsSinceEpoch}',
      orderId: stop.order.id,
      type: type,
      severity: severity,
      description: description,
      estimatedDelayMinutes: estimatedDelayMinutes,
      timestamp: DateTime.now().toIso8601String(),
      isSynced: !isOffline,
    );

    _exceptionReports.add(report);

    if (isOffline) {
      await OfflineStorageService.queueAction('EXCEPTION_REPORT', report.toJson());
      showToast('Exception queued offline — Colombo Dispatch will be alerted upon reconnection.');
    } else {
      showToast('Exception broadcasted to Colombo Dispatch Command HQ!');
    }

    notifyListeners();
  }
}
