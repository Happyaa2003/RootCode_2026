import 'package:flutter_test/flutter_test.dart';
import 'package:driver_mobile_app/main.dart';

void main() {
  testWidgets('WayPilot driver app smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const WayPilotDriverApp());
  });
}
