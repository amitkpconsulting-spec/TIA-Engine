@echo off
setlocal

:: Ensure working directory is the folder where this batch script resides
cd /d "%~dp0"

title SovereignTIA Regulatory Engine - Live Server Terminal

:: Resolve npm command
set "NPM_CMD="
call npm.cmd -v >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set "NPM_CMD=npm.cmd"
) else (
    call npm -v >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        set "NPM_CMD=npm"
    )
)

:: Check CLI arguments passed directly to start.bat
if /i "%~1"=="local" goto RUN_LOCAL
if /i "%~1"=="dev" goto RUN_LOCAL
if /i "%~1"=="start" goto RUN_LOCAL
if /i "%~1"=="1" goto RUN_LOCAL
if /i "%~1"=="docker" goto RUN_DOCKER
if /i "%~1"=="2" goto RUN_DOCKER
if /i "%~1"=="stop" goto STOP_DOCKER
if /i "%~1"=="3" goto STOP_DOCKER
if /i "%~1"=="setup" goto RUN_SETUP
if /i "%~1"=="4" goto RUN_SETUP

:MENU
cls
echo ===============================================================================
echo   SovereignTIA Compliance Engine - Local Server ^& Docker Launcher
echo   Cross-Border Data Transfer ^& PRA SS2/21 Regulatory Governance Engine
echo   License: Proprietary - Website: www.technoscope.co.in
echo ===============================================================================
echo.
echo   Select an option:
echo.
echo     [1] Run Local Server   (Live Telemetry, Integrations ^& Tools - Port 3000)
echo     [2] Run Docker Setup   (Docker Compose build ^& background run - Port 3000)
echo     [3] Stop Docker Setup  (docker compose down)
echo     [4] Re-run Setup       (Reinstall / verify npm dependencies)
echo     [5] Exit
echo.
set "CHOICE="
set /p "CHOICE=Enter choice [1-5] (Press ENTER for Option 1 - Local Server): "

if "%CHOICE%"=="" set "CHOICE=1"
if "%CHOICE%"=="1" goto RUN_LOCAL
if "%CHOICE%"=="2" goto RUN_DOCKER
if "%CHOICE%"=="3" goto STOP_DOCKER
if "%CHOICE%"=="4" goto RUN_SETUP
if "%CHOICE%"=="5" goto EXIT_PROMPT

echo.
echo [ERROR] Invalid selection. Please enter a number between 1 and 5.
timeout /t 2 /nobreak >nul
goto MENU

:: -----------------------------------------------------------------------------
:: Mode 1: Run Local Server with Live Telemetry & Integration Monitoring
:: -----------------------------------------------------------------------------
:RUN_LOCAL
cls
echo ===============================================================================
echo   SovereignTIA Compliance Engine - Launching Local Server
echo ===============================================================================
echo.

:: 1. Verify Node.js
echo [1/4] Verifying Node.js runtime...
node -v >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Node.js was not detected on your system PATH.
    echo SovereignTIA requires Node.js v18.0.0 or higher.
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    goto MENU
)

for /f "tokens=*" %%v in ('node -v 2^>nul') do set "NODE_VER=%%v"
echo [OK] Node.js active: %NODE_VER%

:: 2. Verify npm package manager
if "%NPM_CMD%"=="" (
    echo.
    echo [ERROR] npm was not found on your system PATH.
    echo Please ensure npm is installed alongside Node.js.
    echo.
    pause
    goto MENU
)

:: 3. Verify / Auto-Provision Environment Config (.env)
echo.
echo [2/4] Verifying environment configuration (.env)...
if not exist "%~dp0.env" (
    if exist "%~dp0.env.example" (
        copy /y "%~dp0.env.example" "%~dp0.env" >nul
        echo [OK] Auto-initialized .env from .env.example template.
    ) else (
        (
            echo # SovereignTIA Configuration
            echo GEMINI_API_KEY=
            echo APP_URL=http://localhost:3000
        ) > "%~dp0.env"
        echo [OK] Created default .env configuration file.
    )
) else (
    echo [OK] Active .env configuration found.
)

:: 4. Verify node_modules dependencies
echo.
echo [3/4] Checking installed packages in node_modules...
if not exist "%~dp0node_modules" (
    echo [INFO] Dependencies not found. Running automated installation...
    echo.
    call %NPM_CMD% install
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo [ERROR] Failed to install dependencies. Please run setup.bat first.
        echo.
        pause
        goto MENU
    )
) else (
    echo [OK] Dependencies verified in node_modules.
)

:: 5. Port 3000 Availability Check
echo.
echo [4/4] Checking Port 3000 network binding...
netstat -ano 2>nul | findstr /R /C:":3000 " | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [WARNING] Port 3000 appears to be in use by another application.
    echo If the server fails to bind, terminate the conflicting process or PID.
) else (
    echo [OK] Port 3000 is available for server binding.
)

:: 6. Launch browser auto-open in background (3-second delay)
start /b cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:3000"

echo.
echo ===============================================================================
echo   STARTING LIVE SERVER PROCESS - LIVE TELEMETRY ^& INTEGRATIONS MONITOR
echo ===============================================================================
echo   * URL Endpoint:      http://localhost:3000
echo   * Local Network:     http://127.0.0.1:3000 (0.0.0.0:3000)
echo   * Telemetry Stream:  ACTIVE (Logging requests, API pings, tools ^& stats)
echo   * To Stop Server:    Press Ctrl+C in this terminal window
echo ===============================================================================
echo.

:: Launch the server directly - keeping terminal active with live telemetry
call %NPM_CMD% run dev

echo.
echo ===============================================================================
echo   Local server process stopped.
echo ===============================================================================
echo.
pause
goto MENU

:: -----------------------------------------------------------------------------
:: Mode 2: Run Docker Setup
:: -----------------------------------------------------------------------------
:RUN_DOCKER
cls
echo ===============================================================================
echo   Starting SovereignTIA via Docker Container (Port 3000)...
echo ===============================================================================
echo.

docker --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker command was not found on your system PATH.
    echo Please make sure Docker Desktop is installed and running.
    echo.
    pause
    goto MENU
)

echo Building and starting Docker containers...
docker compose up --build -d 2>nul
if %ERRORLEVEL% NEQ 0 (
    docker-compose up --build -d
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo [ERROR] Docker Compose failed to start container.
        pause
        goto MENU
    )
)

echo.
echo [OK] Docker container is active on Port 3000.
echo Opening http://localhost:3000 in your browser...
start http://localhost:3000

echo.
echo ===============================================================================
echo   STREAMING DOCKER CONTAINER LOGS ^& TELEMETRY (Port 3000)
echo ===============================================================================
echo   Press Ctrl+C to stop viewing logs (container stays running in background).
echo   To stop the container completely, choose Option [3] from the menu.
echo.
docker compose logs -f 2>nul || docker-compose logs -f
goto MENU

:: -----------------------------------------------------------------------------
:: Mode 3: Stop Docker Setup
:: -----------------------------------------------------------------------------
:STOP_DOCKER
cls
echo ===============================================================================
echo   Stopping SovereignTIA Docker Containers...
echo ===============================================================================
echo.
docker compose down 2>nul || docker-compose down
echo.
echo [OK] Docker containers cleanly stopped.
echo.
pause
goto MENU

:: -----------------------------------------------------------------------------
:: Mode 4: Re-run Setup
:: -----------------------------------------------------------------------------
:RUN_SETUP
cls
call "%~dp0setup.bat"
goto MENU

:: -----------------------------------------------------------------------------
:: Exit Prompt
:: -----------------------------------------------------------------------------
:EXIT_PROMPT
echo.
echo Exiting SovereignTIA Launcher. Goodbye!
timeout /t 1 /nobreak >nul
exit /b 0
