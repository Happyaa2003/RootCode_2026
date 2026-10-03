from typing import List, Optional
from fastapi import APIRouter, HTTPException, status
from app.schemas.common import Route
from app.services.store import store

router = APIRouter()


@router.get("", response_model=List[Route])
async def list_routes(depotId: Optional[str] = None):
    store.initialize()
    if depotId:
        return [r for r in store.routes if r.depotId.lower() == depotId.lower()]
    return store.routes


@router.get("/{route_id}", response_model=Route)
async def get_route(route_id: str):
    store.initialize()
    for r in store.routes:
        if r.id.lower() == route_id.lower():
            return r
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Route not found")
