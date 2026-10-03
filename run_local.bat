@echo off
setlocal enabledelayedexpansion
title WayPilot Logistics - Local Launcher

echo =====================================================================
echo           WAYPILOT - SRI LANKA LOGISTICS FLEET INTELLIGENCE         
echo =====================================================================
echo.

cd /d "%~dp0"

:: 1. Check Python installation
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python was not found in PATH!
    echo Please install Python 3.10+ from python.org and add it to PATH.
    pause
    exit /b 1
)

:: 2. Check Node / npm installation
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js / npm was not found in PATH!
    echo Please install Node.js v18 or newer from nodejs.org.
    pause
    exit /b 1
)

:: 3. Setup Backend Virtual Environment if missing
if not exist "backend\venv\Scripts\python.exe" (
    echo [*] Setting up Python virtual environment in backend\venv...
    python -m venv backend\venv
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to create virtual environment.
        pause
        exit /b 1
    )
    echo [*] Installing backend dependencies...
    backend\venv\Scripts\pip install -r backend\requirements.txt
)

:: 4. Setup Frontend node_modules if missing
if not exist "frontend\node_modules" (
    echo [*] Installing frontend npm packages - please wait...
    cd frontend && call npm install && cd ..
)

echo.
echo [*] Starting FastAPI Backend on http://localhost:8000 ...
start "WayPilot Backend" cmd /k "cd /d %~dp0backend && .\venv\Scripts\python.exe main.py"

echo [*] Starting Vite Frontend on http://localhost:5173 ...
start "WayPilot Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo =====================================================================
echo    WAYPILOT IS RUNNING LOCALLY!
echo =====================================================================
echo    - Frontend Web App:  http://localhost:5173
echo    - FastAPI Swagger:   http://localhost:8000/api/v1/docs
echo.
echo    DEMO EVALUATION CREDENTIALS:
echo    - Dispatcher:   kamal.perera@waypilot.com    / password123
echo    - Planner:      anura.j@waypointroot.com     / password123
echo    - Fleet Mgr:    suneth.b@waypointroot.com    / password123
echo    - Admin:        sanduni.f@waypointroot.com   / password123
echo    - Driver:       nimal.silva@waypointroot.com / password123
echo =====================================================================
echo.
echo Opening browser in 3 seconds...
timeout /t 3 /nobreak >nul
start http://localhost:5173
