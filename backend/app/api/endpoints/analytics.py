from fastapi import APIRouter
from app.schemas.common import KpiSummary
from app.services.store import store

router = APIRouter()


@router.get("/kpis", response_model=KpiSummary)
async def get_kpi_summary():
    return store.get_kpis()
