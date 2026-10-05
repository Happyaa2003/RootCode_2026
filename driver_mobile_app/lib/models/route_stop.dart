import 'order.dart';

class RouteStop {
  final Order order;
  int sequence;
  String eta;
  String? etd;
  String status; // 'Planned', 'Loading', 'Ready', 'En Route', 'Arrived', 'Delivered', 'Failed'
  String? actualArrival;

  RouteStop({
    required this.order,
    required this.sequence,
    required this.eta,
    this.etd,
    required this.status,
    this.actualArrival,
  });

  factory RouteStop.fromJson(Map<String, dynamic> json) {
    return RouteStop(
      order: Order.fromJson(json['order'] as Map<String, dynamic>),
      sequence: (json['sequence'] as num?)?.toInt() ?? 1,
      eta: json['eta'] as String? ?? '08:30',
      etd: json['etd'] as String?,
      status: json['status'] as String? ?? 'Planned',
      actualArrival: json['actualArrival'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    'order': order.toJson(),
    'sequence': sequence,
    'eta': eta,
    'etd': etd,
    'status': status,
    'actualArrival': actualArrival,
  };
}
