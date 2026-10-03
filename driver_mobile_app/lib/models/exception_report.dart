class ExceptionReport {
  final String id;
  final String orderId;
  final String type; // 'Traffic Congestion', 'Breakdown', 'Store Closed', 'Customer Rejected', 'Weather / Flooding'
  final String severity; // 'Low', 'Medium', 'High', 'Critical'
  final String description;
  final int estimatedDelayMinutes;
  final String timestamp;
  final bool isSynced;

  ExceptionReport({
    required this.id,
    required this.orderId,
    required this.type,
    required this.severity,
    required this.description,
    required this.estimatedDelayMinutes,
    required this.timestamp,
    this.isSynced = false,
  });

  factory ExceptionReport.fromJson(Map<String, dynamic> json) {
    return ExceptionReport(
      id: json['id'] as String? ?? '',
      orderId: json['orderId'] as String? ?? '',
      type: json['type'] as String? ?? 'Traffic Congestion',
      severity: json['severity'] as String? ?? 'Medium',
      description: json['description'] as String? ?? '',
      estimatedDelayMinutes: (json['estimatedDelayMinutes'] as num?)?.toInt() ?? 15,
      timestamp: json['timestamp'] as String? ?? DateTime.now().toIso8601String(),
      isSynced: json['isSynced'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'orderId': orderId,
    'type': type,
    'severity': severity,
    'description': description,
    'estimatedDelayMinutes': estimatedDelayMinutes,
    'timestamp': timestamp,
    'isSynced': isSynced,
  };
}
