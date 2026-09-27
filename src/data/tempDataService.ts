import parsedData from './tempDataParsed.json';
import type { Order, Route, Vehicle, Driver, Outlet, Depot } from '../types';

// ─── Depots ───────────────────────────────────────────────────────────────────
export const peliyagodaDepots: Depot[] = [
  { id: 'DEP-PEL', name: 'Peliyagoda Central Depot', location: { lat: 6.9535, lng: 79.8912 }, address: 'Kandy Road, Peliyagoda, Western Province' },
  { id: 'DEP-KDY', name: 'Kandy Hill Depot', location: { lat: 7.2906, lng: 80.6337 }, address: 'William Gopallawa Mawatha, Kandy' },
];

export const bostonDepots: Depot[] = [
  { id: 'DEP-BOS', name: 'Boston Metro Hub', location: { lat: 42.3785, lng: -71.0720 }, address: 'Charlestown / Inner Belt, Boston, MA' },
  { id: 'DEP-CAM', name: 'Cambridge West Hub', location: { lat: 42.3910, lng: -71.1350 }, address: 'Alewife Brook Pkwy, Cambridge, MA' },
];

// Colombo geographic distribution coordinates for outlets OUT001-OUT025
const colomboCoords: [number, number][] = [
  [6.9360, 79.8490], // Fort
  [6.9200, 79.8580], // Slave Island
  [6.9080, 79.8510], // Kollupitiya
  [6.8920, 79.8550], // Bambalapitiya
  [6.8770, 79.8620], // Havelock
  [6.8640, 79.8640], // Wellawatte
  [6.8480, 79.8660], // Dehiwala
  [6.8720, 79.8890], // Nugegoda
  [6.8900, 79.8820], // Kirulapone
  [6.9100, 79.8730], // Borella
  [6.9250, 79.8680], // Maradana
  [6.9450, 79.8620], // Kotahena
  [6.9580, 79.8820], // Kelani River North
  [6.9550, 79.9180], // Kelaniya
  [6.9100, 79.8950], // Rajagiriya
  [6.8970, 79.9190], // Battaramulla
  [6.8450, 79.9240], // Maharagama
  [6.8400, 79.8800], // Mount Lavinia
  [6.9750, 79.8900], // Wattala
  [6.9950, 79.9200], // Kiribathgoda
  [6.9020, 79.8610], // Cinnamon Gardens
  [6.9140, 79.8550], // Kollupitiya East
  [6.9310, 79.8440], // Colombo Port Area
  [6.8850, 79.8710], // Narahenpita
  [6.8750, 79.9020], // Mirihana
];


// ─── Real Outlets Generated from tempData ─────────────────────────────────────
export const peliyagodaOutlets: Outlet[] = (parsedData.outlets.slice(0, 25)).map((o: any, idx: number) => {
  const [lat, lng] = colomboCoords[idx % colomboCoords.length];
  return {
    id: o.outlet_id,
    name: `${o.outlet_id} · ${o.brand} ${o.dock_type.replace('_', ' ').toUpperCase()}`,
    address: `${o.district} Metro Distribution, Sector ${idx + 1}`,
    district: o.district,
    location: { lat, lng },
  };
});

export const bostonOutlets: Outlet[] = [
  { id: 'OUT-001', name: 'Information Resource Center', address: 'Somerville Ave, Somerville', district: 'Somerville', location: { lat: 42.3812, lng: -71.1070 } },
  { id: 'OUT-002', name: 'Cambridge Brewing Company', address: '1 Kendall Sq, Cambridge', district: 'Cambridge', location: { lat: 42.3665, lng: -71.0910 } },
  { id: 'OUT-003', name: 'Craigie on Main', address: '853 Main St, Cambridge', district: 'Cambridge', location: { lat: 42.3645, lng: -71.1018 } },
  { id: 'OUT-004', name: 'City Girl Cafe', address: '204 Hampshire St, Cambridge', district: 'Cambridge', location: { lat: 42.3712, lng: -71.0945 } },
  { id: 'OUT-005', name: 'S&S Restaurant', address: '1334 Cambridge St, Cambridge', district: 'Cambridge', location: { lat: 42.3738, lng: -71.0995 } },
  { id: 'OUT-006', name: 'Highland Fried', address: '1271 Cambridge St, Cambridge', district: 'Cambridge', location: { lat: 42.3745, lng: -71.0980 } },
  { id: 'OUT-007', name: 'All-Star Sandwich Bar', address: '1245 Cambridge St, Cambridge', district: 'Cambridge', location: { lat: 42.3740, lng: -71.0970 } },
  { id: 'OUT-008', name: 'Somerville Fire Department', address: '266 Broadway, Somerville', district: 'Somerville', location: { lat: 42.3876, lng: -71.0995 } },
  { id: 'OUT-009', name: 'Northeastern Junior High School', address: 'Marshall St, Somerville', district: 'Somerville', location: { lat: 42.3920, lng: -71.0950 } },
  { id: 'OUT-010', name: 'Ball Square Cafe', address: '708 Broadway, Somerville', district: 'Somerville', location: { lat: 42.3995, lng: -71.1120 } },
  { id: 'OUT-011', name: 'CVS Pharmacy', address: 'Beacon St, Somerville', district: 'Somerville', location: { lat: 42.3820, lng: -71.1150 } },
  { id: 'OUT-012', name: 'Harvard Kennedy School', address: '79 JFK St, Cambridge', district: 'Cambridge', location: { lat: 42.3715, lng: -71.1215 } },
  { id: 'OUT-013', name: 'Allston Courier Center', address: 'Brighton Ave, Allston', district: 'Allston', location: { lat: 42.3530, lng: -71.1330 } },
  { id: 'OUT-014', name: 'Boston University Central', address: 'Commonwealth Ave, Boston', district: 'Boston', location: { lat: 42.3505, lng: -71.1054 } },
  { id: 'OUT-015', name: 'MIT Stata Center', address: '32 Vassar St, Cambridge', district: 'Cambridge', location: { lat: 42.3615, lng: -71.0905 } },
  { id: 'OUT-016', name: 'Fenway Health Hub', address: 'Brookline Ave, Boston', district: 'Boston', location: { lat: 42.3440, lng: -71.1010 } },
  { id: 'OUT-017', name: 'Back Bay Station', address: 'Dartmouth St, Boston', district: 'Boston', location: { lat: 42.3475, lng: -71.0755 } },
  { id: 'OUT-018', name: 'Prudential Center', address: '800 Boylston St, Boston', district: 'Boston', location: { lat: 42.3485, lng: -71.0825 } },
  { id: 'OUT-019', name: 'Boston Financial District', address: 'State St, Boston', district: 'Boston', location: { lat: 42.3585, lng: -71.0560 } },
  { id: 'OUT-020', name: 'Charlestown Navy Yard', address: '1st Ave, Boston', district: 'Boston', location: { lat: 42.3745, lng: -71.0550 } },
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

// ─── Real Vehicles from tempData ──────────────────────────────────────────────
export const peliyagodaVehicles: Vehicle[] = (parsedData.vehicles.slice(0, 8)).map((v: any, idx: number) => {
  return {
    id: v.vehicle_id,
    plate: `WP-${v.vehicle_id}`,
    type: v.type === 'truck' ? (v.temp === 'reefer' ? 'Reefer' : 'Standard') : 'Standard',
    capacityVolume: parseFloat(v.volume_cap_m3),
    capacityWeight: parseFloat(v.weight_cap_kg),
    hasRefrigeration: v.temp === 'reefer',
    status: idx === 7 ? 'Offline' : (idx === 6 ? 'Idle' : 'Active'),
    driver: peliyagodaDrivers[idx % peliyagodaDrivers.length],
    location: {
      lat: colomboCoords[idx][0],
      lng: colomboCoords[idx][1]
    },
    heading: (idx * 45) % 360
  };
});

export const bostonVehicles: Vehicle[] = [
  { id: 'VEH-001', plate: 'MA-DISP-01', type: 'Reefer', capacityVolume: 12.4, capacityWeight: 2200, hasRefrigeration: true, status: 'Active', driver: bostonDrivers[0], location: { lat: 42.3812, lng: -71.1070 }, heading: 45 },
  { id: 'VEH-002', plate: 'MA-DISP-02', type: 'Standard', capacityVolume: 8.2, capacityWeight: 1500, hasRefrigeration: false, status: 'Active', driver: bostonDrivers[1], location: { lat: 42.3920, lng: -71.0950 }, heading: 120 },
  { id: 'VEH-003', plate: 'MA-DISP-03', type: 'Large', capacityVolume: 18.6, capacityWeight: 3500, hasRefrigeration: false, status: 'Active', driver: bostonDrivers[2], location: { lat: 42.3665, lng: -71.0910 }, heading: 210 },
  { id: 'VEH-004', plate: 'MA-DISP-04', type: 'Reefer', capacityVolume: 11.0, capacityWeight: 2000, hasRefrigeration: true, status: 'Active', driver: bostonDrivers[3], location: { lat: 42.3550, lng: -71.1320 }, heading: 315 },
  { id: 'VEH-005', plate: 'MA-DISP-05', type: 'Standard', capacityVolume: 8.2, capacityWeight: 1500, hasRefrigeration: false, status: 'Active', driver: bostonDrivers[4], location: { lat: 42.3485, lng: -71.0825 }, heading: 90 },
  { id: 'VEH-006', plate: 'MA-DISP-06', type: 'Standard', capacityVolume: 8.2, capacityWeight: 1500, hasRefrigeration: false, status: 'Active', driver: bostonDrivers[5], location: { lat: 42.3585, lng: -71.0560 }, heading: 180 },
];

// ─── Real Orders from tempData Deliveries ──────────────────────────────────────
export const peliyagodaOrders: Order[] = (parsedData.deliveries.slice(0, 22)).map((d: any, idx: number) => {
  const outlet = peliyagodaOutlets[idx % peliyagodaOutlets.length];
  const isDelivered = idx < 8;
  const isDelayed = idx >= 1 && idx <= 7;
  const delayMin = isDelayed ? [4, 4, 5, 5, 4, 5, 4][idx - 1] : undefined;

  return {
    id: d.delivery_id,
    outlet: outlet,
    brand: (d.brand as 'Fresh' | 'Style' | 'Tech') || 'Fresh',
    window: {
      start: d.window_open_time || '08:00',
      end: d.window_close_time || '10:30'
    },
    scheduledAt: `${d.planned_arrival_time || '08:30'} AM`,
    serviceStart: `${d.planned_arrival_time || '08:30'} AM`,
    serviceEnd: `09:${30 + (idx * 2) % 30} AM`,
    delayMinutes: delayMin,
    actualDuration: `${6 + (idx * 2) % 8} min`,
    priority: idx % 3 === 0 ? 'High' : (idx % 2 === 0 ? 'Medium' : 'Low'),
    proofOfDelivery: {
      hasPhoto: isDelivered,
      hasSignature: isDelivered,
      hasNote: idx % 2 === 0
    },
    volume: parseFloat(d.order_volume_m3) || 1.8,
    weight: parseFloat(d.order_weight_kg) || 280,
    temp: d.temp_requirement === 'chilled' ? 'Chilled' : 'Ambient',
    routeId: 'RT-PEL-01',
    stopSequence: idx + 1,
    status: isDelivered ? 'Delivered' : (idx === 8 ? 'Loading' : (idx === 21 ? 'Failed' : 'Planned')),
    riskScore: isDelayed ? 65 : 12,
    district: outlet.district,
  };
});

export const bostonOrders: Order[] = [
  { id: 'ORD028', outlet: bostonOutlets[0], brand: 'Fresh', window: { start: '08:28', end: '08:38' }, scheduledAt: '8:28 AM', serviceStart: '8:28 AM', serviceEnd: '8:38 AM', actualDuration: '10 min', priority: 'Medium', proofOfDelivery: { hasPhoto: true, hasSignature: true, hasNote: true }, volume: 2.4, weight: 438, temp: 'Chilled', routeId: 'RT-001', stopSequence: 1, status: 'Delivered', riskScore: 5, district: 'Somerville' },
  { id: 'ORD009', outlet: bostonOutlets[1], brand: 'Fresh', window: { start: '08:43', end: '08:58' }, scheduledAt: '8:43 AM', serviceStart: '8:56 AM', serviceEnd: '8:58 AM', delayMinutes: 4, actualDuration: '9 min', priority: 'Medium', proofOfDelivery: { hasPhoto: true, hasSignature: true, hasNote: true }, volume: 1.8, weight: 312, temp: 'Chilled', routeId: 'RT-001', stopSequence: 2, status: 'Delivered', riskScore: 8, district: 'Cambridge' },
  { id: 'ORD012', outlet: bostonOutlets[2], brand: 'Fresh', window: { start: '08:54', end: '09:06' }, scheduledAt: '8:54 AM', serviceStart: '8:58 AM', serviceEnd: '9:06 AM', delayMinutes: 4, actualDuration: '7 min', priority: 'Medium', proofOfDelivery: { hasPhoto: true, hasSignature: true, hasNote: true }, volume: 3.1, weight: 560, temp: 'Ambient', routeId: 'RT-001', stopSequence: 3, status: 'Delivered', riskScore: 12, district: 'Cambridge' },
  { id: 'ORD064', outlet: bostonOutlets[3], brand: 'Style', window: { start: '09:11', end: '09:19' }, scheduledAt: '9:11 AM', serviceStart: '9:16 AM', serviceEnd: '9:19 AM', delayMinutes: 5, actualDuration: '3 min', priority: 'Medium', proofOfDelivery: { hasPhoto: true, hasSignature: true, hasNote: true }, volume: 1.2, weight: 180, temp: 'Ambient', routeId: 'RT-001', stopSequence: 4, status: 'Delivered', riskScore: 10, district: 'Cambridge' },
  { id: 'ORD053', outlet: bostonOutlets[4], brand: 'Fresh', window: { start: '09:14', end: '09:22' }, scheduledAt: '9:14 AM', serviceStart: '9:19 AM', serviceEnd: '9:22 AM', delayMinutes: 5, actualDuration: '6 min', priority: 'Medium', proofOfDelivery: { hasPhoto: true, hasSignature: true, hasNote: true }, volume: 2.8, weight: 510, temp: 'Chilled', routeId: 'RT-001', stopSequence: 5, status: 'Delivered', riskScore: 15, district: 'Cambridge' },
  { id: 'ORD001', outlet: bostonOutlets[5], brand: 'Tech', window: { start: '09:18', end: '09:26' }, scheduledAt: '9:18 AM', serviceStart: '9:22 AM', serviceEnd: '9:26 AM', delayMinutes: 4, actualDuration: '4 min', priority: 'Medium', proofOfDelivery: { hasPhoto: true, hasSignature: true, hasNote: true }, volume: 0.8, weight: 95, temp: 'Ambient', routeId: 'RT-001', stopSequence: 6, status: 'Delivered', riskScore: 6, district: 'Cambridge' },
  { id: 'ORD002', outlet: bostonOutlets[6], brand: 'Fresh', window: { start: '09:24', end: '09:33' }, scheduledAt: '9:24 AM', serviceStart: '9:29 AM', serviceEnd: '9:33 AM', delayMinutes: 5, actualDuration: '4 min', priority: 'Medium', proofOfDelivery: { hasPhoto: true, hasSignature: true, hasNote: true }, volume: 3.4, weight: 620, temp: 'Chilled', routeId: 'RT-001', stopSequence: 7, status: 'Delivered', riskScore: 11, district: 'Cambridge' },
  { id: 'ORD105', outlet: bostonOutlets[7], brand: 'Style', window: { start: '09:30', end: '09:37' }, scheduledAt: '9:30 AM', serviceStart: '9:34 AM', serviceEnd: '9:37 AM', delayMinutes: 4, actualDuration: '3 min', priority: 'Medium', proofOfDelivery: { hasPhoto: true, hasSignature: true, hasNote: true }, volume: 1.5, weight: 210, temp: 'Ambient', routeId: 'RT-001', stopSequence: 8, status: 'Delivered', riskScore: 9, district: 'Somerville' },
  { id: 'ORD112', outlet: bostonOutlets[8], brand: 'Fresh', window: { start: '10:14', end: '10:22' }, scheduledAt: '10:14 AM', serviceStart: '10:14 AM', serviceEnd: '10:22 AM', actualDuration: '9 min', priority: 'Medium', proofOfDelivery: { hasPhoto: false, hasSignature: false, hasNote: false }, volume: 2.1, weight: 388, temp: 'Ambient', routeId: 'RT-001', stopSequence: 9, status: 'Loading', riskScore: 24, district: 'Somerville' },
  { id: 'ORD010', outlet: bostonOutlets[9], brand: 'Fresh', window: { start: '10:27', end: '10:32' }, scheduledAt: '10:27 AM', serviceStart: '10:27 AM', serviceEnd: '10:32 AM', actualDuration: '5 min', priority: 'High', proofOfDelivery: { hasPhoto: false, hasSignature: false, hasNote: false }, volume: 2.9, weight: 530, temp: 'Chilled', routeId: 'RT-001', stopSequence: 10, status: 'Planned', riskScore: 31, district: 'Somerville' },
  { id: 'ORD018', outlet: bostonOutlets[10], brand: 'Style', window: { start: '10:36', end: '10:43' }, scheduledAt: '10:36 AM', serviceStart: '10:36 AM', serviceEnd: '10:43 AM', actualDuration: '7 min', priority: 'Low', proofOfDelivery: { hasPhoto: false, hasSignature: false, hasNote: false }, volume: 1.1, weight: 162, temp: 'Ambient', routeId: 'RT-001', stopSequence: 11, status: 'Planned', riskScore: 19, district: 'Somerville' },
  { id: 'ORD019', outlet: bostonOutlets[11], brand: 'Fresh', window: { start: '10:45', end: '11:00' }, scheduledAt: '10:45 AM', serviceStart: '10:45 AM', serviceEnd: '11:00 AM', actualDuration: '15 min', priority: 'Medium', proofOfDelivery: { hasPhoto: false, hasSignature: false, hasNote: false }, volume: 2.5, weight: 410, temp: 'Ambient', routeId: 'RT-001', stopSequence: 12, status: 'Planned', riskScore: 14, district: 'Cambridge' },
  { id: 'ORD020', outlet: bostonOutlets[8], brand: 'Fresh', window: { start: '08:30', end: '08:50' }, scheduledAt: '8:30 AM', serviceStart: '8:32 AM', delayMinutes: 2, actualDuration: '8 min', priority: 'High', proofOfDelivery: { hasPhoto: true, hasSignature: true, hasNote: false }, volume: 3.2, weight: 540, temp: 'Chilled', routeId: 'RT-002', stopSequence: 14, status: 'Delivered', riskScore: 22, district: 'Somerville' },
  { id: 'ORD021', outlet: bostonOutlets[9], brand: 'Style', window: { start: '09:00', end: '09:20' }, scheduledAt: '9:00 AM', serviceStart: '9:02 AM', delayMinutes: 2, actualDuration: '6 min', priority: 'Medium', proofOfDelivery: { hasPhoto: true, hasSignature: false, hasNote: false }, volume: 1.8, weight: 260, temp: 'Ambient', routeId: 'RT-002', stopSequence: 17, status: 'Delivered', riskScore: 18, district: 'Somerville' },
  { id: 'ORD022', outlet: bostonOutlets[14], brand: 'Tech', window: { start: '09:15', end: '09:45' }, scheduledAt: '9:15 AM', serviceStart: '9:15 AM', actualDuration: '12 min', priority: 'Medium', proofOfDelivery: { hasPhoto: false, hasSignature: false, hasNote: false }, volume: 2.1, weight: 310, temp: 'Ambient', routeId: 'RT-003', stopSequence: 1, status: 'En Route', riskScore: 15, district: 'Cambridge' },
  { id: 'ORD023', outlet: bostonOutlets[12], brand: 'Fresh', window: { start: '09:30', end: '10:00' }, scheduledAt: '9:30 AM', serviceStart: '9:35 AM', delayMinutes: 5, actualDuration: '10 min', priority: 'High', proofOfDelivery: { hasPhoto: true, hasSignature: true, hasNote: true }, volume: 4.1, weight: 680, temp: 'Chilled', routeId: 'RT-004', stopSequence: 19, status: 'Delivered', riskScore: 35, district: 'Allston' },
  { id: 'ORD024', outlet: bostonOutlets[13], brand: 'Style', window: { start: '10:05', end: '10:30' }, scheduledAt: '10:05 AM', serviceStart: '10:10 AM', delayMinutes: 5, actualDuration: '8 min', priority: 'Medium', proofOfDelivery: { hasPhoto: false, hasSignature: false, hasNote: false }, volume: 1.9, weight: 290, temp: 'Ambient', routeId: 'RT-004', stopSequence: 20, status: 'Loading', riskScore: 28, district: 'Boston' },
  { id: 'ORD025', outlet: bostonOutlets[15], brand: 'Fresh', window: { start: '10:15', end: '10:45' }, scheduledAt: '10:15 AM', serviceStart: '10:15 AM', actualDuration: '11 min', priority: 'Medium', proofOfDelivery: { hasPhoto: false, hasSignature: false, hasNote: false }, volume: 2.3, weight: 390, temp: 'Chilled', routeId: 'RT-005', stopSequence: 21, status: 'Loading', riskScore: 19, district: 'Boston' },
  { id: 'ORD026', outlet: bostonOutlets[16], brand: 'Tech', window: { start: '10:50', end: '11:15' }, scheduledAt: '10:50 AM', priority: 'Low', proofOfDelivery: { hasPhoto: false, hasSignature: false, hasNote: false }, volume: 1.1, weight: 140, temp: 'Ambient', routeId: 'RT-005', stopSequence: 23, status: 'Planned', riskScore: 12, district: 'Boston' },
  { id: 'ORD027', outlet: bostonOutlets[17], brand: 'Fresh', window: { start: '10:30', end: '11:00' }, scheduledAt: '10:30 AM', serviceStart: '10:32 AM', delayMinutes: 2, actualDuration: '14 min', priority: 'High', proofOfDelivery: { hasPhoto: true, hasSignature: false, hasNote: true }, volume: 3.5, weight: 580, temp: 'Chilled', routeId: 'RT-006', stopSequence: 24, status: 'Delivered', riskScore: 30, district: 'Boston' },
  { id: 'ORD029', outlet: bostonOutlets[18], brand: 'Fresh', window: { start: '11:05', end: '11:35' }, scheduledAt: '11:05 AM', priority: 'High', proofOfDelivery: { hasPhoto: false, hasSignature: false, hasNote: false }, volume: 4.0, weight: 720, temp: 'Ambient', routeId: 'RT-006', stopSequence: 30, status: 'Planned', riskScore: 42, district: 'Boston' },
  { id: 'ORD030F', outlet: bostonOutlets[19], brand: 'Style', window: { start: '11:45', end: '12:15' }, scheduledAt: '11:45 AM', priority: 'Medium', proofOfDelivery: { hasPhoto: false, hasSignature: false, hasNote: false }, volume: 1.4, weight: 190, temp: 'Ambient', routeId: 'RT-006', stopSequence: 31, status: 'Failed', riskScore: 95, district: 'Boston' },
];

// ─── Real Routes ──────────────────────────────────────────────────────────────
export const peliyagodaRoutes: Route[] = [
  {
    id: 'RT-PEL-01', name: 'Kamal Perera', color: '#2563EB', status: 'Active',
    vehicle: peliyagodaVehicles[0], driver: peliyagodaDrivers[0],
    depotId: 'DEP-PEL', usedVolume: 12.8, usedWeight: 2650,
    startTime: '05:00', estimatedFinish: '11:30', firstEta: '05:15',
    stops: peliyagodaOrders.slice(0, 11).map((o, i) => ({
      order: o, sequence: i + 1, eta: o.scheduledAt || '06:00', status: o.status
    })),
    geometry: [
      peliyagodaDepots[0].location,
      ...peliyagodaOrders.slice(0, 11).map(o => o.outlet.location)
    ]
  },
  {
    id: 'RT-PEL-02', name: 'Nimal Silva', color: '#10B981', status: 'Active',
    vehicle: peliyagodaVehicles[1], driver: peliyagodaDrivers[1],
    depotId: 'DEP-PEL', usedVolume: 10.2, usedWeight: 1980,
    startTime: '05:30', estimatedFinish: '12:00', firstEta: '05:45',
    stops: peliyagodaOrders.slice(11, 13).map((o, i) => ({
      order: o, sequence: 14 + i, eta: o.scheduledAt || '06:30', status: o.status
    })),
    geometry: [
      peliyagodaDepots[0].location,
      ...peliyagodaOrders.slice(11, 13).map(o => o.outlet.location)
    ]
  },
  {
    id: 'RT-PEL-03', name: 'Sunil Fernando', color: '#10B981', status: 'Active',
    vehicle: peliyagodaVehicles[2], driver: peliyagodaDrivers[2],
    depotId: 'DEP-PEL', usedVolume: 5.4, usedWeight: 920,
    startTime: '06:00', estimatedFinish: '11:00', firstEta: '06:20',
    stops: peliyagodaOrders.slice(13, 14).map((o) => ({
      order: o, sequence: 1, eta: o.scheduledAt || '06:20', status: o.status
    })),
    geometry: [
      peliyagodaDepots[0].location,
      ...peliyagodaOrders.slice(13, 14).map(o => o.outlet.location)
    ]
  },
  {
    id: 'RT-PEL-04', name: 'Roshan Jayasuriya', color: '#3B82F6', status: 'Active',
    vehicle: peliyagodaVehicles[3], driver: peliyagodaDrivers[3],
    depotId: 'DEP-PEL', usedVolume: 14.5, usedWeight: 2840,
    startTime: '05:00', estimatedFinish: '12:30', firstEta: '05:30',
    stops: peliyagodaOrders.slice(14, 16).map((o, i) => ({
      order: o, sequence: 19 + i, eta: o.scheduledAt || '06:00', status: o.status
    })),
    geometry: [
      peliyagodaDepots[0].location,
      ...peliyagodaOrders.slice(14, 16).map(o => o.outlet.location)
    ]
  },
  {
    id: 'RT-PEL-05', name: 'Dinesh Chandimal', color: '#F59E0B', status: 'Active',
    vehicle: peliyagodaVehicles[4], driver: peliyagodaDrivers[4],
    depotId: 'DEP-PEL', usedVolume: 8.6, usedWeight: 1450,
    startTime: '06:30', estimatedFinish: '13:00', firstEta: '06:50',
    stops: peliyagodaOrders.slice(16, 18).map((o, i) => ({
      order: o, sequence: 21 + i, eta: o.scheduledAt || '07:00', status: o.status
    })),
    geometry: [
      peliyagodaDepots[0].location,
      ...peliyagodaOrders.slice(16, 18).map(o => o.outlet.location)
    ]
  },
  {
    id: 'RT-PEL-06', name: 'Mahela Bandara', color: '#EA580C', status: 'Active',
    vehicle: peliyagodaVehicles[5], driver: peliyagodaDrivers[5],
    depotId: 'DEP-PEL', usedVolume: 16.2, usedWeight: 3100,
    startTime: '05:30', estimatedFinish: '13:45', firstEta: '05:55',
    stops: peliyagodaOrders.slice(18, 21).map((o, i) => ({
      order: o, sequence: 24 + i, eta: o.scheduledAt || '06:40', status: o.status
    })),
    geometry: [
      peliyagodaDepots[0].location,
      ...peliyagodaOrders.slice(18, 21).map(o => o.outlet.location)
    ]
  },
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
    ]
  },
  {
    id: 'RT-002', name: 'Amy Miller', color: '#10B981', status: 'Active',
    vehicle: bostonVehicles[1], driver: bostonDrivers[1],
    depotId: 'DEP-BOS', usedVolume: 6.8, usedWeight: 1120,
    startTime: '08:15', estimatedFinish: '13:00', firstEta: '08:32',
    stops: [
      { order: bostonOrders[12], sequence: 14, eta: '08:32', status: 'Delivered' },
      { order: bostonOrders[13], sequence: 17, eta: '09:02', status: 'Delivered' },
    ],
    geometry: [
      bostonDepots[0].location,
      bostonOrders[12].outlet.location,
      bostonOrders[13].outlet.location,
    ]
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
    ]
  },
  {
    id: 'RT-004', name: 'John Barry', color: '#3B82F6', status: 'Active',
    vehicle: bostonVehicles[3], driver: bostonDrivers[3],
    depotId: 'DEP-BOS', usedVolume: 8.5, usedWeight: 1420,
    startTime: '08:00', estimatedFinish: '13:30', firstEta: '09:35',
    stops: [
      { order: bostonOrders[15], sequence: 19, eta: '09:35', status: 'Delivered' },
      { order: bostonOrders[16], sequence: 20, eta: '10:10', status: 'Arrived' },
    ],
    geometry: [
      bostonDepots[0].location,
      bostonOrders[15].outlet.location,
      bostonOrders[16].outlet.location,
    ]
  },
  {
    id: 'RT-005', name: 'Mike Wilson', color: '#F59E0B', status: 'Active',
    vehicle: bostonVehicles[4], driver: bostonDrivers[4],
    depotId: 'DEP-BOS', usedVolume: 5.6, usedWeight: 930,
    startTime: '08:30', estimatedFinish: '13:00', firstEta: '10:15',
    stops: [
      { order: bostonOrders[17], sequence: 21, eta: '10:15', status: 'Arrived' },
      { order: bostonOrders[18], sequence: 23, eta: '10:50', status: 'Planned' },
    ],
    geometry: [
      bostonDepots[0].location,
      bostonOrders[17].outlet.location,
      bostonOrders[18].outlet.location,
    ]
  },
  {
    id: 'RT-006', name: 'Robert Miller', color: '#EA580C', status: 'Active',
    vehicle: bostonVehicles[5], driver: bostonDrivers[5],
    depotId: 'DEP-BOS', usedVolume: 11.2, usedWeight: 1980,
    startTime: '08:15', estimatedFinish: '13:45', firstEta: '10:32',
    stops: [
      { order: bostonOrders[19], sequence: 24, eta: '10:32', status: 'Delivered' },
      { order: bostonOrders[20], sequence: 30, eta: '11:05', status: 'Planned' },
      { order: bostonOrders[21], sequence: 31, eta: '11:45', status: 'At Risk' },
    ],
    geometry: [
      bostonDepots[0].location,
      bostonOrders[19].outlet.location,
      bostonOrders[20].outlet.location,
      bostonOrders[21].outlet.location,
    ]
  },
];
