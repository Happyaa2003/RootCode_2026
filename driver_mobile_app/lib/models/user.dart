class User {
  final String id;
  final String name;
  final String email;
  final String role;
  final String depot;
  final String initials;
  final String status;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    required this.depot,
    required this.initials,
    this.status = 'ACTIVE',
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? 'Driver',
      email: json['email'] as String? ?? '',
      role: json['role'] as String? ?? 'Driver',
      depot: json['depot'] as String? ?? 'Peliyagoda Central',
      initials: json['initials'] as String? ?? 'DR',
      status: json['status'] as String? ?? 'ACTIVE',
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'email': email,
    'role': role,
    'depot': depot,
    'initials': initials,
    'status': status,
  };
}
