#!/bin/bash
set -e

echo "🚀 Starting Use(Less)..."

# Start PostgreSQL + Redis via Docker
echo "▶ Starting database services..."
docker-compose up -d

echo "⏳ Waiting for PostgreSQL to be ready..."
until docker-compose exec -T db pg_isready -U useless -d useless_db 2>/dev/null; do
  sleep 1
done
echo "✅ Database ready"

# Backend
echo "▶ Starting FastAPI backend..."
cd backend
[ ! -d "venv" ] && python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt -q
cp -n .env.example .env 2>/dev/null || true
uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

# Chat server
echo "▶ Starting chat server..."
cd chat-server
[ ! -d "node_modules" ] && npm install
cp -n .env.example .env 2>/dev/null || true
node index.js &
CHAT_PID=$!
cd ..

# Frontend
echo "▶ Starting frontend..."
cd frontend
[ ! -d "node_modules" ] && npm install
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Use(Less) is running!"
echo "   Frontend: http://localhost:5173"
echo "   API:      http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo "   Chat:     http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop all services."

trap "kill $BACKEND_PID $CHAT_PID $FRONTEND_PID 2>/dev/null; docker-compose stop" INT
wait
