class ProofOfDelivery {
  final String orderId;
  final String outletName;
  final String signeeName;
  final String? signatureBase64;
  final String? photoBase64;
  final double latitude;
  final double longitude;
  final String timestamp;
  final String? notes;
  final bool isSynced;

  ProofOfDelivery({
    required this.orderId,
    required this.outletName,
    required this.signeeName,
    this.signatureBase64,
    this.photoBase64,
    required this.latitude,
    required this.longitude,
    required this.timestamp,
    this.notes,
    this.isSynced = false,
  });

  factory ProofOfDelivery.fromJson(Map<String, dynamic> json) {
    return ProofOfDelivery(
      orderId: json['orderId'] as String? ?? '',
      outletName: json['outletName'] as String? ?? '',
      signeeName: json['signeeName'] as String? ?? '',
      signatureBase64: json['signatureBase64'] as String?,
      photoBase64: json['photoBase64'] as String?,
      latitude: (json['latitude'] as num?)?.toDouble() ?? 6.9271,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 79.8612,
      timestamp: json['timestamp'] as String? ?? DateTime.now().toIso8601String(),
      notes: json['notes'] as String?,
      isSynced: json['isSynced'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
    'orderId': orderId,
    'outletName': outletName,
    'signeeName': signeeName,
    'signatureBase64': signatureBase64,
    'photoBase64': photoBase64,
    'latitude': latitude,
    'longitude': longitude,
    'timestamp': timestamp,
    'notes': notes,
    'isSynced': isSynced,
  };
}
