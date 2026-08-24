#!/usr/bin/env bash
# SovereignTIA Compliance Engine - Linux/macOS Start Script

show_menu() {
    clear
    echo "==============================================================================="
    echo "  SovereignTIA Compliance Engine - Server Launcher"
    echo "  License: Proprietary | Contact: www.technoscope.co.in"
    echo "==============================================================================="
    echo ""
    echo "  [1] Development Server (Node.js + tsx + Vite HMR - Port 3000)"
    echo "  [2] Production Server  (Build & run compiled server - Port 3000)"
    echo "  [3] Docker Container   (Docker Compose - Port 3000)"
    echo "  [4] Environment Setup  (Run ./setup.sh)"
    echo "  [5] Exit"
    echo ""
    read -p "Select option [1-5] (default 1): " choice
    choice=${choice:-1}

    case "$choice" in
        1)
            echo "Starting Development Server on http://localhost:3000..."
            if [ ! -d "node_modules" ]; then
                ./setup.sh
            fi
            npm run dev
            ;;
        2)
            echo "Building and starting Production Server on http://localhost:3000..."
            if [ ! -d "node_modules" ]; then
                ./setup.sh
            fi
            npm run build
            npm run start
            ;;
        3)
            echo "Starting via Docker Compose on http://localhost:3000..."
            docker compose up --build
            ;;
        4)
            ./setup.sh
            read -p "Press Enter to return to menu..."
            show_menu
            ;;
        5)
            echo "Exiting. Goodbye!"
            exit 0
            ;;
        *)
            echo "Invalid option."
            sleep 1
            show_menu
            ;;
    esac
}

show_menu
