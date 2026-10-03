import math
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from app.schemas.common import DeliveryTimeEstimationResult


# District reference coordinates
DISTRICT_SPEEDS = {
    "Colombo": 18.0,       # km/h urban average
    "Gampaha": 26.0,
    "Kalutara": 32.0,
    "Kandy": 22.0,
    "Galle": 30.0,
}

DOCK_ALLOWANCE = {
    "street": 15.0,        # mins
    "rear_dock": 20.0,
    "mall_bay": 30.0,
}


def calculate_haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def estimate_delivery_time(
    origin_name: str,
    dest_name: str,
    district: str,
    lat1: float,
    lng1: float,
    lat2: float,
    lng2: float,
    departure_time: str,
    dock_type: str = "street",
    is_monsoon: bool = False,
    road_condition_multiplier: float = 1.0,
) -> DeliveryTimeEstimationResult:
    # 1. Distance
    straight_km = calculate_haversine(lat1, lng1, lat2, lng2)
    # Winding road factor for Sri Lanka terrain ~ 1.32
    distance_km = round(straight_km * 1.32, 2)
    
    # 2. Base speed & Travel time
    avg_speed = DISTRICT_SPEEDS.get(district, 24.0)
    base_travel_min = (distance_km / avg_speed) * 60.0
    
    # 3. Peak traffic factor
    try:
        dep_dt = datetime.strptime(departure_time, "%H:%M")
        hour = dep_dt.hour
    except Exception:
        hour = 9
    
    # Morning (8-10) and Evening (17-19) peaks
    if 8 <= hour <= 10 or 17 <= hour <= 19:
        traffic_multiplier = 1.35
    elif 11 <= hour <= 16:
        traffic_multiplier = 1.15
    else:
        traffic_multiplier = 1.0
        
    traffic_delay_min = round(base_travel_min * (traffic_multiplier - 1.0), 1)
    monsoon_delay_min = round(base_travel_min * 0.25, 1) if is_monsoon else 0.0
    
    estimated_travel_min = round(
        base_travel_min + traffic_delay_min + monsoon_delay_min, 1
    )
    
    # 4. Dock / service allowance
    dock_allowance_min = DOCK_ALLOWANCE.get(dock_type, 15.0)
    total_service_min = dock_allowance_min + 10.0  # unloading + verification
    total_estimated_delivery_min = round(estimated_travel_min + total_service_min, 1)
    
    # 5. Timestamps
    try:
        today = datetime.now()
        dep_time_obj = today.replace(hour=hour, minute=int(departure_time.split(":")[1]) if ":" in departure_time else 0)
        arr_time_obj = dep_time_obj + timedelta(minutes=estimated_travel_min)
        comp_time_obj = arr_time_obj + timedelta(minutes=total_service_min)
        
        arr_eta = arr_time_obj.strftime("%H:%M")
        comp_eta = comp_time_obj.strftime("%H:%M")
    except Exception:
        arr_eta = "10:30"
        comp_eta = "11:00"
        
    # On-time probability calculation based on traffic and weather buffer
    risk_factor = (traffic_multiplier - 1.0) + (0.2 if is_monsoon else 0.0)
    on_time_prob = max(60.0, round(98.0 - (risk_factor * 80.0), 1))

    return DeliveryTimeEstimationResult(
        origin=origin_name,
        destinationOutlet=dest_name,
        district=district,
        roadClass="A Class Highway" if distance_km > 20 else "Urban Secondary",
        distanceKm=distance_km,
        baseTravelMin=round(base_travel_min, 1),
        trafficMultiplier=traffic_multiplier,
        trafficDelayMin=traffic_delay_min,
        monsoonWeatherDelayMin=monsoon_delay_min,
        estimatedTravelMin=estimated_travel_min,
        dockAllowanceMin=dock_allowance_min,
        totalServiceTurnaroundMin=total_service_min,
        totalEstimatedDeliveryMin=total_estimated_delivery_min,
        departureTime=departure_time,
        estimatedArrivalETA=arr_eta,
        estimatedCompletionETA=comp_eta,
        onTimeProbability=on_time_prob,
        timeWindowCompliance=(on_time_prob > 75.0),
    )
