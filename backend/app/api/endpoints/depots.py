from typing import List
from fastapi import APIRouter
from app.schemas.common import Depot

router = APIRouter()

DEPOTS: List[Depot] = [
    Depot(
        id="DEP-PEL",
        name="Peliyagoda Central Depot",
        location={"lat": 6.9535, "lng": 79.8912},
        address="Kandy Road, Peliyagoda, Western Province"
    ),
    Depot(
        id="DEP-KDY",
        name="Kandy Hill Depot",
        location={"lat": 7.2906, "lng": 80.6337},
        address="William Gopallawa Mawatha, Kandy"
    ),
]


@router.get("", response_model=List[Depot])
async def list_depots():
    return DEPOTS
