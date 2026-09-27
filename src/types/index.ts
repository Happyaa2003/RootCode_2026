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
  fuelType?: 'diesel' | 'petrol';
  kmPerL?: number;
  weeklyFuelQuotaL?: number;
  fuelConsumedL?: number;
  depotId?: string;
}

export interface Outlet {
  id: string;
  name: string;
  address: string;
  district: string;
  location: Coordinates;
  accessNotes?: string;
  dockType?: 'street' | 'rear_dock' | 'mall_bay';
  parkingConstraint?: 'normal' | 'van_only' | 'mall_dock';
  mallWindow?: string;
  windowOpenTime?: string;
  windowCloseTime?: string;
}

export interface DeliveryCostBreakdown {
  fuelCost: number;
  laborCost: number;
  serviceCost: number;
  penaltyCost: number;
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
  units?: number;
  itemPrice?: number; // Total delivering item price / merchandise value ($ / LKR)
  deliveryCost?: number; // Total delivering operational cost
  costBreakdown?: DeliveryCostBreakdown;
  deliveryMargin?: number; // itemPrice - deliveryCost
  costRatio?: number; // (deliveryCost / itemPrice) * 100
  dockType?: 'street' | 'rear_dock' | 'mall_bay';
  parkingConstraint?: 'normal' | 'van_only' | 'mall_dock';
  serviceAllowanceMin?: number;
  scheduledAt?: string;
  serviceStart?: string;
  serviceEnd?: string;
  delayMinutes?: number;
  actualDuration?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  proofOfDelivery?: { hasPhoto: boolean; hasSignature: boolean; hasNote: boolean };
  estimatedTravelMin?: number;
  estimatedArrivalETA?: string;
  estimatedServiceMin?: number;
  estimatedCompletionETA?: string;
  onTimeProbability?: number; // e.g. 96 for 96%
}

export type CurrencyCode = 'USD' | 'LKR';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'Dispatcher' | 'Fleet Manager' | 'Planner' | 'Driver' | 'Admin';
  depot: string;
  initials: string;
}

export interface DeliveryTimeEstimationResult {
  origin: string;
  destinationOutlet: string;
  district: string;
  roadClass: string;
  distanceKm: number;
  baseTravelMin: number;
  trafficMultiplier: number;
  trafficDelayMin: number;
  monsoonWeatherDelayMin: number;
  estimatedTravelMin: number;
  dockAllowanceMin: number;
  totalServiceTurnaroundMin: number;
  totalEstimatedDeliveryMin: number;
  departureTime: string;
  estimatedArrivalETA: string;
  estimatedCompletionETA: string;
  onTimeProbability: number;
  timeWindowCompliance: boolean;
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
  totalCargoValue?: number; // Sum of item values
  totalRouteCost?: number; // Total delivery cost for the route
  fuelCost?: number;
  fuelConsumedL?: number;
  laborCost?: number;
  profitMargin?: number;
  totalDistanceKm?: number;
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
  totalItemValue?: number;
  totalDeliveryCost?: number;
  netDeliveryMargin?: number;
  avgCostPerDelivery?: number;
  costPercentage?: number;
  totalFuelConsumedL?: number;
  totalFuelQuotaL?: number;
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

export interface DistrictTravelInfo {
  district: string;
  depot: string;
  roadClass: string;
  freeFlowKmh: number;
  depotToDistrictKm: number;
  depotToDistrictFreeflowMin: number;
  interStopKm: number;
  interStopFreeflowMin: number;
}

export interface Task2aForecastItem {
  rowId: string;
  depot: string;
  brand: string;
  isoYear: number;
  isoWeek: number;
  predTotalVolumeM3?: number;
  predChilledVolumeM3?: number;
}

export interface PeakDayScenario {
  scenario: string;
  orderRef: string;
  outletId: string;
  brand: string;
  district: string;
  depot: string;
  dockType: string;
  parkingConstraint: string;
  mallWindow?: string;
  windowOpenTime: string;
  windowCloseTime: string;
  tempRequirement: string;
  orderUnits: number;
  orderWeightKg: number;
  orderVolumeM3: number;
  deferredYesterday: boolean;
  daysSinceLastServed: number;
  decision?: 'served' | 'deferred';
  assignedVehicle?: string;
  tripId?: number;
}

export interface PeakFleetStatus {
  scenario: string;
  vehicleId: string;
  status: 'in_workshop' | 'available';
}
