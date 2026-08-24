# SovereignTIA Compliance Engine — Manual Server Launch Guide

This guide outlines the recommended manual methods to configure, build, and launch the **SovereignTIA Compliance Engine** across various operating systems and production environments without relying on batch scripts.

---

## 1. Prerequisites Checklist

Ensure your host machine meets the minimum runtime requirements:
* **Node.js**: `v18.0.0` or higher (Node 20+ Recommended) — Check via `node -v`
* **npm**: `v9.0.0` or higher — Check via `npm -v`
* **Port Availability**: Port `3000` must be accessible and unblocked.
* *(Optional)* **Docker & Docker Compose**: For containerized deployments.

---

## 2. Environment Configuration (`.env`)

Before starting the server, prepare your environment configuration:

```bash
# Copy example configuration if .env doesn't exist
cp .env.example .env
```

Ensure `.env` contains:
```env
GEMINI_API_KEY=your_gemini_api_key_here  # Optional for LLM synthesis features
APP_URL=http://localhost:3000
```

---

## 3. Recommended Manual Launch Methods

### Method A: Development Mode (Hot Module Replacement)
*Best for development, rapid testing, and real-time UI/rule changes.*

```bash
# Step 1: Install dependencies
npm install

# Step 2: Start Express + Vite development server
npm run dev
```

* **Server Address**: `http://localhost:3000`
* **Features**: Live TypeScript reloading (`tsx server.ts`), Vite middleware mode, dynamic sourcemaps.

---

### Method B: Production Mode (Compiled Standalone Server)
*Best for local demonstrations, air-gapped banking perimeters, and on-premises deployments.*

```bash
# Step 1: Install production dependencies
npm install

# Step 2: Validate TypeScript types
npm run lint

# Step 3: Bundle client assets and server bundle
npm run build

# Step 4: Start the optimized production server
npm run start
```

* **Server Address**: `http://localhost:3000`
* **Under the Hood**: Compiles static front-end assets to `/dist` and packages `server.ts` into a self-contained CommonJS artifact (`dist/server.cjs`) via `esbuild`.

---

### Method C: Docker Containerization
*Best for enterprise cloud hosting, Kubernetes, and container orchestration.*

#### Using Docker Compose (Recommended)
```bash
# Build and start in detached background mode
docker compose up --build -d

# View live application logs
docker compose logs -f

# Stop the container
docker compose down
```

#### Using Pure Docker CLI
```bash
# Build the Docker image
docker build -t sovereigntia-engine:latest .

# Run container binding to port 3000
docker run -d --name sovereigntia -p 3000:3000 --env-file .env sovereigntia-engine:latest
```

---

### Method D: Background Process Manager (PM2)
*Best for long-running servers and background service resilience on Linux/macOS/Windows servers.*

```bash
# Step 1: Install PM2 globally (if not installed)
npm install -g pm2

# Step 2: Build the production bundle
npm run build

# Step 3: Start process with auto-restart
pm2 start dist/server.cjs --name "sovereigntia-engine"

# Step 4: Manage process
pm2 status
pm2 logs sovereigntia-engine
pm2 stop sovereigntia-engine
```

---

## 4. Port Conflict Troubleshooting (Port 3000)

If the server reports `EADDRINUSE: address already in use :::3000`:

### On Windows:
```cmd
# Find process using Port 3000
netstat -ano | findstr :3000

# Kill process by PID (replace <PID> with the number from rightmost column)
taskkill /F /PID <PID>
```

### On macOS / Linux:
```bash
# Find and terminate process on Port 3000
lsof -ti:3000 | xargs kill -9
```

---

## 5. Summary Reference Cheat-Sheet

| Objective | Command Sequence | Default URL |
| :--- | :--- | :--- |
| **Quick Dev** | `npm install && npm run dev` | `http://localhost:3000` |
| **Clean Prod** | `npm run build && npm run start` | `http://localhost:3000` |
| **Docker** | `docker compose up --build` | `http://localhost:3000` |
| **Lint Check** | `npm run lint` | CLI output |
