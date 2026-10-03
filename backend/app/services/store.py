import json
import math
from pathlib import Path
from typing import List, Dict, Optional, Any
from app.schemas.common import (
    Order, Route, RouteStop, Vehicle, Driver, Outlet, Depot,
    KpiSummary, Brand, OrderStatus, DeliveryCostBreakdown
)
from app.services.seed_data import get_cached_dataset

DISTRICT_CENTERS: Dict[str, List[float]] = {
    "Colombo": [6.9271, 79.8780],
    "Gampaha": [7.0840, 79.9939],
    "Kalutara": [6.5854, 79.9607],
    "Galle": [6.0535, 80.2210],
    "Matara": [5.9549, 80.5550],
    "Kurunegala": [7.4818, 80.3609],
    "Puttalam": [8.0408, 79.8394],
    "Kandy": [7.2906, 80.6337],
    "Matale": [7.4675, 80.6234],
    "Nuwara Eliya": [6.9497, 80.7891],
    "Badulla": [6.9934, 81.0550],
    "Kegalle": [7.2513, 80.3464],
}

ROUTE_COLORS = [
    "#2563EB", "#10B981", "#8B5CF6", "#F59E0B", "#EC4899", "#06B6D4",
    "#3B82F6", "#14B8A6", "#6366F1", "#F97316", "#84CC16", "#A855F7"
]


# Service allowances from dataset rules
def get_service_allowance(brand: str, dock_type: str) -> float:
    if brand == "Fresh":
        return 15.0 if dock_type == "rear_dock" else (16.0 if dock_type == "street" else 18.0)
    elif brand == "Style":
        return 38.0 if dock_type == "rear_dock" else (46.0 if dock_type == "street" else 59.0)
    else:  # Tech
        return 43.0 if dock_type == "rear_dock" else 55.0


def compute_order_economics(brand: Brand, units: int, dock_type: str, delay_min: Optional[int] = None):
    unit_price = 28.50 if brand == "Fresh" else (68.00 if brand == "Style" else 165.00)
    item_price = round(units * unit_price, 2)
    allowance_min = get_service_allowance(brand, dock_type)
    
    fuel_cost = round((12.5 / 5.5) * 1.25, 2)
    labor_cost = round(((allowance_min + 18) / 60) * 24.00, 2)
    service_cost = round(allowance_min * 0.45, 2)
    penalty_cost = round(delay_min * 4.50, 2) if delay_min and delay_min > 0 else 0.0
    
    delivery_cost = round(fuel_cost + labor_cost + service_cost + penalty_cost, 2)
    delivery_margin = round(item_price - delivery_cost, 2)
    cost_ratio = round((delivery_cost / (item_price or 1)) * 100, 1)

    return {
        "itemPrice": item_price,
        "deliveryCost": delivery_cost,
        "deliveryMargin": delivery_margin,
        "costRatio": cost_ratio,
        "allowanceMin": allowance_min,
        "costBreakdown": DeliveryCostBreakdown(
            fuelCost=fuel_cost,
            laborCost=labor_cost,
            serviceCost=service_cost,
            penaltyCost=penalty_cost,
        )
    }


class DataStore:
    def __init__(self):
        self.depots: List[Depot] = [
            Depot(
                id="DEP-PEL",
                name="Peliyagoda Central Depot",
                location={"lat": 6.9535, "lng": 79.8912},
                address="Kandy Road, Peliyagoda, Western Province"
            ),
            Depot(
                id="DEP-KDY",
                name="Kandy Hill Depot",
                location={"lat": 7.2906, "lng": 80.6337},
                address="William Gopallawa Mawatha, Kandy"
            ),
        ]
        self.drivers: List[Driver] = [
            Driver(id="DRV-001", name="Kamal Perera", initials="KP", phone="+94 77 123 4567", licenseClass="Heavy Commercial"),
            Driver(id="DRV-002", name="Nimal Silva", initials="NS", phone="+94 71 234 5678", licenseClass="Dual Purpose"),
            Driver(id="DRV-003", name="Sunil Fernando", initials="SF", phone="+94 76 345 6789", licenseClass="Heavy Commercial"),
            Driver(id="DRV-004", name="Roshan Jayasuriya", initials="RJ", phone="+94 75 456 7890", licenseClass="Commercial Reefer"),
            Driver(id="DRV-005", name="Dinesh Chandimal", initials="DC", phone="+94 78 567 8901", licenseClass="Heavy Commercial"),
            Driver(id="DRV-006", name="Mahela Bandara", initials="MB", phone="+94 72 678 9012", licenseClass="Dual Purpose"),
            Driver(id="DRV-007", name="Lasith Malinga", initials="LM", phone="+94 77 789 0123", licenseClass="Commercial Reefer"),
            Driver(id="DRV-008", name="Angelo Mathews", initials="AM", phone="+94 71 890 1234", licenseClass="Heavy Commercial"),
            Driver(id="DRV-009", name="Kusal Perera", initials="KuP", phone="+94 76 901 2345", licenseClass="Dual Purpose"),
            Driver(id="DRV-010", name="Dimuth Karunaratne", initials="DK", phone="+94 75 012 3456", licenseClass="Heavy Commercial"),
        ]
        self.outlets: List[Outlet] = []
        self.vehicles: List[Vehicle] = []
        self.orders: List[Order] = []
        self.routes: List[Route] = []
        self._initialized = False

    def initialize(self):
        if self._initialized:
            return

        dataset = get_cached_dataset()
        raw_outlets = dataset.get("outlets", [])
        raw_vehicles = dataset.get("vehicles", [])
        raw_deliveries = dataset.get("deliveries", [])

        # 1. Initialize all real 120 Outlets from outlets.csv
        outlets_map: Dict[str, Outlet] = {}
        for idx, o in enumerate(raw_outlets):
            dist = o.get("district", "Colombo")
            center = DISTRICT_CENTERS.get(dist, [6.9271, 79.8780])
            lat_offset = (((idx * 13) % 21 - 10) * 0.004)
            lng_offset = max(0.002, (((idx * 19) % 21) * 0.005))
            lat = round((center[0] + lat_offset) * 10000) / 10000
            lng = round(max(79.8560, center[1] + lng_offset) * 10000) / 10000
            
            dock_raw = o.get("dock_type", "street")
            dock_type = "rear_dock" if dock_raw == "rear_dock" else ("mall_bay" if dock_raw == "mall_bay" else "street")
            parking_raw = o.get("parking_constraint", "normal")
            parking = "van_only" if parking_raw == "van_only" else ("mall_dock" if parking_raw == "mall_dock" else "normal")

            outlet_obj = Outlet(
                id=o["outlet_id"],
                name=f"{o['outlet_id']} · {o.get('brand', 'General')} {dock_type.replace('_', ' ').upper()}",
                address=f"{dist} Commercial Sector, Zone {idx + 1}",
                district=dist,
                location={"lat": lat, "lng": lng},
                dockType=dock_type,
                parkingConstraint=parking,
                mallWindow=o.get("mall_window") or None,
                windowOpenTime=o.get("window_open_time", "06:00"),
                windowCloseTime=o.get("window_close_time", "10:30"),
            )
            outlets_map[o["outlet_id"]] = outlet_obj

        self.outlets = list(outlets_map.values())

        # 2. Initialize all real 60 Vehicles from vehicles.csv
        vehicles_map: Dict[str, Vehicle] = {}
        for idx, v in enumerate(raw_vehicles):
            v_id = v.get("vehicle_id", f"VEH{idx+1:03d}")
            is_reefer = (v.get("temp") == "reefer")
            v_type = "Reefer" if is_reefer else ("Large" if v.get("type") == "truck" else "Standard")
            status = "Active" if idx < 30 else ("Idle" if idx < 50 else "Maintenance")
            driver = self.drivers[idx % len(self.drivers)] if status == "Active" else None
            depot_id = "DEP-KDY" if v.get("depot") == "Kandy" else "DEP-PEL"
            center = [7.2906, 80.6337] if depot_id == "DEP-KDY" else [6.9535, 79.8912]

            veh_obj = Vehicle(
                id=v_id,
                plate=f"WP-{v_id}",
                type=v_type,
                capacityVolume=float(v.get("volume_cap_m3", 12.0)),
                capacityWeight=float(v.get("weight_cap_kg", 2000.0)),
                hasRefrigeration=is_reefer,
                status=status,
                driver=driver,
                location={
                    "lat": round(center[0] + (((idx * 11) % 15 - 7) * 0.005), 4),
                    "lng": round(center[1] + (((idx * 13) % 15 - 7) * 0.005), 4)
                },
                heading=(idx * 45) % 360,
                fuelType=v.get("fuel_type", "diesel"),
                kmPerL=float(v.get("km_per_l", 5.2)),
                weeklyFuelQuotaL=float(v.get("weekly_fuel_quota_l", 150.0)),
                fuelConsumedL=round(35.0 + (idx * 2.8), 1),
                depotId=depot_id,
            )
            vehicles_map[v_id] = veh_obj

        self.vehicles = list(vehicles_map.values())

        # 3. Initialize real Orders from task1_test_inputs deliveries
        self.orders = []
        total_deliveries = len(raw_deliveries)
        # Keep the last 15 as Unassigned so the dispatcher can schedule them
        unscheduled_threshold = max(0, total_deliveries - 15)

        for idx, r in enumerate(raw_deliveries):
            o_id = r.get("outlet_id")
            out = outlets_map.get(o_id)
            if not out:
                continue

            brand = r.get("brand", "Fresh")
            if brand not in ("Fresh", "Style", "Tech"):
                brand = "Fresh"

            units = int(float(r.get("order_units", 20)))
            temp_req = "Chilled" if r.get("temp_requirement", "").lower() == "chilled" else "Ambient"
            vol = round(float(r.get("order_volume_m3", 1.2)), 2)
            weight = round(float(r.get("order_weight_kg", 200.0)), 1)

            is_unassigned = (idx >= unscheduled_threshold)
            is_delivered = (idx < 25)
            is_loading = (25 <= idx < 35)
            is_en_route = (35 <= idx < 50)
            is_delayed = (idx in (3, 11, 28, 42, 65, 88))

            if is_unassigned:
                status_val: OrderStatus = "Unassigned"
                r_id = None
                seq = None
            elif is_delivered:
                status_val = "Delivered"
                r_id = r.get("route_id")
                seq = int(r.get("seq_in_route", 0)) + 1
            elif is_loading:
                status_val = "Loading"
                r_id = r.get("route_id")
                seq = int(r.get("seq_in_route", 0)) + 1
            elif is_en_route:
                status_val = "En Route"
                r_id = r.get("route_id")
                seq = int(r.get("seq_in_route", 0)) + 1
            else:
                status_val = "Planned"
                r_id = r.get("route_id")
                seq = int(r.get("seq_in_route", 0)) + 1

            econ = compute_order_economics(brand, units, out.dockType or "street", 4 if is_delayed else None)

            self.orders.append(
                Order(
                    id=r.get("delivery_id", f"ORD{idx:07d}"),
                    outlet=out,
                    brand=brand,
                    window={
                        "start": r.get("window_open_time", "06:00"),
                        "end": r.get("window_close_time", "10:30")
                    },
                    volume=vol,
                    weight=weight,
                    temp=temp_req,
                    routeId=r_id,
                    stopSequence=seq,
                    status=status_val,
                    riskScore=68.0 if is_delayed else 10.0,
                    district=r.get("district", out.district),
                    units=units,
                    itemPrice=econ["itemPrice"],
                    deliveryCost=econ["deliveryCost"],
                    costBreakdown=econ["costBreakdown"],
                    deliveryMargin=econ["deliveryMargin"],
                    costRatio=econ["costRatio"],
                    dockType=out.dockType,
                    parkingConstraint=out.parkingConstraint,
                    priority="High" if is_delayed or idx % 5 == 0 else "Medium",
                    estimatedTravelMin=18.0,
                    estimatedArrivalETA=r.get("planned_arrival_time") if not is_unassigned else None,
                    estimatedServiceMin=econ["allowanceMin"],
                    onTimeProbability=62.0 if is_delayed else 97.0,
                )
            )

        # 4. Group Real Orders into Real Routes by route_id
        route_groups: Dict[str, List[Order]] = {}
        route_vehicle_ids: Dict[str, str] = {}
        for r_del, o in zip(raw_deliveries, self.orders):
            if o.routeId:
                if o.routeId not in route_groups:
                    route_groups[o.routeId] = []
                    route_vehicle_ids[o.routeId] = r_del.get("vehicle_id", "VEH001")
                route_groups[o.routeId].append(o)

        self.routes = []
        for r_idx, (r_id, group_orders) in enumerate(route_groups.items()):
            # Sort by stopSequence
            group_orders.sort(key=lambda x: x.stopSequence or 0)
            
            stops = [
                RouteStop(
                    order=o,
                    sequence=i + 1,
                    eta=o.estimatedArrivalETA or "06:30",
                    status=o.status
                ) for i, o in enumerate(group_orders)
            ]

            cargo_val = sum(o.itemPrice or 0.0 for o in group_orders)
            del_cost = sum(o.deliveryCost or 0.0 for o in group_orders)
            fuel_c = sum(o.costBreakdown.fuelCost if o.costBreakdown else 0.0 for o in group_orders)
            labor_c = sum(o.costBreakdown.laborCost if o.costBreakdown else 0.0 for o in group_orders)

            v_assigned_id = route_vehicle_ids.get(r_id, "VEH001")
            vehicle = vehicles_map.get(v_assigned_id, self.vehicles[r_idx % len(self.vehicles)])
            driver = self.drivers[r_idx % len(self.drivers)]
            depot_obj = self.depots[0] if vehicle.depotId == "DEP-PEL" else self.depots[1]

            geo = [depot_obj.location] + [o.outlet.location for o in group_orders] + [depot_obj.location]
            color = ROUTE_COLORS[r_idx % len(ROUTE_COLORS)]

            # Route status based on stops
            all_delivered = all(s.status == "Delivered" for s in stops)
            any_active = any(s.status in ("Loading", "En Route") for s in stops)
            r_status = "Completed" if all_delivered else ("Active" if any_active else "Planned")

            self.routes.append(
                Route(
                    id=r_id,
                    name=f"Route {r_id} ({group_orders[0].district} - {vehicle.id})",
                    vehicle=vehicle,
                    driver=driver,
                    stops=stops,
                    status=r_status,
                    color=color,
                    usedVolume=round(sum(o.volume for o in group_orders), 1),
                    usedWeight=round(sum(o.weight for o in group_orders), 1),
                    depotId=depot_obj.id,
                    startTime=group_orders[0].window.start if group_orders else "05:30",
                    estimatedFinish=group_orders[-1].window.end if group_orders else "09:30",
                    firstEta=stops[0].eta if stops else "06:00",
                    geometry=geo,
                    totalCargoValue=round(cargo_val, 2),
                    totalRouteCost=round(del_cost, 2),
                    fuelCost=round(fuel_c, 2),
                    fuelConsumedL=round(fuel_c / 1.25, 1),
                    laborCost=round(labor_c, 2),
                    profitMargin=round(cargo_val - del_cost, 2),
                    totalDistanceKm=round(len(group_orders) * 11.2, 1),
                )
            )

        self._initialized = True

    def get_kpis(self) -> KpiSummary:
        self.initialize()
        total_orders = len(self.orders)
        planned = sum(1 for o in self.orders if o.status == "Planned")
        unassigned = sum(1 for o in self.orders if o.status == "Unassigned")
        at_risk = sum(1 for o in self.orders if o.status == "At Risk" or (o.riskScore and o.riskScore >= 60))
        completed = sum(1 for o in self.orders if o.status == "Delivered")
        active_veh = sum(1 for v in self.vehicles if v.status == "Active")
        offline_veh = sum(1 for v in self.vehicles if v.status == "Offline")
        
        tot_val = sum(o.itemPrice or 0.0 for o in self.orders)
        tot_cost = sum(o.deliveryCost or 0.0 for o in self.orders)
        net_margin = tot_val - tot_cost
        avg_cost = tot_cost / (total_orders or 1)
        cost_pct = (tot_cost / (tot_val or 1)) * 100
        
        fuel_c = sum(v.fuelConsumedL or 0.0 for v in self.vehicles)
        fuel_q = sum(v.weeklyFuelQuotaL or 0.0 for v in self.vehicles)

        return KpiSummary(
            totalOrders=total_orders,
            planned=planned,
            unassigned=unassigned,
            atRisk=at_risk,
            activeVehicles=active_veh,
            onSchedule=total_orders - at_risk - unassigned,
            completed=completed,
            offline=offline_veh,
            totalItemValue=round(tot_val, 2),
            totalDeliveryCost=round(tot_cost, 2),
            netDeliveryMargin=round(net_margin, 2),
            avgCostPerDelivery=round(avg_cost, 2),
            costPercentage=round(cost_pct, 1),
            totalFuelConsumedL=round(fuel_c, 1),
            totalFuelQuotaL=round(fuel_q, 1),
        )


store = DataStore()
