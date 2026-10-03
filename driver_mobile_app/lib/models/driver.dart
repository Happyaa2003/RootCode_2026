class Driver {
  final String id;
  final String name;
  final String initials;
  final String phone;
  final String licenseClass;

  Driver({
    required this.id,
    required this.name,
    required this.initials,
    required this.phone,
    required this.licenseClass,
  });

  factory Driver.fromJson(Map<String, dynamic> json) {
    return Driver(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? 'Driver',
      initials: json['initials'] as String? ?? 'DR',
      phone: json['phone'] as String? ?? '',
      licenseClass: json['licenseClass'] as String? ?? 'Commercial',
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'initials': initials,
    'phone': phone,
    'licenseClass': licenseClass,
  };
}
