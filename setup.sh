#!/usr/bin/env bash
# SovereignTIA Compliance Engine - Linux/macOS Setup Script
set -e

echo "==============================================================================="
echo "  SovereignTIA Compliance Engine - Environment Setup"
echo "  License: Proprietary | Contact: www.technoscope.co.in"
echo "==============================================================================="
echo ""

# 1. Check Node.js
echo "[1/6] Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi
echo "[OK] Node.js found: $(node -v)"

# 2. Check npm
echo "[2/6] Checking npm package manager..."
if ! command -v npm &> /dev/null; then
    echo "[ERROR] npm is not installed."
    exit 1
fi
echo "[OK] npm found: v$(npm -v)"

# 3. Check Docker
echo "[3/6] Checking Docker availability..."
if command -v docker &> /dev/null; then
    echo "[OK] Docker found: $(docker --version)"
else
    echo "[INFO] Docker not detected. Local Node.js execution is available."
fi

# 4. Check .env
echo "[4/6] Checking configuration (.env)..."
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "[OK] Created .env from .env.example"
    else
        echo "GEMINI_API_KEY=" > .env
        echo "APP_URL=http://localhost:3000" >> .env
        echo "[OK] Initialized default .env"
    fi
else
    echo "[OK] Existing .env file found."
fi

# 5. Install dependencies
echo "[5/6] Installing npm dependencies..."
npm install
echo "[OK] Dependencies installed."

# 6. Typecheck & Build
echo "[6/6] Verifying TypeScript & building bundle..."
npm run lint || true
npm run build

echo ""
echo "==============================================================================="
echo "  [SUCCESS] Environment setup complete! Launch with ./start.sh or npm run dev"
echo "  URL: http://localhost:3000"
echo "==============================================================================="
