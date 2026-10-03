from typing import List, Optional
from fastapi import APIRouter, Query
from app.schemas.common import Outlet
from app.services.seed_data import get_cached_dataset

router = APIRouter()

DISTRICT_CENTERS = {
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

_outlets_cache: List[Outlet] = []


def init_outlets():
    global _outlets_cache
    if _outlets_cache:
        return
    data = get_cached_dataset()
    raw_outlets = data.get("outlets", [])
    
    generated = []
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

        generated.append(
            Outlet(
                id=o.get("outlet_id", f"OUT-{idx+1:03d}"),
                name=f"{o.get('outlet_id')} · {o.get('brand', 'General')} {dock_type.replace('_', ' ').upper()}",
                address=f"{dist} Metro Distribution, Sector {idx + 1}",
                district=dist,
                location={"lat": lat, "lng": lng},
                dockType=dock_type,
                parkingConstraint=parking,
                mallWindow=o.get("mall_window") or None,
                windowOpenTime=o.get("window_open_time", "06:00"),
                windowCloseTime=o.get("window_close_time", "10:30"),
            )
        )
    _outlets_cache = generated


@router.get("", response_model=List[Outlet])
async def list_outlets(
    district: Optional[str] = None,
    dockType: Optional[str] = None,
    limit: int = Query(120, ge=1, le=500)
):
    init_outlets()
    res = _outlets_cache
    if district:
        res = [o for o in res if o.district.lower() == district.lower()]
    if dockType:
        res = [o for o in res if o.dockType == dockType]
    return res[:limit]
