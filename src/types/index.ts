// ─── Enums ────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'Unassigned'
  | 'Planned'
  | 'Loading'
  | 'Ready'
  | 'En Route'
  | 'Arrived'
  | 'Delivered'
  | 'Failed'
  | 'At Risk'
  | 'Deferred'
  | 'Offline';

export type VehicleStatus = 'Active' | 'Idle' | 'Offline' | 'Maintenance';
export type RouteStatus = 'Draft' | 'Planned' | 'Active' | 'Completed';
export type ExceptionSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
export type Brand = 'Fresh' | 'Style' | 'Tech' | 'Chilled';
export type TempRequirement = 'Ambient' | 'Chilled' | 'Frozen';

// ─── Core Entities ────────────────────────────────────────────────────────────

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Depot {
  id: string;
  name: string;
  location: Coordinates;
  address: string;
}

export interface Driver {
  id: string;
  name: string;
  initials: string;
  phone: string;
  licenseClass: string;
}

export interface Vehicle {
  id: string;
  plate: string;
  type: 'Standard' | 'Reefer' | 'Large';
  capacityVolume: number; // m³
  capacityWeight: number; // kg
  hasRefrigeration: boolean;
  status: VehicleStatus;
  driver?: Driver;
  location?: Coordinates;
  heading?: number; // degrees
  lastSeen?: string;
}

export interface Outlet {
  id: string;
  name: string;
  address: string;
  district: string;
  location: Coordinates;
  accessNotes?: string;
}

export interface Order {
  id: string;
  outlet: Outlet;
  brand: Brand;
  window: { start: string; end: string };
  volume: number; // m³
  weight: number; // kg
  temp: TempRequirement;
  routeId?: string;
  stopSequence?: number;
  status: OrderStatus;
  riskScore: number; // 0-100
  district: string;
  notes?: string;
  scheduledAt?: string;
  serviceStart?: string;
  serviceEnd?: string;
  delayMinutes?: number;
  actualDuration?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  proofOfDelivery?: { hasPhoto: boolean; hasSignature: boolean; hasNote: boolean };
}

export interface RouteStop {
  order: Order;
  sequence: number;
  eta: string;
  etd?: string;
  status: OrderStatus;
  actualArrival?: string;
}

export interface Route {
  id: string;
  name: string;
  vehicle?: Vehicle;
  driver?: Driver;
  stops: RouteStop[];
  status: RouteStatus;
  color: string;
  usedVolume: number;
  usedWeight: number;
  depotId: string;
  startTime?: string;
  estimatedFinish?: string;
  firstEta?: string;
  geometry?: Coordinates[];
}

export interface Exception {
  id: string;
  severity: ExceptionSeverity;
  timestamp: string;
  entityType: 'Route' | 'Vehicle' | 'Order' | 'Driver';
  entityId: string;
  entityName: string;
  problem: string;
  detail: string;
  impact: string;
  resolved: boolean;
  actions: string[];
}

export interface KpiSummary {
  totalOrders: number;
  planned: number;
  unassigned: number;
  atRisk: number;
  activeVehicles: number;
  onSchedule: number;
  completed: number;
  offline: number;
}

export interface OptimizationResult {
  before: {
    routes: number;
    atRisk: number;
    utilization: number;
    distance: number;
  };
  after: {
    routes: number;
    atRisk: number;
    utilization: number;
    distance: number;
  };
  changes: Array<{
    routeId: string;
    routeName: string;
    delta: number;
    description: string;
  }>;
}

export interface AIRecommendation {
  id: string;
  orderId: string;
  orderName: string;
  fromRouteId: string;
  fromRouteName: string;
  toRouteId: string;
  toRouteName: string;
  reasons: string[];
  impact: {
    travelDelta: number; // minutes, negative = saved
    atRiskDelta: number;
  };
  confidence: number; // 0-100
}

export interface ForecastWeek {
  week: number;
  weekLabel: string;
  actual?: number;
  forecast?: number;
  capacity: number;
  isHighRisk: boolean;
}
