import 'outlet.dart';

class TimeWindow {
  final String start;
  final String end;

  TimeWindow({required this.start, required this.end});

  factory TimeWindow.fromJson(Map<String, dynamic> json) {
    return TimeWindow(
      start: json['start'] as String? ?? '08:00',
      end: json['end'] as String? ?? '10:00',
    );
  }

  Map<String, dynamic> toJson() => {
    'start': start,
    'end': end,
  };
}

class Order {
  final String id;
  final Outlet outlet;
  final String brand; // 'Fresh', 'Style', 'Tech', 'Chilled'
  final TimeWindow window;
  final double volume; // m³
  final double weight; // kg
  final String temp; // 'Ambient', 'Chilled', 'Frozen'
  String status; // 'Unassigned', 'Planned', 'Loading', 'Ready', 'En Route', 'Arrived', 'Delivered', 'Failed', 'At Risk'
  final double? riskScore;
  final String district;
  final String? routeId;
  final int? stopSequence;
  final String? notes;
  final int units;
  final double itemPrice;
  final double deliveryCost;
  final String dockType;
  final String priority;
  final int delayMinutes;
  final String? estimatedArrivalETA;
  final double? onTimeProbability;

  Order({
    required this.id,
    required this.outlet,
    required this.brand,
    required this.window,
    required this.volume,
    required this.weight,
    required this.temp,
    required this.status,
    this.riskScore,
    required this.district,
    this.routeId,
    this.stopSequence,
    this.notes,
    this.units = 1,
    this.itemPrice = 0.0,
    this.deliveryCost = 0.0,
    this.dockType = 'street',
    this.priority = 'Medium',
    this.delayMinutes = 0,
    this.estimatedArrivalETA,
    this.onTimeProbability = 95.0,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'] as String? ?? '',
      outlet: json['outlet'] != null
          ? Outlet.fromJson(json['outlet'])
          : Outlet(
              id: 'OUT-UNKNOWN',
              name: 'Unknown Outlet',
              address: 'Sri Lanka',
              district: 'Colombo',
              location: Outlet.fromJson({}).location,
            ),
      brand: json['brand'] as String? ?? 'Fresh',
      window: json['window'] != null
          ? TimeWindow.fromJson(json['window'])
          : TimeWindow(start: '08:00', end: '10:00'),
      volume: (json['volume'] as num?)?.toDouble() ?? 1.5,
      weight: (json['weight'] as num?)?.toDouble() ?? 250.0,
      temp: json['temp'] as String? ?? 'Ambient',
      status: json['status'] as String? ?? 'Planned',
      riskScore: (json['riskScore'] as num?)?.toDouble(),
      district: json['district'] as String? ?? 'Colombo',
      routeId: json['routeId'] as String?,
      stopSequence: (json['stopSequence'] as num?)?.toInt(),
      notes: json['notes'] as String?,
      units: (json['units'] as num?)?.toInt() ?? 1,
      itemPrice: (json['itemPrice'] as num?)?.toDouble() ?? 0.0,
      deliveryCost: (json['deliveryCost'] as num?)?.toDouble() ?? 0.0,
      dockType: json['dockType'] as String? ?? 'street',
      priority: json['priority'] as String? ?? 'Medium',
      delayMinutes: (json['delayMinutes'] as num?)?.toInt() ?? 0,
      estimatedArrivalETA: json['estimatedArrivalETA'] as String?,
      onTimeProbability: (json['onTimeProbability'] as num?)?.toDouble() ?? 95.0,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'outlet': outlet.toJson(),
    'brand': brand,
    'window': window.toJson(),
    'volume': volume,
    'weight': weight,
    'temp': temp,
    'status': status,
    'riskScore': riskScore,
    'district': district,
    'routeId': routeId,
    'stopSequence': stopSequence,
    'notes': notes,
    'units': units,
    'itemPrice': itemPrice,
    'deliveryCost': deliveryCost,
    'dockType': dockType,
    'priority': priority,
    'delayMinutes': delayMinutes,
    'estimatedArrivalETA': estimatedArrivalETA,
    'onTimeProbability': onTimeProbability,
  };
}
