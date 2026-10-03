@echo off
title WayPilot Logistics - Stop Services
echo =====================================================================
echo           STOPPING WAYPILOT LOCAL SERVICES (Ports 8000 & 5173)       
echo =====================================================================
echo.

:: Kill process listening on port 8000 (Backend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do (
    echo Terminating backend process PID %%a...
    taskkill /F /PID %%a >nul 2>&1
)

:: Kill process listening on port 5173 (Frontend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173" ^| findstr "LISTENING"') do (
    echo Terminating frontend process PID %%a...
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo WayPilot local services have been stopped.
timeout /t 2 >nul
