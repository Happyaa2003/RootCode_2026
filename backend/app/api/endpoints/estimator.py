from fastapi import APIRouter, HTTPException
from app.schemas.common import DeliveryTimeEstimationRequest, DeliveryTimeEstimationResult
from app.services.eta_engine import estimate_delivery_time
from app.services.seed_data import get_cached_dataset

router = APIRouter()

# Peliyagoda Central Depot coordinates
DEPOT_COORDS = {"lat": 6.9585, "lng": 79.8893}


@router.post("/estimate", response_model=DeliveryTimeEstimationResult)
async def calculate_estimation(payload: DeliveryTimeEstimationRequest):
    data = get_cached_dataset()
    outlets = {o.get("outlet_id"): o for o in data.get("outlets", [])}
    outlet_info = outlets.get(payload.destinationOutletId)
    
    if outlet_info:
        lat2 = float(outlet_info.get("latitude", 6.9271))
        lng2 = float(outlet_info.get("longitude", 79.8612))
        dest_name = outlet_info.get("outlet_name", payload.destinationOutletId)
        dock = outlet_info.get("dock_type", "street")
    else:
        lat2 = 6.9271
        lng2 = 79.8612
        dest_name = f"Outlet {payload.destinationOutletId}"
        dock = "street"

    is_monsoon = "rain" in payload.weather.lower() or "monsoon" in payload.weather.lower()
    road_mult = 1.3 if "bad" in payload.roadCondition.lower() or "flood" in payload.roadCondition.lower() else 1.0

    result = estimate_delivery_time(
        origin_name=payload.origin,
        dest_name=dest_name,
        district=payload.district,
        lat1=DEPOT_COORDS["lat"],
        lng1=DEPOT_COORDS["lng"],
        lat2=lat2,
        lng2=lng2,
        departure_time=payload.departureTime,
        dock_type=dock,
        is_monsoon=is_monsoon,
        road_condition_multiplier=road_mult,
    )
    return result
