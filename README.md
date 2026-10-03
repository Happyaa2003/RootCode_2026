# WayPilot · Enterprise Logistics & Fleet Dispatch Intelligence

A next-generation logistics intelligence and automated route optimization platform engineered for multi-depot Sri Lankan distribution networks, supporting 120 retail outlets and 60 fleet vehicles.

---

## 🚀 Key Highlights & Enterprise Features

- **Full FastAPI Backend Authentication**: Built-in production JWT tokens (`python-jose`) and `bcrypt` password hashing. Real `/signup`, `/login`, and `/me` authorization endpoints.
- **1-Click Sri Lanka Operational Demo Roles**: Instant persona switcher for client evaluators (Dispatcher, Planner, Fleet Manager, Driver, Admin) pre-seeded with genuine backend bcrypt credentials.
- **Dynamic Route Optimization & SLA Engine**: Heuristic multi-drop dispatch algorithm accounting for Colombo traffic congestion, reefer temperature constraints, and district SLA penalties.
- **Interactive Telematics Map**: MapLibre GL rendering real-time vehicle telemetry, delivery progress, and route corridors across Sri Lanka.
- **AI Logistics Copilot & Recommendations**: Built-in neural assistant (`AIChatbot.tsx`) providing dynamic rebalancing suggestions and cost intelligence.
- **Offline PWA Capability**: Local cache fallback mode allowing field drivers to access manifests and complete deliveries even with intermittent 4G/cellular coverage.

---

## 👥 Pre-Seeded Evaluation Personas

For evaluators and client demos, the system includes 5 pre-seeded enterprise accounts (Password: `password123`):

| Role | Operational Persona | Email | Assigned Depot / Territory |
| :--- | :--- | :--- | :--- |
| **Dispatcher** | Kamal Perera | `kamal.perera@waypilot.com` | Western Province Dispatch / Peliyagoda |
| **Planner** | Anura Jayasinghe | `anura.j@waypointroot.com` | National Route Planning |
| **Fleet Manager** | Suneth Bandara | `suneth.b@waypointroot.com` | Vehicle Telemetry & Maintenance |
| **Admin** | Sanduni Fernando | `sanduni.f@waypointroot.com` | National Command Center HQ |
| **Driver** | Nimal Silva | `nimal.silva@waypointroot.com` | Peliyagoda Central Depot |

*New accounts can also be created freely via the `/signup` terminal.*

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 19, TypeScript, Vite, MapLibre GL, Lucide Icons.
- **Backend**: FastAPI, Uvicorn, Pydantic v2, Python-Jose (JWT), Bcrypt, WebSockets.
- **Data Engine**: Peliyagoda central distribution dataset, 120 verified retail outlets, 60 multi-class delivery vehicles.

---

## 📦 Deployment Guide

### 1. Backend Deployment on Koyeb (Free Nano Tier)
The backend requires **< 90 MB RAM**, running smoothly within Koyeb's Free 512 MB RAM / 0.1 vCPU tier.

1. Create a free account at [Koyeb.com](https://www.koyeb.com).
2. Click **Create Service** → **GitHub** and select this repository.
3. Configure the service:
   - **Work Directory**: `backend`
   - **Build Type**: `Dockerfile` (or `Buildpack` using the included `backend/Procfile`)
   - **Port**: `8000`
4. Set Environment Variables in Koyeb:
   - `ENVIRONMENT` = `production`
   - `SECRET_KEY` = `<your-secure-random-secret>`
   - `PORT` = `8000`
5. Click **Deploy**. Koyeb will generate your public API endpoint:
   `https://<your-app-name>.koyeb.app`

### 2. Frontend Deployment on Vercel
1. Create a free account at [Vercel.com](https://vercel.com).
2. Click **Add New Project** → Select this repository.
3. Configure the project:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
4. Add Environment Variable in Vercel:
   - `VITE_API_BASE_URL` = `https://<your-app-name>.koyeb.app/api/v1`
5. Click **Deploy**. Your enterprise dashboard will be live at `https://<your-project>.vercel.app`.

---

## 💻 Local Development

### ⚡ 1-Click Launch (Windows)
Simply double-click [`run_local.bat`](file:///d:/2026_GITHUB/Projects_GIT/RootCode_2026/run_local.bat) (or `start.bat`) in the project root! It will:
1. Automatically verify Python and Node.js environments
2. Create the virtual environment & install dependencies if missing
3. Start the FastAPI backend on `http://localhost:8000`
4. Start the React frontend on `http://localhost:5173`
5. Automatically open your browser directly to the dashboard

*To stop all local background processes, double-click [`stop_local.bat`](file:///d:/2026_GITHUB/Projects_GIT/RootCode_2026/stop_local.bat).*

### Manual Commands (Optional)

#### 1. Start Backend Server
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python main.py
```
*API Swagger documentation will be available at `http://localhost:8000/api/v1/docs`.*

#### 2. Start Frontend Server
```bash
cd frontend
npm install
npm run dev
```
*Application will launch at `http://localhost:5173`.*

---

## 🔒 Security & API Endpoints

- `POST /api/v1/auth/signup` - Registers user with bcrypt password encryption and issues JWT token.
- `POST /api/v1/auth/login` - Authenticates credentials and returns JWT bearer token.
- `GET /api/v1/auth/me` - Validates bearer token header and returns authenticated user profile.
- Dynamic CORS middleware pre-configured to allow seamless credentials from any localhost or Vercel domain.
