# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Use(Less)** — a peer-to-peer household item rental platform (university challenge project). Users can list, browse, rent, chat about, and review non-consumable household items. Pickup only (no delivery). Indian market (₹ INR, Razorpay-ready but wallet is simulated for demo). Hosted locally for presentations.

## Running the Project

```bash
# One-shot startup (requires Docker, Python 3, Node.js)
./start.sh

# Or manually:
docker-compose up -d                   # PostgreSQL + Redis
cd backend && source venv/bin/activate && uvicorn app.main:app --reload --port 8000
cd chat-server && node index.js        # port 3001
cd frontend && npm run dev             # port 5173
```

URLs:
- Frontend: http://localhost:5173
- API + Swagger: http://localhost:8000 / http://localhost:8000/docs
- Chat WS: http://localhost:3001

## Architecture

```
/
├── backend/          FastAPI (Python) — REST API, auth, DB
├── chat-server/      Node.js + Socket.io — real-time WebSocket chat
├── frontend/         React + Vite + Tailwind CSS
└── docker-compose.yml  PostgreSQL 15 + Redis 7
```

### Backend (FastAPI)
- **DB**: PostgreSQL via SQLAlchemy (sync). Tables auto-created on startup via `Base.metadata.create_all`.
- **Seed data**: `app/utils/seed.py` runs on startup if DB is empty — creates 3 demo users and 10 sample products.
- **Auth**: Google OAuth (authlib) + demo login endpoint (`POST /api/auth/demo-login?name=&email=`). JWTs via python-jose.
- **Wallet**: Fully simulated — `POST /api/wallet/add-funds` credits directly. No real Razorpay integration.
- **Penalty**: ₹50/day for late returns (configured in `config.py → PENALTY_PER_DAY`).
- **Uploads**: Files saved to `backend/uploads/`. Served as static files at `/uploads/`.
- **Routers**: `auth`, `users`, `products`, `rentals`, `wallet`, `chats`, `reviews` — all prefixed `/api/`.

### Chat Server (Node.js)
- Socket.io server on port 3001. Authenticates via JWT from `socket.handshake.auth.token`.
- Events: `join_chat`, `leave_chat`, `send_message`, `typing`, `stop_typing`.
- Messages are persisted via REST API (`POST /api/chats/{id}/messages`), then broadcast via socket.

### Frontend (React)
- Vite proxies `/api` and `/uploads` to `http://localhost:8000`.
- **AuthContext**: JWT stored in `localStorage`. `/api/users/me` fetched on load.
- **SocketContext**: Socket.io client connects to `http://localhost:3001` when user is logged in.
- **Protected routes**: `ProtectedRoute` component wraps auth-required pages.
- Tailwind custom components defined in `src/index.css`: `.btn-primary`, `.btn-secondary`, `.input`, `.label`, `.card`, `.badge`, `.status-*`.

## Key Business Rules
- Rental cost uses month rate if ≥28 days, week rate if ≥7 days, otherwise day rate.
- Rental charges renter (rental cost + deposit) immediately on booking.
- Owner receives rental cost (not deposit) when they approve the rental.
- Security deposit is returned to renter when owner confirms return.
- Late return penalty deducted from renter's wallet, credited to owner's wallet.
- Only one review per rental per direction (renter→product_owner, owner→renter).
- Demo login creates user with ₹500 starting balance if email not found.

## Environment Setup

Backend `.env` (copy from `.env.example`):
```
DATABASE_URL=postgresql://useless:useless123@localhost:5432/useless_db
SECRET_KEY=<random 32+ char string>
GOOGLE_CLIENT_ID=<optional — Google OAuth not needed for demo login>
FRONTEND_URL=http://localhost:5173
```

Chat server `.env` (copy from `.env.example`) — `SECRET_KEY` must match backend.
