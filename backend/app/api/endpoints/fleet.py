from typing import List, Optional
from fastapi import APIRouter, HTTPException, status
from app.schemas.common import Vehicle
from app.services.store import store

router = APIRouter()


@router.get("", response_model=List[Vehicle])
async def list_vehicles(status: Optional[str] = None):
    store.initialize()
    if status and status.lower() != "all":
        return [v for v in store.vehicles if v.status.lower() == status.lower()]
    return store.vehicles


@router.get("/{vehicle_id}", response_model=Vehicle)
async def get_vehicle(vehicle_id: str):
    store.initialize()
    for v in store.vehicles:
        if v.id.lower() == vehicle_id.lower():
            return v
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")


@router.patch("/{vehicle_id}/location", response_model=Vehicle)
async def update_vehicle_location(vehicle_id: str, lat: float, lng: float, heading: Optional[float] = None):
    store.initialize()
    for v in store.vehicles:
        if v.id.lower() == vehicle_id.lower():
            v.location = {"lat": lat, "lng": lng}
            if heading is not None:
                v.heading = heading
            v.lastSeen = "Just now"
            return v
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
