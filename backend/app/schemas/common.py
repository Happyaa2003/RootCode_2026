from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field

# ─── Enums & Literals ────────────────────────────────────────────────────────
OrderStatus = Literal[
    'Unassigned', 'Planned', 'Loading', 'Ready', 'En Route',
    'Arrived', 'Delivered', 'Failed', 'At Risk', 'Deferred', 'Offline'
]
VehicleStatus = Literal['Active', 'Idle', 'Offline', 'Maintenance']
RouteStatus = Literal['Draft', 'Planned', 'Active', 'Completed']
ExceptionSeverity = Literal['Critical', 'High', 'Medium', 'Low']
Brand = Literal['Fresh', 'Style', 'Tech', 'Chilled']
TempRequirement = Literal['Ambient', 'Chilled', 'Frozen']
UserRole = Literal['Dispatcher', 'Fleet Manager', 'Planner', 'Driver', 'Admin']


# ─── Core Models ─────────────────────────────────────────────────────────────
class Coordinates(BaseModel):
    lat: float
    lng: float


class Depot(BaseModel):
    id: str
    name: str
    location: Coordinates
    address: str


class Driver(BaseModel):
    id: str
    name: str
    initials: str
    phone: str
    licenseClass: str


class Vehicle(BaseModel):
    id: str
    plate: str
    type: Literal['Standard', 'Reefer', 'Large']
    capacityVolume: float  # m³
    capacityWeight: float  # kg
    hasRefrigeration: bool
    status: VehicleStatus
    driver: Optional[Driver] = None
    location: Optional[Coordinates] = None
    heading: Optional[float] = None
    lastSeen: Optional[str] = None
    fuelType: Optional[Literal['diesel', 'petrol']] = 'diesel'
    kmPerL: Optional[float] = 3.5
    weeklyFuelQuotaL: Optional[float] = 120.0
    fuelConsumedL: Optional[float] = 0.0
    depotId: Optional[str] = None


class Outlet(BaseModel):
    id: str
    name: str
    address: str
    district: str
    location: Coordinates
    accessNotes: Optional[str] = None
    dockType: Optional[Literal['street', 'rear_dock', 'mall_bay']] = 'street'
    parkingConstraint: Optional[Literal['normal', 'van_only', 'mall_dock']] = 'normal'
    mallWindow: Optional[str] = None
    windowOpenTime: Optional[str] = "08:00"
    windowCloseTime: Optional[str] = "18:00"


class TimeWindow(BaseModel):
    start: str
    end: str


class DeliveryCostBreakdown(BaseModel):
    fuelCost: float
    laborCost: float
    serviceCost: float
    penaltyCost: float


class Order(BaseModel):
    id: str
    outlet: Outlet
    brand: Brand
    window: TimeWindow
    volume: float  # m³
    weight: float  # kg
    temp: TempRequirement
    status: OrderStatus
    riskScore: float = 0.0  # 0-100
    district: str
    routeId: Optional[str] = None
    stopSequence: Optional[int] = None
    notes: Optional[str] = None
    units: Optional[int] = 1
    itemPrice: Optional[float] = 0.0
    deliveryCost: Optional[float] = 0.0
    costBreakdown: Optional[DeliveryCostBreakdown] = None
    deliveryMargin: Optional[float] = 0.0
    costRatio: Optional[float] = 0.0
    dockType: Optional[Literal['street', 'rear_dock', 'mall_bay']] = 'street'
    parkingConstraint: Optional[Literal['normal', 'van_only', 'mall_dock']] = 'normal'
    priority: Optional[Literal['Low', 'Medium', 'High', 'Urgent']] = 'Medium'
    delayMinutes: Optional[int] = 0
    estimatedTravelMin: Optional[float] = None
    estimatedArrivalETA: Optional[str] = None
    estimatedServiceMin: Optional[float] = None
    estimatedCompletionETA: Optional[str] = None
    onTimeProbability: Optional[float] = None


class RouteStop(BaseModel):
    order: Order
    sequence: int
    eta: str
    etd: Optional[str] = None
    status: OrderStatus
    actualArrival: Optional[str] = None


class Route(BaseModel):
    id: str
    name: str
    vehicle: Optional[Vehicle] = None
    driver: Optional[Driver] = None
    stops: List[RouteStop] = []
    status: RouteStatus
    color: str
    usedVolume: float
    usedWeight: float
    depotId: str
    startTime: Optional[str] = None
    estimatedFinish: Optional[str] = None
    firstEta: Optional[str] = None
    geometry: Optional[List[Coordinates]] = None
    totalCargoValue: Optional[float] = 0.0
    totalRouteCost: Optional[float] = 0.0
    fuelCost: Optional[float] = 0.0
    fuelConsumedL: Optional[float] = 0.0
    laborCost: Optional[float] = 0.0
    profitMargin: Optional[float] = 0.0
    totalDistanceKm: Optional[float] = 0.0


class KpiSummary(BaseModel):
    totalOrders: int
    planned: int
    unassigned: int
    atRisk: int
    activeVehicles: int
    onSchedule: int
    completed: int
    offline: int
    totalItemValue: Optional[float] = 0.0
    totalDeliveryCost: Optional[float] = 0.0
    netDeliveryMargin: Optional[float] = 0.0
    avgCostPerDelivery: Optional[float] = 0.0
    costPercentage: Optional[float] = 0.0
    totalFuelConsumedL: Optional[float] = 0.0
    totalFuelQuotaL: Optional[float] = 0.0


class UserProfile(BaseModel):
    model_config = {"populate_by_name": True}

    id: str
    name: str
    email: str
    role: UserRole
    depot: str
    initials: str
    status: Optional[str] = "ACTIVE"  # "ACTIVE" | "PENDING_APPROVAL" | "REJECTED"
    created_at: Optional[str] = Field(None, alias="createdAt", serialization_alias="createdAt")


class DeliveryTimeEstimationRequest(BaseModel):
    origin: str
    destinationOutletId: str
    district: str
    departureTime: str
    roadCondition: Optional[str] = "Normal"
    weather: Optional[str] = "Clear"


class DeliveryTimeEstimationResult(BaseModel):
    origin: str
    destinationOutlet: str
    district: str
    roadClass: str
    distanceKm: float
    baseTravelMin: float
    trafficMultiplier: float
    trafficDelayMin: float
    monsoonWeatherDelayMin: float
    estimatedTravelMin: float
    dockAllowanceMin: float
    totalServiceTurnaroundMin: float
    totalEstimatedDeliveryMin: float
    departureTime: str
    estimatedArrivalETA: str
    estimatedCompletionETA: str
    onTimeProbability: float
    timeWindowCompliance: bool
