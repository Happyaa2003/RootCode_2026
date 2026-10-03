import json
import os
from datetime import datetime, timezone
from typing import Any, Dict, Optional
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from jose import jwt, JWTError

from app.core.config import settings
from app.core.security import create_access_token, verify_password, get_password_hash
from app.schemas.common import UserProfile, UserRole

router = APIRouter()
security_bearer = HTTPBearer(auto_error=False)


# ─── Request & Response Models ───────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str
    password: str


class SignupRequest(BaseModel):
    name: str
    email: str
    password: str
    role: Optional[UserRole] = "Dispatcher"
    depot: Optional[str] = "Peliyagoda Central Depot"


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfile


class SignupPendingResponse(BaseModel):
    status: str = "PENDING_APPROVAL"
    message: str
    user: UserProfile


# ─── In-Memory Production User Store ─────────────────────────────────────────
# Initialized with pre-hashed demo accounts (password: 'password123')
USER_STORE: Dict[str, Dict[str, Any]] = {
    "kamal.perera@waypilot.com": {
        "password_hash": get_password_hash("password123"),
        "profile": UserProfile(
            id="USR-001", name="Kamal Perera",
            email="kamal.perera@waypilot.com",
            role="Dispatcher", depot="Peliyagoda Central Depot",
            initials="KP", status="ACTIVE"
        )
    },
    "kamal.perera@waypointroot.com": {
        "password_hash": get_password_hash("password123"),
        "profile": UserProfile(
            id="USR-001", name="Kamal Perera",
            email="kamal.perera@waypointroot.com",
            role="Dispatcher", depot="Peliyagoda Central Depot",
            initials="KP", status="ACTIVE"
        )
    },
    "anura.j@waypointroot.com": {
        "password_hash": get_password_hash("password123"),
        "profile": UserProfile(
            id="USR-002", name="Anura Jayasinghe",
            email="anura.j@waypointroot.com",
            role="Planner", depot="Peliyagoda Central Depot",
            initials="AJ", status="ACTIVE"
        )
    },
    "suneth.b@waypointroot.com": {
        "password_hash": get_password_hash("password123"),
        "profile": UserProfile(
            id="USR-003", name="Suneth Bandara",
            email="suneth.b@waypointroot.com",
            role="Fleet Manager", depot="Peliyagoda Central Depot",
            initials="SB", status="ACTIVE"
        )
    },
    "sanduni.f@waypointroot.com": {
        "password_hash": get_password_hash("password123"),
        "profile": UserProfile(
            id="USR-004", name="Sanduni Fernando",
            email="sanduni.f@waypointroot.com",
            role="Admin", depot="National Command Center",
            initials="SF", status="ACTIVE"
        )
    },
    "nimal.silva@waypointroot.com": {
        "password_hash": get_password_hash("password123"),
        "profile": UserProfile(
            id="USR-005", name="Nimal Silva",
            email="nimal.silva@waypointroot.com",
            role="Driver", depot="Peliyagoda Central Depot",
            initials="NS", status="ACTIVE"
        )
    },
    "dispatcher@waypoint.lk": {
        "password_hash": get_password_hash("password123"),
        "profile": UserProfile(
            id="USR-001", name="Kamal Perera",
            email="dispatcher@waypoint.lk",
            role="Dispatcher", depot="Peliyagoda Central Depot",
            initials="KP", status="ACTIVE"
        )
    },
    "planner@waypoint.lk": {
        "password_hash": get_password_hash("password123"),
        "profile": UserProfile(
            id="USR-002", name="Anura Jayasinghe",
            email="planner@waypoint.lk",
            role="Planner", depot="Peliyagoda Central Depot",
            initials="AS", status="ACTIVE"
        )
    },
}

USERS_FILE = os.path.join(os.path.dirname(__file__), "..", "..", "users_store.json")


def load_persisted_users():
    try:
        if os.path.exists(USERS_FILE):
            with open(USERS_FILE, "r", encoding="utf-8") as f:
                saved = json.load(f)
                for email, entry in saved.items():
                    USER_STORE[email] = {
                        "password_hash": entry["password_hash"],
                        "profile": UserProfile(**entry["profile"])
                    }
    except Exception as e:
        print(f"Notice: Could not load persisted users: {e}")


def persist_user(email: str, entry: Dict[str, Any]):
    try:
        saved = {}
        if os.path.exists(USERS_FILE):
            with open(USERS_FILE, "r", encoding="utf-8") as f:
                saved = json.load(f)
        saved[email] = {
            "password_hash": entry["password_hash"],
            "profile": entry["profile"].model_dump()
        }
        with open(USERS_FILE, "w", encoding="utf-8") as f:
            json.dump(saved, f, indent=2)
    except Exception as e:
        print(f"Notice: Could not persist user: {e}")


load_persisted_users()


# ─── JWT Token Dependency ───────────────────────────────────────────────────

async def get_current_user(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)
) -> UserProfile:
    """Decodes JWT Bearer token and returns authenticated UserProfile."""
    if not auth:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = auth.credentials
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_entry = USER_STORE.get(email.lower().strip())
    if not user_entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User account not found")
    return user_entry["profile"]


async def require_admin(current_user: UserProfile = Depends(get_current_user)) -> UserProfile:
    """Requires the current user to have Admin role."""
    if current_user.role != "Admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required.")
    return current_user


# ─── Auth Endpoints ─────────────────────────────────────────────────────────

@router.post("/signup", response_model=SignupPendingResponse, status_code=201)
async def signup(data: SignupRequest) -> Any:
    """
    Registers a new user with PENDING_APPROVAL status.
    Admin must approve the account before the user can log in.
    """
    email_key = data.email.lower().strip()
    if email_key in USER_STORE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )

    if len(data.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters.",
        )

    initials = "".join([p[0] for p in data.name.split()[:2]]).upper() or "OP"

    profile = UserProfile(
        id=f"USR-{len(USER_STORE) + 101}",
        name=data.name.strip(),
        email=email_key,
        role=data.role or "Dispatcher",
        depot=data.depot or "Peliyagoda Central Depot",
        initials=initials,
        status="PENDING_APPROVAL",
        created_at=datetime.now(timezone.utc).isoformat(),
    )

    USER_STORE[email_key] = {
        "password_hash": get_password_hash(data.password),
        "profile": profile,
    }
    persist_user(email_key, USER_STORE[email_key])

    return SignupPendingResponse(
        status="PENDING_APPROVAL",
        message="Your account has been submitted for admin approval. You will be able to sign in once access is granted.",
        user=profile,
    )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: LoginRequest) -> Any:
    """Authenticates credentials against bcrypt hash and issues JWT token."""
    email_key = credentials.email.lower().strip()
    user_data = USER_STORE.get(email_key)

    if not user_data or not verify_password(credentials.password, user_data["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password. Please verify your credentials.",
        )

    profile = user_data["profile"]

    if profile.status == "PENDING_APPROVAL":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="PENDING_APPROVAL: Your account is awaiting admin approval. Please check back later.",
        )
    if profile.status == "REJECTED":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="REJECTED: Your account request has been declined. Contact your administrator.",
        )

    token = create_access_token(profile.email, role=profile.role)
    return TokenResponse(access_token=token, user=profile)


@router.get("/me", response_model=UserProfile)
async def me(current_user: UserProfile = Depends(get_current_user)) -> Any:
    """Returns the authenticated user's profile from the validated Bearer token."""
    return current_user


# ─── Admin User Management Endpoints ────────────────────────────────────────

@router.get("/admin/pending", response_model=list[UserProfile])
async def list_pending_users(admin: UserProfile = Depends(require_admin)) -> Any:
    """Returns all users with PENDING_APPROVAL status. Admin only."""
    return [
        entry["profile"]
        for entry in USER_STORE.values()
        if entry["profile"].status == "PENDING_APPROVAL"
    ]


@router.get("/admin/all-users", response_model=list[UserProfile])
async def list_all_users(admin: UserProfile = Depends(require_admin)) -> Any:
    """Returns all registered users. Admin only."""
    return [entry["profile"] for entry in USER_STORE.values()]


@router.post("/admin/approve/{email}", response_model=UserProfile)
async def approve_user(email: str, admin: UserProfile = Depends(require_admin)) -> Any:
    """Approves a pending user — sets status to ACTIVE. Admin only."""
    email_key = email.lower().strip()
    user_entry = USER_STORE.get(email_key)
    if not user_entry:
        raise HTTPException(status_code=404, detail="User not found.")
    if user_entry["profile"].status != "PENDING_APPROVAL":
        raise HTTPException(
            status_code=400,
            detail=f"User is not pending approval (status: {user_entry['profile'].status})."
        )
    updated = user_entry["profile"].model_copy(update={"status": "ACTIVE"})
    USER_STORE[email_key]["profile"] = updated
    persist_user(email_key, USER_STORE[email_key])
    return updated


@router.post("/admin/reject/{email}", response_model=UserProfile)
async def reject_user(email: str, admin: UserProfile = Depends(require_admin)) -> Any:
    """Rejects a pending user — sets status to REJECTED. Admin only."""
    email_key = email.lower().strip()
    user_entry = USER_STORE.get(email_key)
    if not user_entry:
        raise HTTPException(status_code=404, detail="User not found.")
    if user_entry["profile"].status not in ("PENDING_APPROVAL", "ACTIVE"):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot reject user with status: {user_entry['profile'].status}."
        )
    updated = user_entry["profile"].model_copy(update={"status": "REJECTED"})
    USER_STORE[email_key]["profile"] = updated
    persist_user(email_key, USER_STORE[email_key])
    return updated
