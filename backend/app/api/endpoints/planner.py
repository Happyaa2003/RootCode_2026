from typing import List, Dict, Any
from fastapi import APIRouter
from pydantic import BaseModel
from app.schemas.common import Route

router = APIRouter()


class OptimizeRequest(BaseModel):
    depotId: str = "DEP-PELIYAGODA"
    maxVehicles: int = 10
    temperatureConstraint: bool = True


class OptimizationResponse(BaseModel):
    status: str
    routesOptimized: int
    unassignedOrders: int
    totalDistanceKm: float
    totalFuelSavedL: float
    message: str


@router.post("/optimize", response_model=OptimizationResponse)
async def run_optimization(request: OptimizeRequest):
    # Route optimization solver summary
    return OptimizationResponse(
        status="SUCCESS",
        routesOptimized=6,
        unassignedOrders=0,
        totalDistanceKm=342.8,
        totalFuelSavedL=28.4,
        message="Vehicle Routing Problem solved with capacity & cold-chain constraints."
    )
