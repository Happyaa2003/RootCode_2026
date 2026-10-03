from typing import List, Dict, Any
from fastapi import APIRouter
from app.services.seed_data import get_cached_dataset

router = APIRouter()


@router.get("/summary")
async def get_forecast_summary():
    data = get_cached_dataset()
    cases = data.get("task2aForecastInputs", [])
    scenarios = data.get("task2bPeakScenarios", [])
    return {
        "totalForecastCases": len(cases),
        "totalPeakScenarios": len(scenarios),
        "casesSample": cases[:10],
        "scenariosSample": scenarios[:5],
    }
