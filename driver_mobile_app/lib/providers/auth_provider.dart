import 'package:flutter/foundation.dart';
import '../models/user.dart';
import '../services/api_service.dart';
import '../services/offline_storage_service.dart';

class AuthProvider extends ChangeNotifier {
  final ApiService _apiService;
  User? _currentUser;
  bool _isLoading = false;
  String? _errorMessage;

  AuthProvider(this._apiService) {
    _loadInitialState();
  }

  User? get currentUser => _currentUser;
  bool get isAuthenticated => _currentUser != null;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  String get baseUrl => _apiService.baseUrl;

  void setBaseUrl(String url) {
    _apiService.setBaseUrl(url);
    notifyListeners();
  }

  void _loadInitialState() {
    final token = OfflineStorageService.getToken();
    if (token != null) {
      // Default to standard driver profile if token exists
      _currentUser = User(
        id: 'usr-driver-002',
        name: 'Nimal Silva',
        email: 'nimal.silva@waypointroot.com',
        role: 'Driver',
        depot: 'Peliyagoda Central Depot',
        initials: 'NS',
      );
    }
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final user = await _apiService.login(email, password);
      _currentUser = user;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> quickLoginAsDemoDriver() async {
    await login('nimal.silva@waypointroot.com', 'password123');
  }

  Future<void> logout() async {
    await OfflineStorageService.clearAuth();
    _currentUser = null;
    notifyListeners();
  }
}
