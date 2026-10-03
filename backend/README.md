# Waypoint Logistics & Fleet Management — Backend API

FastAPI-powered backend for real-time fleet operations, route planning, demand forecasting, and delivery time estimations.

---

## 📁 Project Architecture & File Structure

```text
RootCode_2026/
├── frontend/                     # React 19 + TypeScript + Vite UI
├── tempData/                     # Logistics dataset (CSVs)
└── backend/                      # FastAPI Python Application
    ├── venv/                     # Python Virtual Environment
    ├── .env                      # Local Environment Variables
    ├── .env.example              # Template Environment Variables
    ├── .gitignore                # Git exclusions
    ├── requirements.txt          # Python dependencies
    ├── main.py                   # FastAPI server entry point
    └── app/
        ├── core/
        │   ├── config.py         # Pydantic BaseSettings & CORS
        │   └── security.py       # JWT tokens & password hashing
        ├── db/
        │   ├── base.py           # SQLAlchemy declarative base
        │   └── session.py        # Async engine & session generator
        ├── schemas/              # Pydantic schemas (matching frontend types)
        │   ├── __init__.py
        │   └── common.py         # Order, Vehicle, Route, Outlet, KPI models
        ├── api/                  # API routers (v1)
        │   ├── router.py         # Main /api/v1 router
        │   └── endpoints/
        │       ├── auth.py       # Login & user profile
        │       ├── orders.py     # Order management & status transitions
        │       ├── fleet.py      # Vehicle telemetry & driver assignments
        │       ├── estimator.py  # Travel time & ETA estimation
        │       ├── planner.py    # Route optimization (Google OR-Tools)
        │       ├── forecast.py   # Demand forecasting & seasonal cases
        │       ├── live_ws.py    # WebSocket endpoint for live map tracking
        │       └── analytics.py  # KPI metrics & cost/margin reporting
        └── services/
            ├── seed_data.py      # Loads parsed dataset from tempData
            └── eta_engine.py     # Haversine distance, traffic & weather delay model
```

---

## 🚀 Getting Started

### 1. Activate the Virtual Environment
**PowerShell:**
```powershell
.\backend\venv\Scripts\Activate.ps1
```

**Command Prompt (cmd):**
```cmd
backend\venv\Scripts\activate.bat
```

### 2. Run the Development Server
```bash
cd backend
python main.py
```
Or with Uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Interactive Documentation
Once started, open:
- **Swagger UI:** [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs)
- **ReDoc:** [http://localhost:8000/api/v1/redoc](http://localhost:8000/api/v1/redoc)

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Authenticate dispatcher / planner / fleet manager |
| `GET` | `/api/v1/auth/me` | Current user profile |
| `GET` | `/api/v1/orders` | List orders (with status, brand, and district filters) |
| `GET` | `/api/v1/orders/{order_id}` | Retrieve specific order details |
| `PATCH`| `/api/v1/orders/{order_id}/status` | Update delivery order status |
| `GET` | `/api/v1/fleet` | List fleet vehicles with live coordinates |
| `PATCH`| `/api/v1/fleet/{id}/location`| Update vehicle GPS coordinate & heading |
| `POST` | `/api/v1/estimator/estimate` | Calculate ETA, delay factors & on-time probability |
| `POST` | `/api/v1/planner/optimize` | Run vehicle route optimization |
| `GET` | `/api/v1/forecast/summary` | Peak day scenarios and forecast inputs |
| `GET` | `/api/v1/analytics/kpis` | Real-time operational KPI metrics |
| `WS` | `/api/v1/ws/telemetry` | Real-time vehicle GPS streaming WebSocket |
