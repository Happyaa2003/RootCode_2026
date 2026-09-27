import type {
  Order, Route, Vehicle, Driver, Outlet, Exception, Depot,
  KpiSummary, AIRecommendation, ForecastWeek
} from '../types';

// ─── Depots ───────────────────────────────────────────────────────────────────
export const depots: Depot[] = [
  { id: 'DEP-001', name: 'Boston Metro Hub', location: { lat: 42.3785, lng: -71.0720 }, address: 'Charlestown / Inner Belt, Boston, MA' },
  { id: 'DEP-002', name: 'Cambridge West Hub', location: { lat: 42.3910, lng: -71.1350 }, address: 'Alewife Brook Pkwy, Cambridge, MA' },
];

// ─── Drivers ──────────────────────────────────────────────────────────────────
export const drivers: Driver[] = [
  { id: 'DRV-001', name: 'Ian Johnson', initials: 'IJ', phone: '+1 617 555 0101', licenseClass: 'C' },
  { id: 'DRV-002', name: 'Amy Miller', initials: 'AM', phone: '+1 617 555 0102', licenseClass: 'C' },
  { id: 'DRV-003', name: 'Dave Smith', initials: 'DS', phone: '+1 617 555 0103', licenseClass: 'B' },
  { id: 'DRV-004', name: 'John Barry', initials: 'JB', phone: '+1 617 555 0104', licenseClass: 'C' },
  { id: 'DRV-005', name: 'Mike Wilson', initials: 'MW', phone: '+1 617 555 0105', licenseClass: 'C' },
  { id: 'DRV-006', name: 'Robert Miller', initials: 'RM', phone: '+1 617 555 0106', licenseClass: 'C' },
  { id: 'DRV-007', name: 'Sarah Parker', initials: 'SP', phone: '+1 617 555 0107', licenseClass: 'B' },
  { id: 'DRV-008', name: 'Kevin Brown', initials: 'KB', phone: '+1 617 555 0108', licenseClass: 'C' },
];

// ─── Vehicles ─────────────────────────────────────────────────────────────────
export const vehicles: Vehicle[] = [
  { id: 'VEH-001', plate: 'MA-DISP-01', type: 'Reefer', capacityVolume: 12.4, capacityWeight: 2200, hasRefrigeration: true, status: 'Active', driver: drivers[0], location: { lat: 42.3812, lng: -71.1070 }, heading: 45 },
  { id: 'VEH-002', plate: 'MA-DISP-02', type: 'Standard', capacityVolume: 8.2, capacityWeight: 1500, hasRefrigeration: false, status: 'Active', driver: drivers[1], location: { lat: 42.3920, lng: -71.0950 }, heading: 120 },
  { id: 'VEH-003', plate: 'MA-DISP-03', type: 'Large', capacityVolume: 18.6, capacityWeight: 3500, hasRefrigeration: false, status: 'Active', driver: drivers[2], location: { lat: 42.3665, lng: -71.0910 }, heading: 210 },
  { id: 'VEH-004', plate: 'MA-DISP-04', type: 'Reefer', capacityVolume: 11.0, capacityWeight: 2000, hasRefrigeration: true, status: 'Active', driver: drivers[3], location: { lat: 42.3550, lng: -71.1320 }, heading: 315 },
  { id: 'VEH-005', plate: 'MA-DISP-05', type: 'Standard', capacityVolume: 8.2, capacityWeight: 1500, hasRefrigeration: false, status: 'Active', driver: drivers[4], location: { lat: 42.3485, lng: -71.0825 }, heading: 90 },
  { id: 'VEH-006', plate: 'MA-DISP-06', type: 'Standard', capacityVolume: 8.2, capacityWeight: 1500, hasRefrigeration: false, status: 'Active', driver: drivers[5], location: { lat: 42.3585, lng: -71.0560 }, heading: 180 },
  { id: 'VEH-007', plate: 'MA-DISP-07', type: 'Large', capacityVolume: 18.6, capacityWeight: 3500, hasRefrigeration: false, status: 'Active', driver: drivers[6], location: { lat: 42.3745, lng: -71.0550 }, heading: 180 },
  { id: 'VEH-008', plate: 'MA-DISP-08', type: 'Reefer', capacityVolume: 12.4, capacityWeight: 2200, hasRefrigeration: true, status: 'Offline', driver: drivers[7] },
];

// ─── Outlets (Exact matching OptimoRoute screenshot) ──────────────────────────
const outlets: Outlet[] = [
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

// ─── Orders (Exact matching OptimoRoute screenshot) ──────────────────────────
export const orders: Order[] = [
  { id: 'ORD028', outlet: outlets[0], brand: 'Fresh', window: { start: '08:28', end: '08:38' }, scheduledAt: '8:28 AM', serviceStart: '8:28 AM', serviceEnd: '8:38 AM', actualDuration: '10 min', priority: 'Medium', proofOfDelivery: { hasPhoto: true, hasSignature: true, hasNote: true }, volume: 2.4, weight: 438, temp: 'Chilled', routeId: 'RT-001', stopSequence: 1, status: 'Delivered', riskScore: 5, district: 'Somerville' },
  { id: 'ORD009', outlet: outlets[1], brand: 'Fresh', window: { start: '08:43', end: '08:58' }, scheduledAt: '8:43 AM', serviceStart: '8:56 AM', serviceEnd: '8:58 AM', delayMinutes: 4, actualDuration: '9 min', priority: 'Medium', proofOfDelivery: { hasPhoto: true, hasSignature: true, hasNote: true }, volume: 1.8, weight: 312, temp: 'Chilled', routeId: 'RT-001', stopSequence: 2, status: 'Delivered', riskScore: 8, district: 'Cambridge' },
  { id: 'ORD012', outlet: outlets[2], brand: 'Fresh', window: { start: '08:54', end: '09:06' }, scheduledAt: '8:54 AM', serviceStart: '8:58 AM', serviceEnd: '9:06 AM', delayMinutes: 4, actualDuration: '7 min', priority: 'Medium', proofOfDelivery: { hasPhoto: true, hasSignature: true, hasNote: true }, volume: 3.1, weight: 560, temp: 'Ambient', routeId: 'RT-001', stopSequence: 3, status: 'Delivered', riskScore: 12, district: 'Cambridge' },
  { id: 'ORD064', outlet: outlets[3], brand: 'Style', window: { start: '09:11', end: '09:19' }, scheduledAt: '9:11 AM', serviceStart: '9:16 AM', serviceEnd: '9:19 AM', delayMinutes: 5, actualDuration: '3 min', priority: 'Medium', proofOfDelivery: { hasPhoto: true, hasSignature: true, hasNote: true }, volume: 1.2, weight: 180, temp: 'Ambient', routeId: 'RT-001', stopSequence: 4, status: 'Delivered', riskScore: 10, district: 'Cambridge' },
  { id: 'ORD053', outlet: outlets[4], brand: 'Fresh', window: { start: '09:14', end: '09:22' }, scheduledAt: '9:14 AM', serviceStart: '9:19 AM', serviceEnd: '9:22 AM', delayMinutes: 5, actualDuration: '6 min', priority: 'Medium', proofOfDelivery: { hasPhoto: true, hasSignature: true, hasNote: true }, volume: 2.8, weight: 510, temp: 'Chilled', routeId: 'RT-001', stopSequence: 5, status: 'Delivered', riskScore: 15, district: 'Cambridge' },
  { id: 'ORD001', outlet: outlets[5], brand: 'Tech', window: { start: '09:18', end: '09:26' }, scheduledAt: '9:18 AM', serviceStart: '9:22 AM', serviceEnd: '9:26 AM', delayMinutes: 4, actualDuration: '4 min', priority: 'Medium', proofOfDelivery: { hasPhoto: true, hasSignature: true, hasNote: true }, volume: 0.8, weight: 95, temp: 'Ambient', routeId: 'RT-001', stopSequence: 6, status: 'Delivered', riskScore: 6, district: 'Cambridge' },
  { id: 'ORD002', outlet: outlets[6], brand: 'Fresh', window: { start: '09:24', end: '09:33' }, scheduledAt: '9:24 AM', serviceStart: '9:29 AM', serviceEnd: '9:33 AM', delayMinutes: 5, actualDuration: '4 min', priority: 'Medium', proofOfDelivery: { hasPhoto: true, hasSignature: true, hasNote: true }, volume: 3.4, weight: 620, temp: 'Chilled', routeId: 'RT-001', stopSequence: 7, status: 'Delivered', riskScore: 11, district: 'Cambridge' },
  { id: 'ORD105', outlet: outlets[7], brand: 'Style', window: { start: '09:30', end: '09:37' }, scheduledAt: '9:30 AM', serviceStart: '9:34 AM', serviceEnd: '9:37 AM', delayMinutes: 4, actualDuration: '3 min', priority: 'Medium', proofOfDelivery: { hasPhoto: true, hasSignature: true, hasNote: true }, volume: 1.5, weight: 210, temp: 'Ambient', routeId: 'RT-001', stopSequence: 8, status: 'Delivered', riskScore: 9, district: 'Somerville' },
  { id: 'ORD112', outlet: outlets[8], brand: 'Fresh', window: { start: '10:14', end: '10:22' }, scheduledAt: '10:14 AM', serviceStart: '10:14 AM', serviceEnd: '10:22 AM', actualDuration: '9 min', priority: 'Medium', proofOfDelivery: { hasPhoto: false, hasSignature: false, hasNote: false }, volume: 2.1, weight: 388, temp: 'Ambient', routeId: 'RT-001', stopSequence: 9, status: 'Loading', riskScore: 24, district: 'Somerville' },
  { id: 'ORD010', outlet: outlets[9], brand: 'Fresh', window: { start: '10:27', end: '10:32' }, scheduledAt: '10:27 AM', serviceStart: '10:27 AM', serviceEnd: '10:32 AM', actualDuration: '5 min', priority: 'High', proofOfDelivery: { hasPhoto: false, hasSignature: false, hasNote: false }, volume: 2.9, weight: 530, temp: 'Chilled', routeId: 'RT-001', stopSequence: 10, status: 'Planned', riskScore: 31, district: 'Somerville' },
  { id: 'ORD018', outlet: outlets[10], brand: 'Style', window: { start: '10:36', end: '10:43' }, scheduledAt: '10:36 AM', serviceStart: '10:36 AM', serviceEnd: '10:43 AM', actualDuration: '7 min', priority: 'Low', proofOfDelivery: { hasPhoto: false, hasSignature: false, hasNote: false }, volume: 1.1, weight: 162, temp: 'Ambient', routeId: 'RT-001', stopSequence: 11, status: 'Planned', riskScore: 19, district: 'Somerville' },
  { id: 'ORD019', outlet: outlets[11], brand: 'Fresh', window: { start: '10:45', end: '11:00' }, scheduledAt: '10:45 AM', serviceStart: '10:45 AM', serviceEnd: '11:00 AM', actualDuration: '15 min', priority: 'Medium', proofOfDelivery: { hasPhoto: false, hasSignature: false, hasNote: false }, volume: 2.5, weight: 410, temp: 'Ambient', routeId: 'RT-001', stopSequence: 12, status: 'Planned', riskScore: 14, district: 'Cambridge' },
  // Route 02 (Amy Miller)
  { id: 'ORD020', outlet: outlets[8], brand: 'Fresh', window: { start: '08:30', end: '08:50' }, scheduledAt: '8:30 AM', serviceStart: '8:32 AM', delayMinutes: 2, actualDuration: '8 min', priority: 'High', proofOfDelivery: { hasPhoto: true, hasSignature: true, hasNote: false }, volume: 3.2, weight: 540, temp: 'Chilled', routeId: 'RT-002', stopSequence: 14, status: 'Delivered', riskScore: 22, district: 'Somerville' },
  { id: 'ORD021', outlet: outlets[9], brand: 'Style', window: { start: '09:00', end: '09:20' }, scheduledAt: '9:00 AM', serviceStart: '9:02 AM', delayMinutes: 2, actualDuration: '6 min', priority: 'Medium', proofOfDelivery: { hasPhoto: true, hasSignature: false, hasNote: false }, volume: 1.8, weight: 260, temp: 'Ambient', routeId: 'RT-002', stopSequence: 17, status: 'Delivered', riskScore: 18, district: 'Somerville' },
  // Route 03 (Dave Smith)
  { id: 'ORD022', outlet: outlets[14], brand: 'Tech', window: { start: '09:15', end: '09:45' }, scheduledAt: '9:15 AM', serviceStart: '9:15 AM', actualDuration: '12 min', priority: 'Medium', proofOfDelivery: { hasPhoto: false, hasSignature: false, hasNote: false }, volume: 2.1, weight: 310, temp: 'Ambient', routeId: 'RT-003', stopSequence: 1, status: 'En Route', riskScore: 15, district: 'Cambridge' },
  // Route 04 (John Barry)
  { id: 'ORD023', outlet: outlets[12], brand: 'Fresh', window: { start: '09:30', end: '10:00' }, scheduledAt: '9:30 AM', serviceStart: '9:35 AM', delayMinutes: 5, actualDuration: '10 min', priority: 'High', proofOfDelivery: { hasPhoto: true, hasSignature: true, hasNote: true }, volume: 4.1, weight: 680, temp: 'Chilled', routeId: 'RT-004', stopSequence: 19, status: 'Delivered', riskScore: 35, district: 'Allston' },
  { id: 'ORD024', outlet: outlets[13], brand: 'Style', window: { start: '10:05', end: '10:30' }, scheduledAt: '10:05 AM', serviceStart: '10:10 AM', delayMinutes: 5, actualDuration: '8 min', priority: 'Medium', proofOfDelivery: { hasPhoto: false, hasSignature: false, hasNote: false }, volume: 1.9, weight: 290, temp: 'Ambient', routeId: 'RT-004', stopSequence: 20, status: 'Loading', riskScore: 28, district: 'Boston' },
  // Route 05 (Mike Wilson)
  { id: 'ORD025', outlet: outlets[15], brand: 'Fresh', window: { start: '10:15', end: '10:45' }, scheduledAt: '10:15 AM', serviceStart: '10:15 AM', actualDuration: '11 min', priority: 'Medium', proofOfDelivery: { hasPhoto: false, hasSignature: false, hasNote: false }, volume: 2.3, weight: 390, temp: 'Chilled', routeId: 'RT-005', stopSequence: 21, status: 'Loading', riskScore: 19, district: 'Boston' },
  { id: 'ORD026', outlet: outlets[16], brand: 'Tech', window: { start: '10:50', end: '11:15' }, scheduledAt: '10:50 AM', priority: 'Low', proofOfDelivery: { hasPhoto: false, hasSignature: false, hasNote: false }, volume: 1.1, weight: 140, temp: 'Ambient', routeId: 'RT-005', stopSequence: 23, status: 'Planned', riskScore: 12, district: 'Boston' },
  // Route 06 (Robert Miller)
  { id: 'ORD027', outlet: outlets[17], brand: 'Fresh', window: { start: '10:30', end: '11:00' }, scheduledAt: '10:30 AM', serviceStart: '10:32 AM', delayMinutes: 2, actualDuration: '14 min', priority: 'High', proofOfDelivery: { hasPhoto: true, hasSignature: false, hasNote: true }, volume: 3.5, weight: 580, temp: 'Chilled', routeId: 'RT-006', stopSequence: 24, status: 'Delivered', riskScore: 30, district: 'Boston' },
  { id: 'ORD029', outlet: outlets[18], brand: 'Fresh', window: { start: '11:05', end: '11:35' }, scheduledAt: '11:05 AM', priority: 'High', proofOfDelivery: { hasPhoto: false, hasSignature: false, hasNote: false }, volume: 4.0, weight: 720, temp: 'Ambient', routeId: 'RT-006', stopSequence: 30, status: 'Planned', riskScore: 42, district: 'Boston' },
  // Failed Order
  { id: 'ORD030F', outlet: outlets[19], brand: 'Style', window: { start: '11:45', end: '12:15' }, scheduledAt: '11:45 AM', priority: 'Medium', proofOfDelivery: { hasPhoto: false, hasSignature: false, hasNote: false }, volume: 1.4, weight: 190, temp: 'Ambient', routeId: 'RT-006', stopSequence: 31, status: 'Failed', riskScore: 95, district: 'Boston' },
];

// ─── Routes (Exact matching OptimoRoute screenshot) ──────────────────────────
export const routes: Route[] = [
  {
    id: 'RT-001', name: 'Ian Johnson', color: '#2563EB', status: 'Active',
    vehicle: vehicles[0], driver: drivers[0],
    depotId: 'DEP-001', usedVolume: 10.4, usedWeight: 1890,
    startTime: '08:00', estimatedFinish: '12:30', firstEta: '08:28',
    stops: [
      { order: orders[0], sequence: 1, eta: '08:28', status: 'Delivered' },
      { order: orders[1], sequence: 2, eta: '08:56', status: 'Delivered' },
      { order: orders[2], sequence: 3, eta: '08:58', status: 'Delivered' },
      { order: orders[3], sequence: 4, eta: '09:16', status: 'Delivered' },
      { order: orders[4], sequence: 5, eta: '09:19', status: 'Delivered' },
      { order: orders[5], sequence: 6, eta: '09:22', status: 'Delivered' },
      { order: orders[6], sequence: 7, eta: '09:29', status: 'Delivered' },
      { order: orders[7], sequence: 8, eta: '09:34', status: 'Delivered' },
      { order: orders[8], sequence: 9, eta: '10:14', status: 'Arrived' },
      { order: orders[9], sequence: 10, eta: '10:27', status: 'Planned' },
      { order: orders[10], sequence: 11, eta: '10:36', status: 'Planned' },
    ],
    geometry: [
      { lat: 42.3785, lng: -71.0720 },
      { lat: 42.3812, lng: -71.1070 },
      { lat: 42.3745, lng: -71.0980 },
      { lat: 42.3738, lng: -71.0995 },
      { lat: 42.3712, lng: -71.0945 },
      { lat: 42.3665, lng: -71.0910 },
      { lat: 42.3645, lng: -71.1018 },
      { lat: 42.3876, lng: -71.0995 },
      { lat: 42.3920, lng: -71.0950 },
      { lat: 42.3995, lng: -71.1120 },
      { lat: 42.3820, lng: -71.1150 },
    ]
  },
  {
    id: 'RT-002', name: 'Amy Miller', color: '#10B981', status: 'Active',
    vehicle: vehicles[1], driver: drivers[1],
    depotId: 'DEP-001', usedVolume: 6.8, usedWeight: 1120,
    startTime: '08:15', estimatedFinish: '13:00', firstEta: '08:32',
    stops: [
      { order: orders[12], sequence: 14, eta: '08:32', status: 'Delivered' },
      { order: orders[13], sequence: 17, eta: '09:02', status: 'Delivered' },
    ],
    geometry: [
      { lat: 42.3785, lng: -71.0720 },
      { lat: 42.3920, lng: -71.0950 },
      { lat: 42.3995, lng: -71.1120 },
    ]
  },
  {
    id: 'RT-003', name: 'Dave Smith', color: '#10B981', status: 'Active',
    vehicle: vehicles[2], driver: drivers[2],
    depotId: 'DEP-001', usedVolume: 4.2, usedWeight: 780,
    startTime: '08:30', estimatedFinish: '12:00', firstEta: '09:15',
    stops: [
      { order: orders[14], sequence: 1, eta: '09:15', status: 'En Route' },
    ],
    geometry: [
      { lat: 42.3785, lng: -71.0720 },
      { lat: 42.3615, lng: -71.0905 },
    ]
  },
  {
    id: 'RT-004', name: 'John Barry', color: '#3B82F6', status: 'Active',
    vehicle: vehicles[3], driver: drivers[3],
    depotId: 'DEP-001', usedVolume: 8.5, usedWeight: 1420,
    startTime: '08:00', estimatedFinish: '13:30', firstEta: '09:35',
    stops: [
      { order: orders[15], sequence: 19, eta: '09:35', status: 'Delivered' },
      { order: orders[16], sequence: 20, eta: '10:10', status: 'Arrived' },
    ],
    geometry: [
      { lat: 42.3785, lng: -71.0720 },
      { lat: 42.3530, lng: -71.1330 },
      { lat: 42.3505, lng: -71.1054 },
    ]
  },
  {
    id: 'RT-005', name: 'Mike Wilson', color: '#F59E0B', status: 'Active',
    vehicle: vehicles[4], driver: drivers[4],
    depotId: 'DEP-001', usedVolume: 5.6, usedWeight: 930,
    startTime: '08:30', estimatedFinish: '13:00', firstEta: '10:15',
    stops: [
      { order: orders[17], sequence: 21, eta: '10:15', status: 'Arrived' },
      { order: orders[18], sequence: 23, eta: '10:50', status: 'Planned' },
    ],
    geometry: [
      { lat: 42.3785, lng: -71.0720 },
      { lat: 42.3440, lng: -71.1010 },
      { lat: 42.3475, lng: -71.0755 },
    ]
  },
  {
    id: 'RT-006', name: 'Robert Miller', color: '#EA580C', status: 'Active',
    vehicle: vehicles[5], driver: drivers[5],
    depotId: 'DEP-001', usedVolume: 11.2, usedWeight: 1980,
    startTime: '08:15', estimatedFinish: '13:45', firstEta: '10:32',
    stops: [
      { order: orders[19], sequence: 24, eta: '10:32', status: 'Delivered' },
      { order: orders[20], sequence: 30, eta: '11:05', status: 'Planned' },
      { order: orders[21], sequence: 31, eta: '11:45', status: 'At Risk' },
    ],
    geometry: [
      { lat: 42.3785, lng: -71.0720 },
      { lat: 42.3485, lng: -71.0825 },
      { lat: 42.3585, lng: -71.0560 },
      { lat: 42.3745, lng: -71.0550 },
    ]
  },
];

// ─── Exceptions ───────────────────────────────────────────────────────────────
export const exceptions: Exception[] = [
  {
    id: 'EXC-001', severity: 'High', timestamp: '08:14', entityType: 'Route', entityId: 'RT-007',
    entityName: 'Route 07', problem: 'Vehicle capacity exceeds recommended limit',
    detail: 'Volume: 13.2 / 12.4 m³', impact: '3 stops at risk of delay',
    resolved: false, actions: ['Reassign stops', 'View route'],
  },
  {
    id: 'EXC-002', severity: 'Critical', timestamp: '07:58', entityType: 'Order', entityId: 'WD-1039',
    entityName: 'WD-1039', problem: 'Delivery window closes before vehicle arrives',
    detail: 'Window: 08:00–10:00, ETA: 10:34', impact: 'Order will miss window',
    resolved: false, actions: ['Reassign order', 'Contact outlet'],
  },
  {
    id: 'EXC-003', severity: 'Medium', timestamp: '08:22', entityType: 'Vehicle', entityId: 'VEH-008',
    entityName: 'WP-REEF-007', problem: 'Vehicle offline — GPS signal lost',
    detail: 'Last seen: 08:14 near Peliyagoda depot', impact: '2 stops unconfirmed',
    resolved: false, actions: ['Contact driver', 'Reassign stops'],
  },
  {
    id: 'EXC-004', severity: 'Medium', timestamp: '08:30', entityType: 'Order', entityId: 'WD-1041',
    entityName: 'WD-1041', problem: 'Chilled order unassigned — window at risk',
    detail: 'Window: 08:30–10:30, currently unassigned', impact: 'Will miss window in 42 min',
    resolved: false, actions: ['Assign to route', 'Defer order'],
  },
  {
    id: 'EXC-005', severity: 'Low', timestamp: '08:35', entityType: 'Driver', entityId: 'DRV-006',
    entityName: 'Asanka Bandara', problem: 'Driver reported vehicle issue',
    detail: 'Minor mechanical issue, vehicle WP-STD-044', impact: 'Possible 30 min delay',
    resolved: false, actions: ['Reassign vehicle', 'Contact driver'],
  },
];

// ─── KPI Summary ──────────────────────────────────────────────────────────────
export const kpiSummary: KpiSummary = {
  totalOrders: 248,
  planned: 221,
  unassigned: 14,
  atRisk: 13,
  activeVehicles: 42,
  onSchedule: 31,
  completed: 4,
  offline: 2,
};

// ─── AI Recommendations ───────────────────────────────────────────────────────
export const aiRecommendations: AIRecommendation[] = [
  {
    id: 'AI-001', orderId: 'WD-1124', orderName: 'WD-1124',
    fromRouteId: 'RT-007', fromRouteName: 'Route 07',
    toRouteId: 'RT-004', toRouteName: 'Route 04 (Nimal)',  // note: Route 09 in spec but we use RT-004
    reasons: [
      'Route 04 has 1.8 m³ available capacity',
      'Outlet delivery window closes at 11:00',
      'Vehicle WP-REEF-014 is reefer compatible',
    ],
    impact: { travelDelta: -11, atRiskDelta: -1 },
    confidence: 91,
  },
  {
    id: 'AI-002', orderId: 'WD-1041', orderName: 'WD-1041',
    fromRouteId: '', fromRouteName: 'Unassigned',
    toRouteId: 'RT-001', toRouteName: 'Route 01 (Nimal)',
    reasons: [
      'Route 01 passes Panadura on its southbound leg',
      'Window 08:30–10:30 aligns with route schedule',
      'WP-REEF-014 has refrigeration capability',
    ],
    impact: { travelDelta: -8, atRiskDelta: -1 },
    confidence: 84,
  },
];

// ─── Forecast Data ────────────────────────────────────────────────────────────
export const forecastData: ForecastWeek[] = [
  { week: 13, weekLabel: 'Wk 13', actual: 210, forecast: undefined, capacity: 260, isHighRisk: false },
  { week: 14, weekLabel: 'Wk 14', actual: 224, forecast: undefined, capacity: 260, isHighRisk: false },
  { week: 15, weekLabel: 'Wk 15', actual: 238, forecast: undefined, capacity: 260, isHighRisk: false },
  { week: 16, weekLabel: 'Wk 16', actual: 248, forecast: undefined, capacity: 260, isHighRisk: false },
  { week: 17, weekLabel: 'Wk 17', actual: undefined, forecast: 265, capacity: 260, isHighRisk: false },
  { week: 18, weekLabel: 'Wk 18', actual: undefined, forecast: 271, capacity: 260, isHighRisk: true },
  { week: 19, weekLabel: 'Wk 19', actual: undefined, forecast: 258, capacity: 260, isHighRisk: false },
  { week: 20, weekLabel: 'Wk 20', actual: undefined, forecast: 243, capacity: 260, isHighRisk: false },
  { week: 21, weekLabel: 'Wk 21', actual: undefined, forecast: 269, capacity: 260, isHighRisk: true },
  { week: 22, weekLabel: 'Wk 22', actual: undefined, forecast: 255, capacity: 260, isHighRisk: false },
];

// ─── Optimization Mock Result ─────────────────────────────────────────────────
export const optimizationResult = {
  before: { routes: 27, atRisk: 18, utilization: 71, distance: 842 },
  after: { routes: 24, atRisk: 7, utilization: 86, distance: 718 },
  changes: [
    { routeId: 'RT-004', routeName: 'Route 04', delta: 2, description: '+2 stops added' },
    { routeId: 'RT-007', routeName: 'Route 07', delta: -3, description: '−3 stops reassigned' },
    { routeId: 'RT-003', routeName: 'Route 03', delta: 1, description: '+1 chilled stop' },
    { routeId: 'RT-002', routeName: 'Route 02', delta: -1, description: '−1 stop merged' },
  ],
};
