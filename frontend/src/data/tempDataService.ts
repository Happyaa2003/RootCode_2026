import parsedData from './tempDataParsed.json';
import type {
  Order, Route, Vehicle, Driver, Outlet, Depot, Brand,
  DistrictTravelInfo, Task2aForecastItem, PeakDayScenario, PeakFleetStatus, KpiSummary
} from '../types';

// ─── Depots ───────────────────────────────────────────────────────────────────
export const peliyagodaDepots: Depot[] = [
  { id: 'DEP-PEL', name: 'Peliyagoda Central Depot', location: { lat: 6.9535, lng: 79.8912 }, address: 'Kandy Road, Peliyagoda, Western Province' },
  { id: 'DEP-KDY', name: 'Kandy Hill Depot', location: { lat: 7.2906, lng: 80.6337 }, address: 'William Gopallawa Mawatha, Kandy' },
];

export const bostonDepots: Depot[] = [
  { id: 'DEP-BOS', name: 'Boston Metro Hub', location: { lat: 42.3785, lng: -71.0720 }, address: 'Charlestown / Inner Belt, Boston, MA' },
  { id: 'DEP-CAM', name: 'Cambridge West Hub', location: { lat: 42.3910, lng: -71.1350 }, address: 'Alewife Brook Pkwy, Cambridge, MA' },
];


// Helper to determine service allowance minutes from service_allowance.csv
export const getServiceAllowance = (brand: string, dockType: string): number => {
  if (brand === 'Fresh') {
    if (dockType === 'rear_dock') return 15;
    if (dockType === 'street') return 16;
    return 18; // mall_bay
  }
  if (brand === 'Style') {
    if (dockType === 'rear_dock') return 38;
    if (dockType === 'street') return 46;
    return 59; // mall_bay
  }
  // Tech
  if (dockType === 'rear_dock') return 43;
  if (dockType === 'street') return 55;
  return 55; // mall_bay
};

// ─── District Center Coordinates for all 120 Outlets ─────────────────────────
const districtCenters: Record<string, [number, number]> = {
  Colombo: [6.9271, 79.8780],
  Gampaha: [7.0840, 79.9939],
  Kalutara: [6.5854, 79.9607],
  Galle: [6.0535, 80.2210],
  Matara: [5.9549, 80.5550],
  Kurunegala: [7.4818, 80.3609],
  Puttalam: [8.0408, 79.8394],
  Kandy: [7.2906, 80.6337],
  Matale: [7.4675, 80.6234],
  'Nuwara Eliya': [6.9497, 80.7891],
  Badulla: [6.9934, 81.0550],
  Kegalle: [7.2513, 80.3464],
};

// ─── ALL 120 Retail Outlets from outlets.csv ──────────────────────────────────
export const all120PeliyagodaOutlets: Outlet[] = (parsedData.outlets || []).map((o: any, idx: number) => {
  const center = districtCenters[o.district] || [6.9271, 79.8780];
  const latOffset = (((idx * 13) % 21 - 10) * 0.004);
  const lngOffset = Math.max(0.002, (((idx * 19) % 21) * 0.005));
  const lat = Math.round((center[0] + latOffset) * 10000) / 10000;
  const lng = Math.round((Math.max(79.8560, center[1] + lngOffset)) * 10000) / 10000;
  return {
    id: o.outlet_id,
    name: `${o.outlet_id} · ${o.brand} ${o.dock_type.replace('_', ' ').toUpperCase()}`,
    address: `${o.district} Metro Distribution, Sector ${idx + 1}`,
    district: o.district,
    location: { lat, lng },
    dockType: o.dock_type as 'street' | 'rear_dock' | 'mall_bay',
    parkingConstraint: o.parking_constraint as 'normal' | 'van_only' | 'mall_dock',
    mallWindow: o.mall_window || undefined,
    windowOpenTime: o.window_open_time,
    windowCloseTime: o.window_close_time,
  };
});

// 24 Authentic Sri Lankan Outlets along arterial logistics corridors (100% on land)
export const peliyagodaOutlets: Outlet[] = [
  // Sector 1: Northern Corridor (Wattala / Hendala / Kandana)
  { id: 'OUT-P01', name: 'Kelaniya Commercial Hub', address: 'Biyagama Rd, Kelaniya', district: 'Gampaha', location: { lat: 6.9620, lng: 79.9150 }, dockType: 'rear_dock', parkingConstraint: 'normal', windowOpenTime: '05:30', windowCloseTime: '08:00' },
  { id: 'OUT-P02', name: 'Wattala Negombo Rd Supercenter', address: 'Negombo Rd, Wattala', district: 'Gampaha', location: { lat: 6.9880, lng: 79.8920 }, dockType: 'street', parkingConstraint: 'van_only', windowOpenTime: '06:00', windowCloseTime: '08:30' },
  { id: 'OUT-P03', name: 'Hendala Trade Distribution', address: 'Hendala Junction, Wattala', district: 'Gampaha', location: { lat: 6.9950, lng: 79.8850 }, dockType: 'rear_dock', parkingConstraint: 'normal', windowOpenTime: '06:30', windowCloseTime: '09:00' },
  { id: 'OUT-P04', name: 'Kandana Main Road Depot', address: 'Kandana Town, Gampaha', district: 'Gampaha', location: { lat: 7.0250, lng: 79.8980 }, dockType: 'street', parkingConstraint: 'normal', windowOpenTime: '07:00', windowCloseTime: '09:30' },

  // Sector 2: Central Core (Fort / Pettah / Maradana)
  { id: 'OUT-P05', name: 'Pettah Wholesale Market', address: 'Main St, Pettah, Colombo 11', district: 'Colombo', location: { lat: 6.9380, lng: 79.8620 }, dockType: 'rear_dock', parkingConstraint: 'van_only', windowOpenTime: '05:30', windowCloseTime: '08:00' },
  { id: 'OUT-P06', name: 'Colombo Fort Commercial Bay', address: 'York St, Fort, Colombo 01', district: 'Colombo', location: { lat: 6.9320, lng: 79.8590 }, dockType: 'street', parkingConstraint: 'normal', windowOpenTime: '06:00', windowCloseTime: '08:30' },
  { id: 'OUT-P07', name: 'Panchikawatte Industrial Stores', address: 'Panchikawatte Rd, Colombo 10', district: 'Colombo', location: { lat: 6.9340, lng: 79.8680 }, dockType: 'street', parkingConstraint: 'normal', windowOpenTime: '06:30', windowCloseTime: '09:00' },
  { id: 'OUT-P08', name: 'Maradana Central Supercenter', address: 'Maradana Rd, Colombo 10', district: 'Colombo', location: { lat: 6.9270, lng: 79.8730 }, dockType: 'rear_dock', parkingConstraint: 'normal', windowOpenTime: '07:00', windowCloseTime: '09:30' },

  // Sector 3: Coastal Commercial (Kollupitiya / Bambalapitiya / Havelock)
  { id: 'OUT-P09', name: 'Kollupitiya Coastal Retail', address: 'Galle Rd, Colombo 03', district: 'Colombo', location: { lat: 6.9060, lng: 79.8610 }, dockType: 'street', parkingConstraint: 'van_only', windowOpenTime: '06:00', windowCloseTime: '08:30' },
  { id: 'OUT-P10', name: 'Bambalapitiya Galle Rd Plaza', address: 'Galle Rd, Colombo 04', district: 'Colombo', location: { lat: 6.8920, lng: 79.8630 }, dockType: 'mall_bay', parkingConstraint: 'mall_dock', windowOpenTime: '06:30', windowCloseTime: '09:00' },
  { id: 'OUT-P11', name: 'Havelock Town Distribution Hub', address: 'Havelock Rd, Colombo 05', district: 'Colombo', location: { lat: 6.8820, lng: 79.8710 }, dockType: 'rear_dock', parkingConstraint: 'normal', windowOpenTime: '07:00', windowCloseTime: '09:30' },
  { id: 'OUT-P12', name: 'Wellawatte Commercial Bay', address: 'Galle Rd, Colombo 06', district: 'Colombo', location: { lat: 6.8740, lng: 79.8660 }, dockType: 'street', parkingConstraint: 'normal', windowOpenTime: '07:30', windowCloseTime: '10:00' },

  // Sector 4: East / Administrative (Borella / Rajagiriya / Battaramulla)
  { id: 'OUT-P13', name: 'Borella Junction Mart', address: 'Ward Place, Colombo 07', district: 'Colombo', location: { lat: 6.9140, lng: 79.8790 }, dockType: 'street', parkingConstraint: 'normal', windowOpenTime: '06:15', windowCloseTime: '08:45' },
  { id: 'OUT-P14', name: 'Rajagiriya Gateway Stores', address: 'Kotte Rd, Rajagiriya', district: 'Colombo', location: { lat: 6.9080, lng: 79.8980 }, dockType: 'rear_dock', parkingConstraint: 'normal', windowOpenTime: '06:45', windowCloseTime: '09:15' },
  { id: 'OUT-P15', name: 'Battaramulla Capital Hub', address: 'Pannipitiya Rd, Battaramulla', district: 'Colombo', location: { lat: 6.8960, lng: 79.9210 }, dockType: 'street', parkingConstraint: 'normal', windowOpenTime: '07:15', windowCloseTime: '09:45' },
  { id: 'OUT-P16', name: 'Malabe IT Corridor Depot', address: 'Kaduwela Rd, Malabe', district: 'Colombo', location: { lat: 6.9050, lng: 79.9540 }, dockType: 'rear_dock', parkingConstraint: 'normal', windowOpenTime: '07:45', windowCloseTime: '10:15' },

  // Sector 5: South-East (Kirulapone / Nugegoda / Maharagama)
  { id: 'OUT-P17', name: 'Kirulapone High Level Hub', address: 'High Level Rd, Colombo 06', district: 'Colombo', location: { lat: 6.8780, lng: 79.8820 }, dockType: 'street', parkingConstraint: 'normal', windowOpenTime: '06:30', windowCloseTime: '09:00' },
  { id: 'OUT-P18', name: 'Nugegoda Super Centre', address: 'Stanley Thilakarathne Mawatha, Nugegoda', district: 'Colombo', location: { lat: 6.8680, lng: 79.8990 }, dockType: 'rear_dock', parkingConstraint: 'normal', windowOpenTime: '07:00', windowCloseTime: '09:30' },
  { id: 'OUT-P19', name: 'Delkanda Retail Bay', address: 'High Level Rd, Delkanda', district: 'Colombo', location: { lat: 6.8580, lng: 79.9120 }, dockType: 'street', parkingConstraint: 'normal', windowOpenTime: '07:30', windowCloseTime: '10:00' },
  { id: 'OUT-P20', name: 'Maharagama Town Distribution', address: 'Railway Ave, Maharagama', district: 'Colombo', location: { lat: 6.8480, lng: 79.9280 }, dockType: 'rear_dock', parkingConstraint: 'normal', windowOpenTime: '08:00', windowCloseTime: '10:30' },

  // Sector 6: Southern Corridor (Dehiwala / Mount Lavinia / Moratuwa)
  { id: 'OUT-P21', name: 'Dehiwala Hill Street Hub', address: 'Hill St, Dehiwala', district: 'Colombo', location: { lat: 6.8460, lng: 79.8750 }, dockType: 'street', parkingConstraint: 'van_only', windowOpenTime: '06:45', windowCloseTime: '09:15' },
  { id: 'OUT-P22', name: 'Mount Lavinia Super Outlet', address: 'Hotel Rd, Mount Lavinia', district: 'Colombo', location: { lat: 6.8340, lng: 79.8730 }, dockType: 'mall_bay', parkingConstraint: 'mall_dock', windowOpenTime: '07:15', windowCloseTime: '09:45' },
  { id: 'OUT-P23', name: 'Ratmalana Airport Road Depot', address: 'Airport Rd, Ratmalana', district: 'Colombo', location: { lat: 6.8210, lng: 79.8810 }, dockType: 'rear_dock', parkingConstraint: 'normal', windowOpenTime: '07:45', windowCloseTime: '10:15' },
  { id: 'OUT-P24', name: 'Moratuwa Commercial Center', address: 'Galle Rd, Moratuwa', district: 'Colombo', location: { lat: 6.7850, lng: 79.8850 }, dockType: 'street', parkingConstraint: 'normal', windowOpenTime: '08:15', windowCloseTime: '10:45' },
];

export const bostonOutlets: Outlet[] = [
  { id: 'OUT-001', name: 'Information Resource Center', address: 'Somerville Ave, Somerville', district: 'Somerville', location: { lat: 42.3812, lng: -71.1070 }, dockType: 'street', parkingConstraint: 'normal', windowOpenTime: '08:00', windowCloseTime: '10:00' },
  { id: 'OUT-002', name: 'Cambridge Brewing Company', address: '1 Kendall Sq, Cambridge', district: 'Cambridge', location: { lat: 42.3665, lng: -71.0910 }, dockType: 'rear_dock', parkingConstraint: 'normal', windowOpenTime: '08:30', windowCloseTime: '10:30' },
  { id: 'OUT-003', name: 'Craigie on Main', address: '853 Main St, Cambridge', district: 'Cambridge', location: { lat: 42.3645, lng: -71.1018 }, dockType: 'rear_dock', parkingConstraint: 'van_only', windowOpenTime: '08:30', windowCloseTime: '11:00' },
  { id: 'OUT-004', name: 'City Girl Cafe', address: '204 Hampshire St, Cambridge', district: 'Cambridge', location: { lat: 42.3712, lng: -71.0945 }, dockType: 'street', parkingConstraint: 'normal', windowOpenTime: '09:00', windowCloseTime: '11:30' },
  { id: 'OUT-005', name: 'S&S Restaurant', address: '1334 Cambridge St, Cambridge', district: 'Cambridge', location: { lat: 42.3738, lng: -71.0995 }, dockType: 'rear_dock', parkingConstraint: 'normal', windowOpenTime: '09:00', windowCloseTime: '11:30' },
  { id: 'OUT-006', name: 'Highland Fried', address: '1271 Cambridge St, Cambridge', district: 'Cambridge', location: { lat: 42.3745, lng: -71.0980 }, dockType: 'street', parkingConstraint: 'normal', windowOpenTime: '09:00', windowCloseTime: '12:00' },
  { id: 'OUT-007', name: 'All-Star Sandwich Bar', address: '1245 Cambridge St, Cambridge', district: 'Cambridge', location: { lat: 42.3740, lng: -71.0970 }, dockType: 'street', parkingConstraint: 'normal', windowOpenTime: '09:15', windowCloseTime: '12:00' },
  { id: 'OUT-008', name: 'Somerville Fire Department', address: '266 Broadway, Somerville', district: 'Somerville', location: { lat: 42.3876, lng: -71.0995 }, dockType: 'rear_dock', parkingConstraint: 'normal', windowOpenTime: '09:30', windowCloseTime: '12:30' },
  { id: 'OUT-009', name: 'Northeastern Junior High School', address: 'Marshall St, Somerville', district: 'Somerville', location: { lat: 42.3920, lng: -71.0950 }, dockType: 'street', parkingConstraint: 'normal', windowOpenTime: '10:00', windowCloseTime: '13:00' },
  { id: 'OUT-010', name: 'Ball Square Cafe', address: '708 Broadway, Somerville', district: 'Somerville', location: { lat: 42.3995, lng: -71.1120 }, dockType: 'street', parkingConstraint: 'normal', windowOpenTime: '10:15', windowCloseTime: '13:00' },
  { id: 'OUT-011', name: 'CVS Pharmacy', address: 'Beacon St, Somerville', district: 'Somerville', location: { lat: 42.3820, lng: -71.1150 }, dockType: 'rear_dock', parkingConstraint: 'normal', windowOpenTime: '10:30', windowCloseTime: '13:30' },
  { id: 'OUT-012', name: 'Harvard Kennedy School', address: '79 JFK St, Cambridge', district: 'Cambridge', location: { lat: 42.3715, lng: -71.1215 }, dockType: 'mall_bay', parkingConstraint: 'mall_dock', windowOpenTime: '10:30', windowCloseTime: '13:30' },
  { id: 'OUT-013', name: 'Allston Courier Center', address: 'Brighton Ave, Allston', district: 'Allston', location: { lat: 42.3530, lng: -71.1330 }, dockType: 'street', parkingConstraint: 'normal', windowOpenTime: '09:30', windowCloseTime: '12:30' },
  { id: 'OUT-014', name: 'Boston University Central', address: 'Commonwealth Ave, Boston', district: 'Boston', location: { lat: 42.3505, lng: -71.1054 }, dockType: 'mall_bay', parkingConstraint: 'mall_dock', windowOpenTime: '10:00', windowCloseTime: '13:00' },
  { id: 'OUT-015', name: 'MIT Stata Center', address: '32 Vassar St, Cambridge', district: 'Cambridge', location: { lat: 42.3615, lng: -71.0905 }, dockType: 'rear_dock', parkingConstraint: 'normal', windowOpenTime: '10:15', windowCloseTime: '13:15' },
  { id: 'OUT-016', name: 'Fenway Health Hub', address: 'Brookline Ave, Boston', district: 'Boston', location: { lat: 42.3440, lng: -71.1010 }, dockType: 'street', parkingConstraint: 'van_only', windowOpenTime: '10:30', windowCloseTime: '13:30' },
  { id: 'OUT-017', name: 'Back Bay Station', address: 'Dartmouth St, Boston', district: 'Boston', location: { lat: 42.3475, lng: -71.0755 }, dockType: 'street', parkingConstraint: 'normal', windowOpenTime: '10:30', windowCloseTime: '14:00' },
  { id: 'OUT-018', name: 'Prudential Center', address: '800 Boylston St, Boston', district: 'Boston', location: { lat: 42.3485, lng: -71.0825 }, dockType: 'mall_bay', parkingConstraint: 'mall_dock', windowOpenTime: '10:30', windowCloseTime: '14:30' },
  { id: 'OUT-019', name: 'Boston Financial District', address: 'State St, Boston', district: 'Boston', location: { lat: 42.3585, lng: -71.0560 }, dockType: 'rear_dock', parkingConstraint: 'normal', windowOpenTime: '11:00', windowCloseTime: '14:30' },
  { id: 'OUT-020', name: 'Charlestown Navy Yard', address: '1st Ave, Boston', district: 'Boston', location: { lat: 42.3745, lng: -71.0550 }, dockType: 'street', parkingConstraint: 'normal', windowOpenTime: '11:30', windowCloseTime: '15:00' },
];

// ─── Real Drivers ─────────────────────────────────────────────────────────────
export const peliyagodaDrivers: Driver[] = [
  { id: 'DRV-P01', name: 'Kamal Perera', initials: 'KP', phone: '+94 77 123 4567', licenseClass: 'C' },
  { id: 'DRV-P02', name: 'Nimal Silva', initials: 'NS', phone: '+94 77 234 5678', licenseClass: 'C' },
  { id: 'DRV-P03', name: 'Sunil Fernando', initials: 'SF', phone: '+94 77 345 6789', licenseClass: 'B' },
  { id: 'DRV-P04', name: 'Roshan Jayasuriya', initials: 'RJ', phone: '+94 77 456 7890', licenseClass: 'C' },
  { id: 'DRV-P05', name: 'Dinesh Chandimal', initials: 'DC', phone: '+94 77 567 8901', licenseClass: 'C' },
  { id: 'DRV-P06', name: 'Mahela Bandara', initials: 'MB', phone: '+94 77 678 9012', licenseClass: 'C' },
];

export const bostonDrivers: Driver[] = [
  { id: 'DRV-001', name: 'Ian Johnson', initials: 'IJ', phone: '+1 617 555 0101', licenseClass: 'C' },
  { id: 'DRV-002', name: 'Amy Miller', initials: 'AM', phone: '+1 617 555 0102', licenseClass: 'C' },
  { id: 'DRV-003', name: 'Dave Smith', initials: 'DS', phone: '+1 617 555 0103', licenseClass: 'B' },
  { id: 'DRV-004', name: 'John Barry', initials: 'JB', phone: '+1 617 555 0104', licenseClass: 'C' },
  { id: 'DRV-005', name: 'Mike Wilson', initials: 'MW', phone: '+1 617 555 0105', licenseClass: 'C' },
  { id: 'DRV-006', name: 'Robert Miller', initials: 'RM', phone: '+1 617 555 0106', licenseClass: 'C' },
];

// Set of vehicles currently grounded or in workshop from task2b_peak_day_fleet.csv
const workshopVehicleIds = new Set(
  (parsedData.task2bPeakFleet || [])
    .filter((f: any) => f.status === 'in_workshop')
    .map((f: any) => f.vehicle_id)
);

// ─── ALL 60 Fleet Vehicles from vehicles.csv ──────────────────────────────────
export const all60PeliyagodaVehicles: Vehicle[] = (parsedData.vehicles || []).map((v: any, idx: number) => {
  const inWorkshop = workshopVehicleIds.has(v.vehicle_id);
  const quota = parseFloat(v.weekly_fuel_quota_l) || 400;
  const consumed = Math.round(quota * (0.35 + (idx % 6) * 0.10) * 10) / 10;
  const center = v.depot === 'Kandy' ? districtCenters['Kandy'] : districtCenters['Colombo'];

  return {
    id: v.vehicle_id,
    plate: `WP-${v.vehicle_id}`,
    type: v.type === 'truck' ? (v.temp === 'reefer' ? 'Reefer' : 'Large') : 'Standard',
    capacityVolume: parseFloat(v.volume_cap_m3) || 12.0,
    capacityWeight: parseFloat(v.weight_cap_kg) || 2000,
    hasRefrigeration: v.temp === 'reefer',
    status: inWorkshop ? 'Maintenance' : (idx % 9 === 0 ? 'Idle' : (idx % 13 === 0 ? 'Offline' : 'Active')),
    driver: peliyagodaDrivers[idx % peliyagodaDrivers.length],
    location: {
      lat: Math.round((center[0] + (((idx * 11) % 15 - 7) * 0.005)) * 10000) / 10000,
      lng: Math.round((center[1] + (((idx * 13) % 15 - 7) * 0.005)) * 10000) / 10000,
    },
    heading: (idx * 45) % 360,
    fuelType: v.fuel_type as 'diesel' | 'petrol',
    kmPerL: parseFloat(v.km_per_l) || 5.2,
    weeklyFuelQuotaL: quota,
    fuelConsumedL: consumed,
    depotId: v.depot === 'Kandy' ? 'DEP-KDY' : 'DEP-PEL',
  };
});

export const peliyagodaVehicles: Vehicle[] = all60PeliyagodaVehicles.slice(0, 8);

export const bostonVehicles: Vehicle[] = [
  { id: 'VEH-001', plate: 'MA-DISP-01', type: 'Reefer', capacityVolume: 12.4, capacityWeight: 2200, hasRefrigeration: true, status: 'Active', driver: bostonDrivers[0], location: { lat: 42.3812, lng: -71.1070 }, heading: 45, fuelType: 'diesel', kmPerL: 5.5, weeklyFuelQuotaL: 400, fuelConsumedL: 114, depotId: 'DEP-BOS' },
  { id: 'VEH-002', plate: 'MA-DISP-02', type: 'Standard', capacityVolume: 8.2, capacityWeight: 1500, hasRefrigeration: false, status: 'Active', driver: bostonDrivers[1], location: { lat: 42.3920, lng: -71.0950 }, heading: 120, fuelType: 'diesel', kmPerL: 6.8, weeklyFuelQuotaL: 350, fuelConsumedL: 88, depotId: 'DEP-BOS' },
  { id: 'VEH-003', plate: 'MA-DISP-03', type: 'Large', capacityVolume: 18.6, capacityWeight: 3500, hasRefrigeration: false, status: 'Active', driver: bostonDrivers[2], location: { lat: 42.3665, lng: -71.0910 }, heading: 210, fuelType: 'diesel', kmPerL: 4.8, weeklyFuelQuotaL: 500, fuelConsumedL: 142, depotId: 'DEP-BOS' },
  { id: 'VEH-004', plate: 'MA-DISP-04', type: 'Reefer', capacityVolume: 11.0, capacityWeight: 2000, hasRefrigeration: true, status: 'Active', driver: bostonDrivers[3], location: { lat: 42.3550, lng: -71.1320 }, heading: 315, fuelType: 'diesel', kmPerL: 5.8, weeklyFuelQuotaL: 420, fuelConsumedL: 96, depotId: 'DEP-BOS' },
  { id: 'VEH-005', plate: 'MA-DISP-05', type: 'Standard', capacityVolume: 8.2, capacityWeight: 1500, hasRefrigeration: false, status: 'Active', driver: bostonDrivers[4], location: { lat: 42.3485, lng: -71.0825 }, heading: 90, fuelType: 'diesel', kmPerL: 7.1, weeklyFuelQuotaL: 380, fuelConsumedL: 78, depotId: 'DEP-BOS' },
  { id: 'VEH-006', plate: 'MA-DISP-06', type: 'Standard', capacityVolume: 8.2, capacityWeight: 1500, hasRefrigeration: false, status: 'Active', driver: bostonDrivers[5], location: { lat: 42.3585, lng: -71.0560 }, heading: 180, fuelType: 'diesel', kmPerL: 6.9, weeklyFuelQuotaL: 360, fuelConsumedL: 84, depotId: 'DEP-BOS' },
];

// Helper to compute realistic delivering item price & delivering operational costs
export const computeOrderEconomics = (
  brand: 'Fresh' | 'Style' | 'Tech',
  units: number,
  dockType: string,
  delayMin?: number
) => {
  // Merchandise Unit Values by Brand:
  // Fresh: food & cold chain produce ($28.50 / unit)
  // Style: apparel & footwear ($68.00 / unit)
  // Tech: electronics & hardware ($165.00 / unit)
  const unitPrice = brand === 'Fresh' ? 28.50 : (brand === 'Style' ? 68.00 : 165.00);
  const itemPrice = Math.round(units * unitPrice * 100) / 100;

  // Dock service allowance in minutes
  const allowanceMin = getServiceAllowance(brand, dockType);

  // Operational Cost Breakdown:
  // 1. Fuel cost: based on average leg distance (~12.5 km) and diesel at $1.25/L
  const fuelCost = Math.round((12.5 / 5.5) * 1.25 * 100) / 100; // ~$2.84 base fuel per stop + distribution

  // 2. Driver & crew labor cost: based on travel + unloading handling
  const laborCost = Math.round(((allowanceMin + 18) / 60) * 24.00 * 100) / 100; // $24/hr driver labor

  // 3. Handling & dock service cost:
  const serviceCost = Math.round(allowanceMin * 0.45 * 100) / 100;

  // 4. Late SLA penalty cost (if delayed):
  const penaltyCost = delayMin && delayMin > 0 ? Math.round(delayMin * 4.50 * 100) / 100 : 0;
  const deliveryCost = Math.round((fuelCost + laborCost + serviceCost + penaltyCost) * 100) / 100;
  const deliveryMargin = Math.round((itemPrice - deliveryCost) * 100) / 100;
  const costRatio = Math.round((deliveryCost / (itemPrice || 1)) * 1000) / 10;

  return {
    itemPrice,
    deliveryCost,
    deliveryMargin,
    costRatio,
    allowanceMin,
    costBreakdown: {
      fuelCost,
      laborCost,
      serviceCost,
      penaltyCost,
    },
  };
};

// ─── Real Orders from tempData Deliveries (Staggered realistic timings across 05:00 - 10:00) ──
const peliyagodaStaggeredTimes = [
  // Route 1 (Kamal Perera - 4 stops: indices 0..3): 05:45, 06:15, 06:45, 07:15
  { arrival: '05:45', start: '05:45', end: '06:00', duration: '15 min', routeId: 'RT-PEL-01', seq: 1 },
  { arrival: '06:15', start: '06:15', end: '06:30', duration: '15 min', routeId: 'RT-PEL-01', seq: 2 },
  { arrival: '06:45', start: '06:45', end: '07:00', duration: '15 min', routeId: 'RT-PEL-01', seq: 3 },
  { arrival: '07:15', start: '07:15', end: '07:30', duration: '15 min', routeId: 'RT-PEL-01', seq: 4 },

  // Route 2 (Nimal Silva - 3 stops: indices 4..6): 06:05, 06:35, 07:05
  { arrival: '06:05', start: '06:05', end: '06:20', duration: '15 min', routeId: 'RT-PEL-02', seq: 1 },
  { arrival: '06:35', start: '06:35', end: '06:50', duration: '15 min', routeId: 'RT-PEL-02', seq: 2 },
  { arrival: '07:05', start: '07:05', end: '07:20', duration: '15 min', routeId: 'RT-PEL-02', seq: 3 },

  // Route 3 (Sunil Fernando - 3 stops: indices 7..9): 06:25, 06:55, 07:25
  { arrival: '06:25', start: '06:25', end: '06:40', duration: '15 min', routeId: 'RT-PEL-03', seq: 1 },
  { arrival: '06:55', start: '06:55', end: '07:10', duration: '15 min', routeId: 'RT-PEL-03', seq: 2 },
  { arrival: '07:25', start: '07:25', end: '07:40', duration: '15 min', routeId: 'RT-PEL-03', seq: 3 },

  // Route 4 (Roshan Jayasuriya - 3 stops: indices 10..12): 06:40, 07:15, 07:45
  { arrival: '06:40', start: '06:40', end: '06:55', duration: '15 min', routeId: 'RT-PEL-04', seq: 1 },
  { arrival: '07:15', start: '07:15', end: '07:30', duration: '15 min', routeId: 'RT-PEL-04', seq: 2 },
  { arrival: '07:45', start: '07:45', end: '08:00', duration: '15 min', routeId: 'RT-PEL-04', seq: 3 },

  // Route 5 (Dinesh Chandimal - 3 stops: indices 13..15): 07:00, 07:35, 08:10
  { arrival: '07:00', start: '07:00', end: '07:15', duration: '15 min', routeId: 'RT-PEL-05', seq: 1 },
  { arrival: '07:35', start: '07:35', end: '07:50', duration: '15 min', routeId: 'RT-PEL-05', seq: 2 },
  { arrival: '08:10', start: '08:10', end: '08:25', duration: '15 min', routeId: 'RT-PEL-05', seq: 3 },

  // Route 6 (Mahela Bandara - 4 stops: indices 16..19): 07:20, 07:55, 08:30, 09:10
  { arrival: '07:20', start: '07:20', end: '07:35', duration: '15 min', routeId: 'RT-PEL-06', seq: 1 },
  { arrival: '07:55', start: '07:55', end: '08:10', duration: '15 min', routeId: 'RT-PEL-06', seq: 2 },
  { arrival: '08:30', start: '08:30', end: '08:45', duration: '15 min', routeId: 'RT-PEL-06', seq: 3 },
  { arrival: '09:10', start: '09:10', end: '09:25', duration: '15 min', routeId: 'RT-PEL-06', seq: 4 },

  // Unscheduled Pool (4 stops: indices 20..23)
  { arrival: '08:00', start: '08:00', end: '08:20', duration: '20 min', routeId: '', seq: 0 },
  { arrival: '08:30', start: '08:30', end: '08:50', duration: '20 min', routeId: '', seq: 0 },
  { arrival: '09:00', start: '09:00', end: '09:20', duration: '20 min', routeId: '', seq: 0 },
  { arrival: '09:30', start: '09:30', end: '09:50', duration: '20 min', routeId: '', seq: 0 },
];

export const peliyagodaOrders: Order[] = peliyagodaOutlets.map((outlet, idx) => {
  const isDelivered = idx < 10;
  const isDelayed = idx === 3 || idx === 7 || idx === 15;
  const delayMin = isDelayed ? 4 : undefined;
  const brand: Brand = idx % 3 === 0 ? 'Fresh' : (idx % 3 === 1 ? 'Style' : 'Tech');
  const units = 30 + (idx * 5) % 45;
  const econ = computeOrderEconomics(brand, units, outlet.dockType || 'street', delayMin);

  // First 20 orders are scheduled onto the 6 routes (indices 0..19)
  // Last 4 orders (indices 20, 21, 22, 23) are Unassigned in the Unscheduled pool!
  const isUnassigned = idx >= 20;
  const timing = peliyagodaStaggeredTimes[idx];

  return {
    id: `ORD0092${350 + idx}`,
    outlet: outlet,
    brand: brand,
    window: {
      start: outlet.windowOpenTime || '06:00',
      end: outlet.windowCloseTime || '10:30'
    },
    scheduledAt: isUnassigned ? undefined : timing.arrival,
    serviceStart: isUnassigned ? undefined : timing.start,
    serviceEnd: isUnassigned ? undefined : timing.end,
    actualDuration: timing.duration,
    priority: idx % 4 === 0 ? 'High' : (idx % 2 === 0 ? 'Medium' : 'Low'),
    proofOfDelivery: {
      hasPhoto: isDelivered,
      hasSignature: isDelivered,
      hasNote: idx % 2 === 0
    },
    volume: Math.round((1.2 + (idx * 0.25) % 1.8) * 10) / 10,
    weight: 220 + (idx * 35) % 280,
    temp: brand === 'Fresh' ? 'Chilled' : 'Ambient',
    routeId: isUnassigned ? undefined : timing.routeId,
    stopSequence: isUnassigned ? undefined : timing.seq,
    status: isUnassigned ? 'Unassigned' : (isDelivered ? 'Delivered' : (idx === 10 ? 'Loading' : 'Planned')),
    riskScore: isDelayed ? 65 : 12,
    district: outlet.district,
    units: units,
    itemPrice: econ.itemPrice,
    deliveryCost: econ.deliveryCost,
    costBreakdown: econ.costBreakdown,
    deliveryMargin: econ.deliveryMargin,
    costRatio: econ.costRatio,
    dockType: outlet.dockType,
    parkingConstraint: outlet.parkingConstraint,
    serviceAllowanceMin: econ.allowanceMin,
    estimatedTravelMin: 15,
    estimatedArrivalETA: isUnassigned ? undefined : timing.arrival,
    estimatedServiceMin: econ.allowanceMin,
    estimatedCompletionETA: isUnassigned ? undefined : timing.end,
    onTimeProbability: isDelayed ? 64 : 96,
  };
});

// Boston Orders with Realistic Merchandise Item Prices & Delivery Costs
export const bostonOrders: Order[] = [
  { id: 'ORD028', outlet: bostonOutlets[0], brand: 'Fresh', window: { start: '08:28', end: '08:38' }, scheduledAt: '08:28', serviceStart: '08:28', serviceEnd: '08:38', actualDuration: '10 min', priority: 'Medium', proofOfDelivery: { hasPhoto: true, hasSignature: true, hasNote: true }, volume: 2.4, weight: 438, temp: 'Chilled', routeId: 'RT-001', stopSequence: 1, status: 'Delivered', riskScore: 5, district: 'Somerville', units: 48, ...computeOrderEconomics('Fresh', 48, 'street') },
  { id: 'ORD009', outlet: bostonOutlets[1], brand: 'Fresh', window: { start: '08:43', end: '08:58' }, scheduledAt: '08:43', serviceStart: '08:56', serviceEnd: '08:58', delayMinutes: 4, actualDuration: '9 min', priority: 'Medium', proofOfDelivery: { hasPhoto: true, hasSignature: true, hasNote: true }, volume: 1.8, weight: 312, temp: 'Chilled', routeId: 'RT-001', stopSequence: 2, status: 'Delivered', riskScore: 8, district: 'Cambridge', units: 36, ...computeOrderEconomics('Fresh', 36, 'rear_dock', 4) },
  { id: 'ORD012', outlet: bostonOutlets[2], brand: 'Fresh', window: { start: '08:54', end: '09:06' }, scheduledAt: '08:54', serviceStart: '08:58', serviceEnd: '09:06', delayMinutes: 4, actualDuration: '7 min', priority: 'Medium', proofOfDelivery: { hasPhoto: true, hasSignature: true, hasNote: true }, volume: 3.1, weight: 560, temp: 'Ambient', routeId: 'RT-001', stopSequence: 3, status: 'Delivered', riskScore: 12, district: 'Cambridge', units: 58, ...computeOrderEconomics('Fresh', 58, 'rear_dock', 4) },
  { id: 'ORD064', outlet: bostonOutlets[3], brand: 'Style', window: { start: '09:11', end: '09:19' }, scheduledAt: '09:11', serviceStart: '09:16', serviceEnd: '09:19', delayMinutes: 5, actualDuration: '3 min', priority: 'Medium', proofOfDelivery: { hasPhoto: true, hasSignature: true, hasNote: true }, volume: 1.2, weight: 180, temp: 'Ambient', routeId: 'RT-001', stopSequence: 4, status: 'Delivered', riskScore: 10, district: 'Cambridge', units: 28, ...computeOrderEconomics('Style', 28, 'street', 5) },
  { id: 'ORD053', outlet: bostonOutlets[4], brand: 'Fresh', window: { start: '09:14', end: '09:22' }, scheduledAt: '09:14', serviceStart: '09:19', serviceEnd: '09:22', delayMinutes: 5, actualDuration: '6 min', priority: 'Medium', proofOfDelivery: { hasPhoto: true, hasSignature: true, hasNote: true }, volume: 2.8, weight: 510, temp: 'Chilled', routeId: 'RT-001', stopSequence: 5, status: 'Delivered', riskScore: 15, district: 'Cambridge', units: 52, ...computeOrderEconomics('Fresh', 52, 'rear_dock', 5) },
  { id: 'ORD001', outlet: bostonOutlets[5], brand: 'Tech', window: { start: '09:18', end: '09:26' }, scheduledAt: '09:18', serviceStart: '09:22', serviceEnd: '09:26', delayMinutes: 4, actualDuration: '4 min', priority: 'Medium', proofOfDelivery: { hasPhoto: true, hasSignature: true, hasNote: true }, volume: 0.8, weight: 95, temp: 'Ambient', routeId: 'RT-001', stopSequence: 6, status: 'Delivered', riskScore: 6, district: 'Cambridge', units: 18, ...computeOrderEconomics('Tech', 18, 'street', 4) },
  { id: 'ORD002', outlet: bostonOutlets[6], brand: 'Fresh', window: { start: '09:24', end: '09:33' }, scheduledAt: '09:24', serviceStart: '09:29', serviceEnd: '09:33', delayMinutes: 5, actualDuration: '4 min', priority: 'Medium', proofOfDelivery: { hasPhoto: true, hasSignature: true, hasNote: true }, volume: 3.4, weight: 620, temp: 'Chilled', routeId: 'RT-001', stopSequence: 7, status: 'Delivered', riskScore: 11, district: 'Cambridge', units: 64, ...computeOrderEconomics('Fresh', 64, 'street', 5) },
  { id: 'ORD105', outlet: bostonOutlets[7], brand: 'Style', window: { start: '09:30', end: '09:37' }, scheduledAt: '09:30', serviceStart: '09:34', serviceEnd: '09:37', delayMinutes: 4, actualDuration: '3 min', priority: 'Medium', proofOfDelivery: { hasPhoto: true, hasSignature: true, hasNote: true }, volume: 1.5, weight: 210, temp: 'Ambient', routeId: 'RT-001', stopSequence: 8, status: 'Delivered', riskScore: 9, district: 'Somerville', units: 32, ...computeOrderEconomics('Style', 32, 'rear_dock', 4) },
  { id: 'ORD112', outlet: bostonOutlets[8], brand: 'Fresh', window: { start: '10:14', end: '10:22' }, scheduledAt: '10:14', serviceStart: '10:14', serviceEnd: '10:22', actualDuration: '9 min', priority: 'Medium', proofOfDelivery: { hasPhoto: false, hasSignature: false, hasNote: false }, volume: 2.1, weight: 388, temp: 'Ambient', routeId: 'RT-001', stopSequence: 9, status: 'Loading', riskScore: 24, district: 'Somerville', units: 42, ...computeOrderEconomics('Fresh', 42, 'street') },
  { id: 'ORD010', outlet: bostonOutlets[9], brand: 'Fresh', window: { start: '10:27', end: '10:32' }, scheduledAt: '10:27', serviceStart: '10:27', serviceEnd: '10:32', actualDuration: '5 min', priority: 'High', proofOfDelivery: { hasPhoto: false, hasSignature: false, hasNote: false }, volume: 2.9, weight: 530, temp: 'Chilled', routeId: 'RT-001', stopSequence: 10, status: 'Planned', riskScore: 31, district: 'Somerville', units: 54, ...computeOrderEconomics('Fresh', 54, 'street') },
  { id: 'ORD018', outlet: bostonOutlets[10], brand: 'Style', window: { start: '10:36', end: '10:43' }, scheduledAt: '10:36', serviceStart: '10:36', serviceEnd: '10:43', actualDuration: '7 min', priority: 'Low', proofOfDelivery: { hasPhoto: false, hasSignature: false, hasNote: false }, volume: 1.1, weight: 162, temp: 'Ambient', routeId: 'RT-001', stopSequence: 11, status: 'Planned', riskScore: 19, district: 'Somerville', units: 24, ...computeOrderEconomics('Style', 24, 'rear_dock') },
  { id: 'ORD019', outlet: bostonOutlets[11], brand: 'Fresh', window: { start: '10:45', end: '11:00' }, scheduledAt: '10:45', serviceStart: '10:45', serviceEnd: '11:00', actualDuration: '15 min', priority: 'Medium', proofOfDelivery: { hasPhoto: false, hasSignature: false, hasNote: false }, volume: 2.5, weight: 410, temp: 'Ambient', routeId: 'RT-001', stopSequence: 12, status: 'Planned', riskScore: 14, district: 'Cambridge', units: 46, ...computeOrderEconomics('Fresh', 46, 'mall_bay') },
  { id: 'ORD020', outlet: bostonOutlets[8], brand: 'Fresh', window: { start: '08:30', end: '08:50' }, scheduledAt: '08:30', serviceStart: '08:32', delayMinutes: 2, actualDuration: '8 min', priority: 'High', proofOfDelivery: { hasPhoto: true, hasSignature: true, hasNote: false }, volume: 3.2, weight: 540, temp: 'Chilled', routeId: 'RT-002', stopSequence: 1, status: 'Delivered', riskScore: 22, district: 'Somerville', units: 62, ...computeOrderEconomics('Fresh', 62, 'street', 2) },
  { id: 'ORD021', outlet: bostonOutlets[9], brand: 'Style', window: { start: '09:00', end: '09:20' }, scheduledAt: '09:00', serviceStart: '09:02', delayMinutes: 2, actualDuration: '6 min', priority: 'Medium', proofOfDelivery: { hasPhoto: true, hasSignature: false, hasNote: false }, volume: 1.8, weight: 260, temp: 'Ambient', routeId: 'RT-002', stopSequence: 2, status: 'Delivered', riskScore: 18, district: 'Somerville', units: 34, ...computeOrderEconomics('Style', 34, 'street', 2) },
  { id: 'ORD022', outlet: bostonOutlets[14], brand: 'Tech', window: { start: '09:15', end: '09:45' }, scheduledAt: '09:15', serviceStart: '09:15', actualDuration: '12 min', priority: 'Medium', proofOfDelivery: { hasPhoto: false, hasSignature: false, hasNote: false }, volume: 2.1, weight: 310, temp: 'Ambient', routeId: 'RT-003', stopSequence: 1, status: 'En Route', riskScore: 15, district: 'Cambridge', units: 22, ...computeOrderEconomics('Tech', 22, 'rear_dock') },
  { id: 'ORD023', outlet: bostonOutlets[12], brand: 'Fresh', window: { start: '09:30', end: '10:00' }, scheduledAt: '09:30', serviceStart: '09:35', delayMinutes: 5, actualDuration: '10 min', priority: 'High', proofOfDelivery: { hasPhoto: true, hasSignature: true, hasNote: true }, volume: 4.1, weight: 680, temp: 'Chilled', routeId: 'RT-004', stopSequence: 1, status: 'Delivered', riskScore: 35, district: 'Allston', units: 75, ...computeOrderEconomics('Fresh', 75, 'street', 5) },
  { id: 'ORD024', outlet: bostonOutlets[13], brand: 'Style', window: { start: '10:05', end: '10:30' }, scheduledAt: '10:05', serviceStart: '10:10', delayMinutes: 5, actualDuration: '8 min', priority: 'Medium', proofOfDelivery: { hasPhoto: false, hasSignature: false, hasNote: false }, volume: 1.9, weight: 290, temp: 'Ambient', routeId: 'RT-004', stopSequence: 2, status: 'Loading', riskScore: 28, district: 'Boston', units: 38, ...computeOrderEconomics('Style', 38, 'mall_bay', 5) },
  { id: 'ORD025', outlet: bostonOutlets[15], brand: 'Fresh', window: { start: '10:15', end: '10:45' }, scheduledAt: '10:15', serviceStart: '10:15', actualDuration: '11 min', priority: 'Medium', proofOfDelivery: { hasPhoto: false, hasSignature: false, hasNote: false }, volume: 2.3, weight: 390, temp: 'Chilled', routeId: 'RT-005', stopSequence: 1, status: 'Loading', riskScore: 19, district: 'Boston', units: 45, ...computeOrderEconomics('Fresh', 45, 'street') },
  { id: 'ORD026', outlet: bostonOutlets[16], brand: 'Tech', window: { start: '10:50', end: '11:15' }, scheduledAt: '10:50', priority: 'Low', proofOfDelivery: { hasPhoto: false, hasSignature: false, hasNote: false }, volume: 1.1, weight: 140, temp: 'Ambient', routeId: 'RT-005', stopSequence: 2, status: 'Planned', riskScore: 12, district: 'Boston', units: 14, ...computeOrderEconomics('Tech', 14, 'street') },
  { id: 'ORD027', outlet: bostonOutlets[17], brand: 'Fresh', window: { start: '10:30', end: '11:00' }, scheduledAt: '10:30', serviceStart: '10:32', delayMinutes: 2, actualDuration: '14 min', priority: 'High', proofOfDelivery: { hasPhoto: true, hasSignature: false, hasNote: true }, volume: 3.5, weight: 580, temp: 'Chilled', routeId: 'RT-006', stopSequence: 1, status: 'Delivered', riskScore: 30, district: 'Boston', units: 66, ...computeOrderEconomics('Fresh', 66, 'street', 2) },
  { id: 'ORD029', outlet: bostonOutlets[18], brand: 'Fresh', window: { start: '11:05', end: '11:35' }, scheduledAt: '11:05', priority: 'High', proofOfDelivery: { hasPhoto: false, hasSignature: false, hasNote: false }, volume: 4.0, weight: 720, temp: 'Ambient', routeId: 'RT-006', stopSequence: 2, status: 'Planned', riskScore: 42, district: 'Boston', units: 72, ...computeOrderEconomics('Fresh', 72, 'mall_bay') },
  { id: 'ORD030F', outlet: bostonOutlets[19], brand: 'Style', window: { start: '11:45', end: '12:15' }, scheduledAt: '11:45', priority: 'Medium', proofOfDelivery: { hasPhoto: false, hasSignature: false, hasNote: false }, volume: 1.4, weight: 190, temp: 'Ambient', routeId: 'RT-006', stopSequence: 3, status: 'Failed', riskScore: 95, district: 'Boston', units: 25, ...computeOrderEconomics('Style', 25, 'street') },

  // Unscheduled Orders (Waypoint PRO Dispatch Queue)
  { id: 'UNS-001', outlet: { id: 'OUT-UNS1', name: 'Monument City Brewing Co', address: '1 N Haven St, Baltimore / Boston Metro', district: 'Boston', location: { lat: 42.3610, lng: -71.0620 }, dockType: 'rear_dock', parkingConstraint: 'normal', windowOpenTime: '09:00', windowCloseTime: '12:00' }, brand: 'Fresh', window: { start: '09:00', end: '12:00' }, priority: 'Medium', volume: 1.6, weight: 240, temp: 'Ambient', status: 'Unassigned', riskScore: 10, district: 'Boston', units: 30, ...computeOrderEconomics('Fresh', 30, 'rear_dock'), actualDuration: '5 min' },
  { id: 'UNS-002', outlet: { id: 'OUT-UNS2', name: 'Eastern Shore Brewing', address: '605 S Talbot St, St Michaels', district: 'Cambridge', location: { lat: 42.3720, lng: -71.1180 }, dockType: 'street', parkingConstraint: 'normal', windowOpenTime: '09:30', windowCloseTime: '13:00' }, brand: 'Fresh', window: { start: '09:30', end: '13:00' }, priority: 'Medium', volume: 2.2, weight: 360, temp: 'Chilled', status: 'Unassigned', riskScore: 12, district: 'Cambridge', units: 45, ...computeOrderEconomics('Fresh', 45, 'street'), actualDuration: '10 min' },
  { id: 'UNS-003', outlet: { id: 'OUT-UNS3', name: '605 S Talbot St, St Michaels, MD', address: '605 S Talbot St, St Michaels', district: 'Somerville', location: { lat: 42.3880, lng: -71.1030 }, dockType: 'street', parkingConstraint: 'normal', windowOpenTime: '10:00', windowCloseTime: '13:30' }, brand: 'Style', window: { start: '10:00', end: '13:30' }, priority: 'Low', volume: 1.4, weight: 190, temp: 'Ambient', status: 'Unassigned', riskScore: 15, district: 'Somerville', units: 35, ...computeOrderEconomics('Style', 35, 'street'), actualDuration: '10 min' },
  { id: 'UNS-004', outlet: { id: 'OUT-UNS4', name: '3626 Falls Rd', address: '3626 Falls Rd, Metro Corridor', district: 'Cambridge', location: { lat: 42.3680, lng: -71.0960 }, dockType: 'rear_dock', parkingConstraint: 'normal', windowOpenTime: '10:30', windowCloseTime: '14:00' }, brand: 'Tech', window: { start: '10:30', end: '14:00' }, priority: 'High', volume: 1.1, weight: 140, temp: 'Ambient', status: 'Unassigned', riskScore: 18, district: 'Cambridge', units: 28, ...computeOrderEconomics('Tech', 28, 'rear_dock'), actualDuration: '10 min' },
  { id: 'UNS-005', outlet: { id: 'OUT-UNS5', name: 'Union Craft Brewing', address: '1700 W 41st St, Suite 420', district: 'Boston', location: { lat: 42.3550, lng: -71.0710 }, dockType: 'rear_dock', parkingConstraint: 'normal', windowOpenTime: '10:30', windowCloseTime: '15:00' }, brand: 'Fresh', window: { start: '10:30', end: '15:00' }, priority: 'Medium', volume: 2.8, weight: 450, temp: 'Chilled', status: 'Unassigned', riskScore: 8, district: 'Boston', units: 50, ...computeOrderEconomics('Fresh', 50, 'rear_dock'), actualDuration: '12 min' },
].map((o: any, idx: number): Order => ({
  ...o,
  estimatedTravelMin: 9 + (idx * 2) % 14,
  estimatedArrivalETA: o.scheduledAt || '09:00',
  estimatedServiceMin: o.allowanceMin || o.serviceAllowanceMin || 18,
  estimatedCompletionETA: o.serviceEnd || '09:35',
  onTimeProbability: (o.delayMinutes && o.delayMinutes > 0) ? 68 : (idx % 4 === 0 ? 89 : 98),
}));

// Helper to calculate total route economics
const buildRouteEconomics = (stopsOrders: Order[]) => {
  const totalCargoValue = Math.round(stopsOrders.reduce((sum, o) => sum + (o.itemPrice || 0), 0) * 100) / 100;
  const totalRouteCost = Math.round(stopsOrders.reduce((sum, o) => sum + (o.deliveryCost || 0), 0) * 100) / 100;
  const fuelCost = Math.round(stopsOrders.reduce((sum, o) => sum + (o.costBreakdown?.fuelCost || 0), 0) * 100) / 100;
  const laborCost = Math.round(stopsOrders.reduce((sum, o) => sum + (o.costBreakdown?.laborCost || 0), 0) * 100) / 100;
  const profitMargin = Math.round((totalCargoValue - totalRouteCost) * 100) / 100;
  const fuelConsumedL = Math.round((fuelCost / 1.25) * 10) / 10;
  const totalDistanceKm = Math.round(stopsOrders.length * 8.4 * 10) / 10;

  return {
    totalCargoValue,
    totalRouteCost,
    fuelCost,
    laborCost,
    profitMargin,
    fuelConsumedL,
    totalDistanceKm,
  };
};

// ─── Real Routes for Peliyagoda (6 Clean Corridor Loops without ocean lines) ─
export const peliyagodaRoutes: Route[] = [
  {
    id: 'RT-PEL-01', name: 'Kamal Perera', color: '#2563EB', status: 'Active',
    vehicle: peliyagodaVehicles[0], driver: peliyagodaDrivers[0],
    depotId: 'DEP-PEL', usedVolume: 8.2, usedWeight: 1480,
    startTime: '05:30', estimatedFinish: '08:00', firstEta: '05:45',
    stops: peliyagodaOrders.slice(0, 4).map((o, i) => ({
      order: o, sequence: i + 1, eta: o.scheduledAt || '06:00', status: o.status
    })),
    geometry: [
      peliyagodaDepots[0].location,
      ...peliyagodaOrders.slice(0, 4).map(o => o.outlet.location),
      peliyagodaDepots[0].location
    ],
    ...buildRouteEconomics(peliyagodaOrders.slice(0, 4))
  },
  {
    id: 'RT-PEL-02', name: 'Nimal Silva', color: '#10B981', status: 'Active',
    vehicle: peliyagodaVehicles[1], driver: peliyagodaDrivers[1],
    depotId: 'DEP-PEL', usedVolume: 7.9, usedWeight: 1390,
    startTime: '05:45', estimatedFinish: '08:15', firstEta: '06:05',
    stops: peliyagodaOrders.slice(4, 7).map((o, i) => ({
      order: o, sequence: i + 1, eta: o.scheduledAt || '06:30', status: o.status
    })),
    geometry: [
      peliyagodaDepots[0].location,
      ...peliyagodaOrders.slice(4, 7).map(o => o.outlet.location),
      peliyagodaDepots[0].location
    ],
    ...buildRouteEconomics(peliyagodaOrders.slice(4, 7))
  },
  {
    id: 'RT-PEL-03', name: 'Sunil Fernando', color: '#8B5CF6', status: 'Active',
    vehicle: peliyagodaVehicles[2], driver: peliyagodaDrivers[2],
    depotId: 'DEP-PEL', usedVolume: 6.8, usedWeight: 1220,
    startTime: '06:00', estimatedFinish: '08:30', firstEta: '06:25',
    stops: peliyagodaOrders.slice(7, 10).map((o, i) => ({
      order: o, sequence: i + 1, eta: o.scheduledAt || '06:45', status: o.status
    })),
    geometry: [
      peliyagodaDepots[0].location,
      ...peliyagodaOrders.slice(7, 10).map(o => o.outlet.location),
      peliyagodaDepots[0].location
    ],
    ...buildRouteEconomics(peliyagodaOrders.slice(7, 10))
  },
  {
    id: 'RT-PEL-04', name: 'Roshan Jayasuriya', color: '#0284C7', status: 'Active',
    vehicle: peliyagodaVehicles[3], driver: peliyagodaDrivers[3],
    depotId: 'DEP-PEL', usedVolume: 9.4, usedWeight: 1720,
    startTime: '06:15', estimatedFinish: '08:45', firstEta: '06:40',
    stops: peliyagodaOrders.slice(10, 13).map((o, i) => ({
      order: o, sequence: i + 1, eta: o.scheduledAt || '07:00', status: o.status
    })),
    geometry: [
      peliyagodaDepots[0].location,
      ...peliyagodaOrders.slice(10, 13).map(o => o.outlet.location),
      peliyagodaDepots[0].location
    ],
    ...buildRouteEconomics(peliyagodaOrders.slice(10, 13))
  },
  {
    id: 'RT-PEL-05', name: 'Dinesh Chandimal', color: '#F59E0B', status: 'Active',
    vehicle: peliyagodaVehicles[4], driver: peliyagodaDrivers[4],
    depotId: 'DEP-PEL', usedVolume: 7.2, usedWeight: 1310,
    startTime: '06:30', estimatedFinish: '09:00', firstEta: '07:00',
    stops: peliyagodaOrders.slice(13, 16).map((o, i) => ({
      order: o, sequence: i + 1, eta: o.scheduledAt || '07:15', status: o.status
    })),
    geometry: [
      peliyagodaDepots[0].location,
      ...peliyagodaOrders.slice(13, 16).map(o => o.outlet.location),
      peliyagodaDepots[0].location
    ],
    ...buildRouteEconomics(peliyagodaOrders.slice(13, 16))
  },
  {
    id: 'RT-PEL-06', name: 'Mahela Bandara', color: '#EA580C', status: 'Active',
    vehicle: peliyagodaVehicles[5], driver: peliyagodaDrivers[5],
    depotId: 'DEP-PEL', usedVolume: 8.5, usedWeight: 1540,
    startTime: '06:45', estimatedFinish: '09:30', firstEta: '07:20',
    stops: peliyagodaOrders.slice(16, 20).map((o, i) => ({
      order: o, sequence: i + 1, eta: o.scheduledAt || '07:30', status: o.status
    })),
    geometry: [
      peliyagodaDepots[0].location,
      ...peliyagodaOrders.slice(16, 20).map(o => o.outlet.location),
      peliyagodaDepots[0].location
    ],
    ...buildRouteEconomics(peliyagodaOrders.slice(16, 20))
  }
];

export const bostonRoutes: Route[] = [
  {
    id: 'RT-001', name: 'Ian Johnson', color: '#2563EB', status: 'Active',
    vehicle: bostonVehicles[0], driver: bostonDrivers[0],
    depotId: 'DEP-BOS', usedVolume: 10.4, usedWeight: 1890,
    startTime: '08:00', estimatedFinish: '12:30', firstEta: '08:28',
    stops: bostonOrders.slice(0, 11).map((o, i) => ({
      order: o, sequence: i + 1, eta: o.scheduledAt || '08:30', status: o.status
    })),
    geometry: [
      bostonDepots[0].location,
      ...bostonOrders.slice(0, 11).map(o => o.outlet.location)
    ],
    ...buildRouteEconomics(bostonOrders.slice(0, 11))
  },
  {
    id: 'RT-002', name: 'Amy Miller', color: '#10B981', status: 'Active',
    vehicle: bostonVehicles[1], driver: bostonDrivers[1],
    depotId: 'DEP-BOS', usedVolume: 6.8, usedWeight: 1120,
    startTime: '08:15', estimatedFinish: '13:00', firstEta: '08:32',
    stops: [
      { order: bostonOrders[12], sequence: 1, eta: '08:32', status: 'Delivered' },
      { order: bostonOrders[13], sequence: 2, eta: '09:02', status: 'Delivered' },
    ],
    geometry: [
      bostonDepots[0].location,
      bostonOrders[12].outlet.location,
      bostonOrders[13].outlet.location,
    ],
    ...buildRouteEconomics([bostonOrders[12], bostonOrders[13]])
  },
  {
    id: 'RT-003', name: 'Dave Smith', color: '#10B981', status: 'Active',
    vehicle: bostonVehicles[2], driver: bostonDrivers[2],
    depotId: 'DEP-BOS', usedVolume: 4.2, usedWeight: 780,
    startTime: '08:30', estimatedFinish: '12:00', firstEta: '09:15',
    stops: [
      { order: bostonOrders[14], sequence: 1, eta: '09:15', status: 'En Route' },
    ],
    geometry: [
      bostonDepots[0].location,
      bostonOrders[14].outlet.location,
    ],
    ...buildRouteEconomics([bostonOrders[14]])
  },
  {
    id: 'RT-004', name: 'John Barry', color: '#3B82F6', status: 'Active',
    vehicle: bostonVehicles[3], driver: bostonDrivers[3],
    depotId: 'DEP-BOS', usedVolume: 8.5, usedWeight: 1420,
    startTime: '08:00', estimatedFinish: '13:30', firstEta: '09:35',
    stops: [
      { order: bostonOrders[15], sequence: 1, eta: '09:35', status: 'Delivered' },
      { order: bostonOrders[16], sequence: 2, eta: '10:10', status: 'Arrived' },
    ],
    geometry: [
      bostonDepots[0].location,
      bostonOrders[15].outlet.location,
      bostonOrders[16].outlet.location,
    ],
    ...buildRouteEconomics([bostonOrders[15], bostonOrders[16]])
  },
  {
    id: 'RT-005', name: 'Mike Wilson', color: '#F59E0B', status: 'Active',
    vehicle: bostonVehicles[4], driver: bostonDrivers[4],
    depotId: 'DEP-BOS', usedVolume: 5.6, usedWeight: 930,
    startTime: '08:30', estimatedFinish: '13:00', firstEta: '10:15',
    stops: [
      { order: bostonOrders[17], sequence: 1, eta: '10:15', status: 'Arrived' },
      { order: bostonOrders[18], sequence: 2, eta: '10:50', status: 'Planned' },
    ],
    geometry: [
      bostonDepots[0].location,
      bostonOrders[17].outlet.location,
      bostonOrders[18].outlet.location,
    ],
    ...buildRouteEconomics([bostonOrders[17], bostonOrders[18]])
  },
  {
    id: 'RT-006', name: 'Robert Miller', color: '#EA580C', status: 'Active',
    vehicle: bostonVehicles[5], driver: bostonDrivers[5],
    depotId: 'DEP-BOS', usedVolume: 11.2, usedWeight: 1980,
    startTime: '08:15', estimatedFinish: '13:45', firstEta: '10:32',
    stops: [
      { order: bostonOrders[19], sequence: 1, eta: '10:32', status: 'Delivered' },
      { order: bostonOrders[20], sequence: 2, eta: '11:05', status: 'Planned' },
      { order: bostonOrders[21], sequence: 3, eta: '11:45', status: 'At Risk' },
    ],
    geometry: [
      bostonDepots[0].location,
      bostonOrders[19].outlet.location,
      bostonOrders[20].outlet.location,
      bostonOrders[21].outlet.location,
    ],
    ...buildRouteEconomics([bostonOrders[19], bostonOrders[20], bostonOrders[21]])
  },
];

// ─── District Travel Matrix from district_travel.csv ──────────────────────────
export const districtTravelMatrix: DistrictTravelInfo[] = (parsedData.districtTravel || []).map((dt: any) => ({
  district: dt.district,
  depot: dt.depot,
  roadClass: dt.road_class,
  freeFlowKmh: parseFloat(dt.free_flow_kmh) || 30,
  depotToDistrictKm: parseFloat(dt.depot_to_district_km) || 12,
  depotToDistrictFreeflowMin: parseFloat(dt.depot_to_district_freeflow_min) || 24,
  interStopKm: parseFloat(dt.inter_stop_km) || 4,
  interStopFreeflowMin: parseFloat(dt.inter_stop_freeflow_min) || 8,
}));

// ─── Task 2A Demand Forecast Inputs from task2a_test_inputs.csv ───────────────
export const task2aForecastCases: Task2aForecastItem[] = (parsedData.task2aForecastInputs || []).map((t: any) => {
  const isChilled = t.brand === 'Fresh';
  const baseVol = t.brand === 'Fresh' ? 42.5 : (t.brand === 'Style' ? 28.0 : 19.4);
  const weekMultiplier = t.iso_week === '15' ? 1.45 : (t.iso_week === '16' ? 1.30 : 1.05); // Sinhala/Tamil Avurudda surge
  const predTotal = Math.round(baseVol * weekMultiplier * 10) / 10;
  const predChilled = isChilled ? Math.round(predTotal * 0.65 * 10) / 10 : 0;
  return {
    rowId: t.row_id,
    depot: t.depot,
    brand: t.brand,
    isoYear: parseInt(t.iso_year) || 2026,
    isoWeek: parseInt(t.iso_week) || 14,
    predTotalVolumeM3: predTotal,
    predChilledVolumeM3: predChilled,
  };
});

// ─── Task 2B Peak Day Fleet Grounded Status from task2b_peak_day_fleet.csv ─────
export const task2bPeakFleet: PeakFleetStatus[] = (parsedData.task2bPeakFleet || []).map((f: any) => ({
  scenario: f.scenario,
  vehicleId: f.vehicle_id,
  status: (f.status as 'in_workshop' | 'available') || 'available',
}));

// ─── Task 2B Peak Day Scenarios from task2b_peak_day_scenarios.csv ─────────────
export const task2bPeakScenarios: PeakDayScenario[] = (parsedData.task2bPeakScenarios || []).map((s: any) => ({
  scenario: s.scenario,
  orderRef: s.order_ref,
  outletId: s.outlet_id,
  brand: s.brand,
  district: s.district,
  depot: s.depot,
  dockType: s.dock_type,
  parkingConstraint: s.parking_constraint,
  mallWindow: s.mall_window || undefined,
  windowOpenTime: s.window_open_time,
  windowCloseTime: s.window_close_time,
  tempRequirement: s.temp_requirement,
  orderUnits: parseInt(s.order_units) || 20,
  orderWeightKg: parseFloat(s.order_weight_kg) || 250,
  orderVolumeM3: parseFloat(s.order_volume_m3) || 1.5,
  deferredYesterday: s.deferred_yesterday === '1',
  daysSinceLastServed: parseInt(s.days_since_last_served) || 1,
  decision: s.deferred_yesterday === '1' ? 'served' : (parseInt(s.order_units) > 40 ? 'served' : 'deferred'),
}));

// ─── Calendar & Holiday Schedule from calendar.csv ────────────────────────────
export const calendarEvents = parsedData.calendar || [];

// ─── Traffic Speed Profiles from traffic_speed.csv ────────────────────────────
export const trafficSpeedProfiles = parsedData.trafficSpeed || [];

// ─── Overall Economic & Margin KPI Calculator ──────────────────────────────────
export const calculateDatasetEconomics = (orders: Order[], vehicles: Vehicle[]): KpiSummary => {
  const totalItemValue = Math.round(orders.reduce((sum, o) => sum + (o.itemPrice || 0), 0) * 100) / 100;
  const totalDeliveryCost = Math.round(orders.reduce((sum, o) => sum + (o.deliveryCost || 0), 0) * 100) / 100;
  const netDeliveryMargin = Math.round((totalItemValue - totalDeliveryCost) * 100) / 100;
  const avgCostPerDelivery = orders.length > 0 ? Math.round((totalDeliveryCost / orders.length) * 100) / 100 : 0;
  const costPercentage = totalItemValue > 0 ? Math.round((totalDeliveryCost / totalItemValue) * 1000) / 10 : 0;

  const totalFuelConsumedL = Math.round(vehicles.reduce((sum, v) => sum + (v.fuelConsumedL || 0), 0) * 10) / 10;
  const totalFuelQuotaL = Math.round(vehicles.reduce((sum, v) => sum + (v.weeklyFuelQuotaL || 0), 0) * 10) / 10;

  const delivered = orders.filter(o => o.status === 'Delivered').length;
  const atRisk = orders.filter(o => o.status === 'At Risk' || (o.delayMinutes && o.delayMinutes > 0)).length;
  const planned = orders.filter(o => o.status === 'Planned').length;
  const unassigned = orders.filter(o => o.status === 'Unassigned').length;
  const activeVehicles = vehicles.filter(v => v.status === 'Active').length;
  const offline = vehicles.filter(v => v.status === 'Offline' || v.status === 'Maintenance').length;

  return {
    totalOrders: orders.length,
    planned,
    unassigned,
    atRisk,
    activeVehicles,
    onSchedule: delivered,
    completed: delivered,
    offline,
    totalItemValue,
    totalDeliveryCost,
    netDeliveryMargin,
    avgCostPerDelivery,
    costPercentage,
    totalFuelConsumedL,
    totalFuelQuotaL,
  };
};
