from typing import List
from fastapi import APIRouter
from app.schemas.common import Driver

router = APIRouter()

DRIVERS: List[Driver] = [
    Driver(id="DRV-001", name="Kamal Perera", initials="KP", phone="+94 77 123 4567", licenseClass="Heavy Commercial"),
    Driver(id="DRV-002", name="Nimal Silva", initials="NS", phone="+94 71 234 5678", licenseClass="Dual Purpose"),
    Driver(id="DRV-003", name="Sunil Fernando", initials="SF", phone="+94 76 345 6789", licenseClass="Heavy Commercial"),
    Driver(id="DRV-004", name="Roshan Jayasuriya", initials="RJ", phone="+94 75 456 7890", licenseClass="Commercial Reefer"),
    Driver(id="DRV-005", name="Dinesh Chandimal", initials="DC", phone="+94 78 567 8901", licenseClass="Heavy Commercial"),
    Driver(id="DRV-006", name="Mahela Bandara", initials="MB", phone="+94 72 678 9012", licenseClass="Dual Purpose"),
]


@router.get("", response_model=List[Driver])
async def list_drivers():
    return DRIVERS
