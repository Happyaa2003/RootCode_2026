from fastapi import APIRouter
from app.api.endpoints import (
    auth,
    orders,
    fleet,
    routes,
    depots,
    outlets,
    drivers,
    estimator,
    live_ws,
    analytics,
    planner,
    forecast,
    assistant,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(orders.router, prefix="/orders", tags=["Orders"])
api_router.include_router(fleet.router, prefix="/fleet", tags=["Fleet & Vehicles"])
api_router.include_router(routes.router, prefix="/routes", tags=["Routes"])
api_router.include_router(depots.router, prefix="/depots", tags=["Depots"])
api_router.include_router(outlets.router, prefix="/outlets", tags=["Outlets"])
api_router.include_router(drivers.router, prefix="/drivers", tags=["Drivers"])
api_router.include_router(estimator.router, prefix="/estimator", tags=["Delivery ETA Estimator"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics & KPIs"])
api_router.include_router(planner.router, prefix="/planner", tags=["Route Optimization"])
api_router.include_router(forecast.router, prefix="/forecast", tags=["Demand Forecasting"])
api_router.include_router(assistant.router, prefix="/assistant", tags=["AI Assistant"])
api_router.include_router(live_ws.router, tags=["Real-time Telematics"])
