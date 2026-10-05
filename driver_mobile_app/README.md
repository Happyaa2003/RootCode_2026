# WayPilot Driver — Flutter Mobile Application

A specialized, standalone Flutter mobile application designed for logistics delivery drivers operating in multi-depot Sri Lankan distribution networks (Peliyagoda Central, Colombo Metro, Kandy, Galle).

---

## 📱 Features & Highlights

1. **Turn-by-Turn GPS Navigation & ETA Tracking**:
   - Turn-by-turn routing banner with live distance remaining, simulated GPS speed (km/h), and dynamic ETA.
   - Dynamic SLA confidence badges (High Confidence 98%, Medium Risk, At Risk).

2. **Full Delivery Mission Details & Cargo Specs**:
   - Store name, address, access remarks (dock requirements, ramp restrictions).
   - Cargo spec pillboxes: Volume ($m^3$), units, weight ($kg$), chilled temperature target ($+3.2^\circ\text{C}$), and dock type.

3. **Digital Proof of Delivery (POD)**:
   - Live barcode / crate photo evidence capture.
   - Genuine touch/finger digital signature canvas with clear & save functionality.
   - High-precision GPS geo-stamping ($6.8722^\circ\text{N}, 79.8911^\circ\text{E}$).
   - Store receiving signee name and delivery remarks.

4. **Hill Country Degraded Offline Mode & Auto-Sync**:
   - Offline toggle simulating intermittent cellular/4G coverage in rural/hill country corridors.
   - Local queuing of all PODs, dock arrivals, order status transitions, and exception reports in persistent device storage.
   - Seamless 1-tap re-synchronization with Colombo FastAPI backend upon reconnection.

5. **Cold Chain & Vehicle Telematics**:
   - Real-time $+3.2^\circ\text{C}$ reefer cargo bay temperature monitor with high-temperature warnings.
   - Cargo door open/closed safety sensor.
   - Telematics grid: Diesel fuel quota ($118\text{ L}$), battery voltage ($24.2\text{ V}$), and tire pressure ($36\text{ PSI}$).

6. **Driver SOS & Traffic Incident Reporting**:
   - Instant dispatcher notification for traffic congestion, reefer faults, road flooding, or store closures.
   - Estimated delay slider with automatic route recalculation.

7. **Driver Shift Profile & Statistics**:
   - Assigned vehicle plate (`WP-CAD-4821`), license endorsements, and depot assignment.
   - Live shift performance metrics (deliveries completed, on-time SLA, fuel consumed).
   - 1-Click quick login switcher for evaluation personas (*Nimal Silva* / *Kamal Perera*).

---

## 🛠️ Project Structure

```text
driver_mobile_app/
├── lib/
│   ├── main.dart                          # Application entry point & MultiProvider setup
│   ├── core/
│   │   ├── constants/
│   │   │   ├── app_constants.dart         # Storage keys, app metadata, defaults
│   │   │   └── api_endpoints.dart         # FastAPI backend routes & host resolver
│   │   ├── theme/
│   │   │   ├── app_colors.dart            # Logistics dark mode palette (Vivid Blue, Slate, Emerald)
│   │   │   └── app_theme.dart             # Inter typography, custom button & input styles
│   │   └── utils/
│   │       └── formatters.dart            # Currency & timestamp formatters
│   ├── models/
│   │   ├── user.dart                      # Driver authentication profile
│   │   ├── driver.dart                    # Driver license & identity
│   │   ├── vehicle.dart                   # Vehicle plate, capacity, reefer specs
│   │   ├── outlet.dart                    # Retail outlet, dock type & GPS
│   │   ├── order.dart                     # Cargo orders, units, price & SLA probability
│   │   ├── route_model.dart               # Complete multi-stop route & financials
│   │   ├── route_stop.dart                # Individual sequence stop & ETA
│   │   ├── proof_of_delivery.dart         # Signature, photo & geo-stamp POD
│   │   ├── exception_report.dart          # Traffic delay & incident SOS
│   │   └── telemetry.dart                 # Temperature, speed & fuel sensors
│   ├── services/
│   │   ├── api_service.dart               # HTTP client connecting to FastAPI backend
│   │   ├── offline_storage_service.dart   # SharedPreferences offline action queue
│   │   └── telemetry_service.dart         # Real-time sensor simulation
│   ├── providers/
│   │   ├── auth_provider.dart             # Authentication & active user state
│   │   ├── route_provider.dart            # Route execution, stops & POD state
│   │   ├── offline_provider.dart          # Hill country offline mode & sync manager
│   │   └── telemetry_provider.dart        # Live sensor stream to UI
│   ├── widgets/
│   │   ├── offline_status_bar.dart        # Top animated connection & sync banner
│   │   ├── signature_pad.dart             # Custom digital finger signature canvas
│   │   ├── cargo_chip.dart                # Cargo & dock spec pills
│   │   ├── metric_card.dart               # Dashboard KPI & telematics card
│   │   └── sla_confidence_badge.dart      # Color-coded SLA confidence pill
│   └── screens/
│       ├── auth/login_screen.dart         # Login terminal & 1-tap demo credentials
│       ├── home/driver_shell_screen.dart  # 5-tab main driver shell
│       ├── navigation/active_delivery_screen.dart # Active stop & GPS navigation
│       ├── manifest/manifest_screen.dart  # Full 12-stop list & progress
│       ├── pod/proof_of_delivery_screen.dart      # Camera & digital signature POD
│       ├── telemetry/reefer_telemetry_screen.dart # Cold-chain temperature monitor
│       ├── exceptions/report_exception_screen.dart# Driver SOS delay reporting
│       └── profile/driver_profile_screen.dart     # Shift performance & account
```

---

## 🚀 How to Run the Flutter Driver App

### 1. Run in Chrome / Web
```powershell
cd E:\RootCode_2026\driver_mobile_app
flutter run -d chrome
```

### 2. Run as Windows Desktop Application
```powershell
cd E:\RootCode_2026\driver_mobile_app
flutter run -d windows
```

### 3. Run on Android Emulator or Physical Device
```powershell
cd E:\RootCode_2026\driver_mobile_app
flutter run
```

---

## 🔗 Backend API Connection

The app automatically communicates with the FastAPI backend at `http://localhost:8000/api/v1` (or `http://10.0.2.2:8000/api/v1` for Android emulators). You can also configure the backend URL directly inside the login screen by tapping **API Host**.
