# Use(Less) — Peer-to-Peer Household Item Rental Platform

A full-stack web app for renting household non-consumable items between users. Built as a university challenge project.

**Features:** Google OAuth login · Simulated wallet · Real-time chat · Rental lifecycle management · Reviews · Item listings with images
IMPORTANT - THIS WEBSITE IS A TEST MADE USING CLAUDE ONLY FOR DEMO PURPOSES.
---

## Prerequisites

You need three things installed before you can run this. Run each command in your terminal to install them.

### 1. Homebrew (Mac package manager)
If you don't already have it:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Docker Desktop
Download and install from: **https://www.docker.com/products/docker-desktop**

After installing, open Docker Desktop and sign in (or create a free account). Keep it running in the background — you'll see the whale icon in your menu bar.

### 3. Python 3.13
```bash
brew install python@3.13
```

### 4. Node.js
```bash
brew install node
```

### Verify everything is installed
```bash
docker --version        # should say Docker version 24+
python3.13 --version    # should say Python 3.13.x
node --version          # should say v18+ or higher
```

---

## Setup & Run

### Step 1 — Clone the repo
```bash
git clone <repo-url>
cd useless-rental
```

### Step 2 — Make sure Docker Desktop is open and running

### Step 3 — Run the start script
```bash
./start.sh
```

That's it. The script will:
- Start the PostgreSQL database and Redis (via Docker)
- Create a Python virtual environment and install backend dependencies
- Install Node.js dependencies for the chat server and frontend
- Start all three services
- Seed the database with 10 sample listings automatically

**First run takes 2–3 minutes** (downloading Docker images + installing packages). Subsequent runs are fast.

### Step 4 — Open the app
Go to **http://localhost:5173** in your browser.

---

## Logging In

There are two ways to log in:

**Demo Login (easiest — no setup needed):**
On the login page, enter any name and any email address. A new account is created instantly with ₹500 in the wallet. Use different email addresses to create multiple demo accounts.

**Google OAuth:**
Requires setting up Google OAuth credentials (see [Google OAuth Setup](#google-oauth-setup-optional) below). Not needed for demo purposes.

---

## Service URLs

| Service | URL | Description |
|---|---|---|
| Frontend | http://localhost:5173 | Main web app |
| API Docs | http://localhost:8000/docs | Swagger UI — explore all API endpoints |
| API | http://localhost:8000 | FastAPI backend |
| Chat Server | http://localhost:3001 | Socket.io WebSocket server |

---

## Stopping the App

Press `Ctrl+C` in the terminal where `start.sh` is running to stop all services.

To also stop the database containers:
```bash
docker-compose stop
```

To completely remove the database and start fresh:
```bash
docker-compose down -v
```

---

## Project Structure

```
useless-rental/
├── backend/          Python FastAPI — REST API, database, auth
├── chat-server/      Node.js + Socket.io — real-time chat
├── frontend/         React + Vite + Tailwind CSS — web UI
├── docker-compose.yml  PostgreSQL 15 + Redis 7
└── start.sh          One-command startup script
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend API | Python FastAPI |
| Real-time Chat | Node.js, Socket.io |
| Database | PostgreSQL 15 |
| Cache / Sessions | Redis 7 |
| Auth | Google OAuth 2.0 + JWT |
| ORM | SQLAlchemy 2.0 |

---

## Manual Setup (if start.sh doesn't work)

If the startup script fails for any reason, you can start each service manually in separate terminal windows.

**Terminal 1 — Database:**
```bash
docker-compose up -d
```

**Terminal 2 — Backend:**
```bash
cd backend
python3.13 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Terminal 3 — Chat server:**
```bash
cd chat-server
npm install
node index.js
```

**Terminal 4 — Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## Google OAuth Setup (optional)

Only needed if you want real Google login. For demo/presentation purposes, use demo login instead.

1. Go to https://console.cloud.google.com
2. Create a new project
3. Go to **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
4. Set application type to **Web application**
5. Add `http://localhost:8000/api/auth/google/callback` as an authorised redirect URI
6. Copy the Client ID and Client Secret
7. Edit `backend/.env` and fill in:
```
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```
8. Restart the backend

---

## Troubleshooting

**"Docker NOT running" error**
Open Docker Desktop and wait for the whale icon to stop animating, then try again.

**Port already in use**
Something else is using port 8000, 3001, or 5173. Find and stop it:
```bash
lsof -ti:8000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

**Database connection error**
Make sure Docker containers are running:
```bash
docker-compose ps
```
If not, run `docker-compose up -d` first.

**Permission denied on start.sh**
```bash
chmod +x start.sh
```

**Want to reset all data and start fresh:**
```bash
docker-compose down -v
docker-compose up -d
```
Then restart the backend — it will re-seed the database automatically.
