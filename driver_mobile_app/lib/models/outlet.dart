import 'coordinates.dart';

class Outlet {
  final String id;
  final String name;
  final String address;
  final String district;
  final Coordinates location;
  final String? accessNotes;
  final String dockType; // 'street', 'rear_dock', 'mall_bay'
  final String parkingConstraint; // 'normal', 'van_only', 'mall_dock'
  final String? mallWindow;
  final String windowOpenTime;
  final String windowCloseTime;

  Outlet({
    required this.id,
    required this.name,
    required this.address,
    required this.district,
    required this.location,
    this.accessNotes,
    this.dockType = 'street',
    this.parkingConstraint = 'normal',
    this.mallWindow,
    this.windowOpenTime = '08:00',
    this.windowCloseTime = '18:00',
  });

  factory Outlet.fromJson(Map<String, dynamic> json) {
    return Outlet(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      address: json['address'] as String? ?? '',
      district: json['district'] as String? ?? 'Colombo',
      location: json['location'] != null
          ? Coordinates.fromJson(json['location'])
          : Coordinates(lat: 6.9271, lng: 79.8612),
      accessNotes: json['accessNotes'] as String?,
      dockType: json['dockType'] as String? ?? 'street',
      parkingConstraint: json['parkingConstraint'] as String? ?? 'normal',
      mallWindow: json['mallWindow'] as String?,
      windowOpenTime: json['windowOpenTime'] as String? ?? '08:00',
      windowCloseTime: json['windowCloseTime'] as String? ?? '18:00',
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'address': address,
    'district': district,
    'location': location.toJson(),
    'accessNotes': accessNotes,
    'dockType': dockType,
    'parkingConstraint': parkingConstraint,
    'mallWindow': mallWindow,
    'windowOpenTime': windowOpenTime,
    'windowCloseTime': windowCloseTime,
  };
}
