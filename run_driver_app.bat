@echo off
setlocal enabledelayedexpansion
title WayPilot Driver - Flutter Mobile Launcher

echo =====================================================================
echo           WAYPILOT DRIVER - FLUTTER MOBILE APPLICATION
echo =====================================================================
echo.

cd /d "%~dp0driver_mobile_app"

where flutter >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Flutter was not found in PATH!
    echo Please ensure Flutter SDK is installed and added to PATH.
    pause
    exit /b 1
)

echo [*] Checking Flutter dependencies...
call flutter pub get

echo.
echo [*] Select target platform to launch:
echo     [1] Google Chrome (Web Browser)
echo     [2] Windows Desktop Application
echo     [3] Default / Connected Android Device or Emulator
echo.
set /p choice="Enter choice [1-3] (Default: 1): "

if "%choice%"=="2" (
    echo [*] Launching WayPilot Driver on Windows Desktop...
    flutter run -d windows
) else if "%choice%"=="3" (
    echo [*] Launching WayPilot Driver on Connected Device...
    flutter run
) else (
    echo [*] Launching WayPilot Driver in Chrome...
    flutter run -d chrome
)
