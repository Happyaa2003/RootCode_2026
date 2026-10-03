from typing import List, Optional
from fastapi import APIRouter, Query, HTTPException, status
from pydantic import BaseModel
from app.schemas.common import Order, OrderStatus, RouteStop
from app.services.store import store

router = APIRouter()


class ScheduleOrderRequest(BaseModel):
    routeId: str
    insertIndex: Optional[int] = None


@router.get("", response_model=List[Order])
async def list_orders(
    status: Optional[str] = None,
    district: Optional[str] = None,
    brand: Optional[str] = None,
    limit: int = Query(100, ge=1, le=500)
):
    store.initialize()
    results = store.orders
    if status and status.lower() != "all":
        results = [o for o in results if o.status.lower() == status.lower()]
    if district and district.lower() != "all":
        results = [o for o in results if o.district.lower() == district.lower()]
    if brand and brand.lower() != "all":
        results = [o for o in results if o.brand.lower() == brand.lower()]
    return results[:limit]


@router.get("/{order_id}", response_model=Order)
async def get_order(order_id: str):
    store.initialize()
    for o in store.orders:
        if o.id.lower() == order_id.lower():
            return o
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")


@router.post("", response_model=Order, status_code=status.HTTP_201_CREATED)
async def create_order(new_order: Order):
    store.initialize()
    store.orders.insert(0, new_order)
    return new_order


@router.patch("/{order_id}/status", response_model=Order)
async def update_order_status(order_id: str, new_status: OrderStatus):
    store.initialize()
    for o in store.orders:
        if o.id.lower() == order_id.lower():
            o.status = new_status
            return o
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")


@router.post("/{order_id}/schedule", response_model=Order)
async def schedule_order(order_id: str, payload: ScheduleOrderRequest):
    store.initialize()
    target_order = None
    for o in store.orders:
        if o.id.lower() == order_id.lower():
            target_order = o
            break
            
    if not target_order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    target_order.routeId = payload.routeId
    target_order.status = "Planned"
    
    # Update route stops
    for r in store.routes:
        if r.id == payload.routeId:
            new_stop = RouteStop(
                order=target_order,
                sequence=len(r.stops) + 1,
                eta=target_order.estimatedArrivalETA or "07:30",
                status="Planned"
            )
            r.stops.append(new_stop)
            r.usedVolume = round(r.usedVolume + (target_order.volume or 1.2), 1)
            r.usedWeight = round(r.usedWeight + (target_order.weight or 200), 1)
        else:
            # remove from other routes if present
            r.stops = [s for s in r.stops if s.order.id.lower() != order_id.lower()]
            for idx, s in enumerate(r.stops):
                s.sequence = idx + 1

    return target_order


@router.post("/{order_id}/unschedule", response_model=Order)
async def unschedule_order(order_id: str):
    store.initialize()
    target_order = None
    for o in store.orders:
        if o.id.lower() == order_id.lower():
            target_order = o
            break
            
    if not target_order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    old_route_id = target_order.routeId
    target_order.routeId = None
    target_order.stopSequence = None
    target_order.status = "Unassigned"

    if old_route_id:
        for r in store.routes:
            if r.id == old_route_id:
                r.stops = [s for s in r.stops if s.order.id.lower() != order_id.lower()]
                for idx, s in enumerate(r.stops):
                    s.sequence = idx + 1
                    
    return target_order
