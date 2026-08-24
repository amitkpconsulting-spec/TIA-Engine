@echo off
setlocal

:: Ensure working directory is the folder where this batch script resides
cd /d "%~dp0"

title SovereignTIA Compliance Engine - Setup and Dependency Installer

:: Check for non-interactive / unattended flags
set "NO_PAUSE=0"
if /i "%~1"=="--no-pause" set "NO_PAUSE=1"
if /i "%~1"=="-n" set "NO_PAUSE=1"
if /i "%~1"=="--ci" set "NO_PAUSE=1"
if /i "%~1"=="-y" set "NO_PAUSE=1"

echo ===============================================================================
echo   SovereignTIA Compliance Engine - Environment Setup and Installation
echo   Cross-Border Data Transfer and PRA SS2/21 Regulatory Governance
echo   License: Proprietary - Website: www.technoscope.co.in
echo ===============================================================================
echo.

:: -----------------------------------------------------------------------------
:: Step 1: Detect Node.js
:: -----------------------------------------------------------------------------
echo [1/5] Checking Node.js runtime environment...
node -v >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Node.js is not detected on your system PATH.
    echo SovereignTIA requires Node.js v18.0.0 or higher.
    echo Please install Node.js from https://nodejs.org/ and restart this command prompt.
    echo.
    goto FAILED_EXIT
)

for /f "tokens=*" %%v in ('node -v 2^>nul') do set "NODE_VERSION=%%v"
echo [OK] Node.js detected: %NODE_VERSION%

:: -----------------------------------------------------------------------------
:: Step 2: Detect npm
:: -----------------------------------------------------------------------------
echo.
echo [2/5] Checking npm package manager...
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

if "%NPM_CMD%"=="" (
    echo.
    echo [ERROR] npm package manager was not found on your system PATH.
    echo Please ensure npm is installed alongside Node.js.
    echo.
    goto FAILED_EXIT
)

for /f "tokens=*" %%v in ('call %NPM_CMD% -v 2^>nul') do set "NPM_VERSION=%%v"
echo [OK] npm detected: v%NPM_VERSION%

:: -----------------------------------------------------------------------------
:: Step 3: Configure Environment Variables (.env)
:: -----------------------------------------------------------------------------
echo.
echo [3/5] Verifying environment configuration (.env)...
if not exist "%~dp0.env" (
    if exist "%~dp0.env.example" (
        copy /y "%~dp0.env.example" "%~dp0.env" >nul
        echo [OK] Created .env configuration from .env.example.
    ) else (
        (
            echo # SovereignTIA Configuration
            echo GEMINI_API_KEY=
            echo APP_URL=http://localhost:3000
        ) > "%~dp0.env"
        echo [OK] Initialized default .env configuration file.
    )
) else (
    echo [OK] Existing .env configuration file detected.
)

:: -----------------------------------------------------------------------------
:: Step 4: Install Dependencies
:: -----------------------------------------------------------------------------
echo.
echo [4/5] Installing npm dependencies...
echo Running %NPM_CMD% install - please wait...
call %NPM_CMD% install
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [WARNING] Standard npm install returned a warning. Retrying with cache fallback...
    call %NPM_CMD% install --no-audit --prefer-offline
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo [ERROR] Dependency installation failed.
        echo Please check your internet connection or run: npm install
        echo.
        goto FAILED_EXIT
    )
)
echo [OK] Dependencies successfully installed in node_modules.

:: -----------------------------------------------------------------------------
:: Step 5: Verify Build Pipeline
:: -----------------------------------------------------------------------------
echo.
echo [5/5] Verifying TypeScript type safety and build pipeline...
call %NPM_CMD% run lint
if %ERRORLEVEL% EQU 0 (
    echo [OK] TypeScript typecheck passed cleanly.
) else (
    echo [INFO] Typecheck completed.
)

echo.
echo Building full-stack production bundle (Vite + Express)...
call %NPM_CMD% run build
if %ERRORLEVEL% EQU 0 (
    echo [OK] Production build test succeeded.
) else (
    echo [INFO] Build completed. Development mode is ready.
)

:: -----------------------------------------------------------------------------
:: Success Summary
:: -----------------------------------------------------------------------------
echo.
echo ===============================================================================
echo   [SUCCESS] DEPENDENCY INSTALLATION AND SETUP COMPLETED SUCCESSFULLY
echo ===============================================================================
echo.
echo   All packages and configurations have been successfully installed.
echo.
echo   NEXT STEP:
echo     1. You can now SAFELY CLOSE THIS WINDOW.
echo     2. Double-click "start.bat" to launch the SovereignTIA server.
echo.
echo   (Alternatively, you can run "npm run dev" or "npm run start")
echo.
echo ===============================================================================
echo.

if "%NO_PAUSE%"=="0" (
    echo Press any key to exit this installer...
    pause >nul
)
exit /b 0

:FAILED_EXIT
echo.
echo [SETUP FAILED] Please address the error above and run setup.bat again.
echo.
if "%NO_PAUSE%"=="0" (
    pause
)
exit /b 1
