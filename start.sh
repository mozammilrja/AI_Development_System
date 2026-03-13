#!/bin/bash
# Start the full ChatHub application

set -e

echo "🚀 Starting ChatHub Application..."

# 1. Start Docker services (MongoDB, MinIO)
echo "📦 Starting Docker containers..."
docker-compose up -d mongodb minio 2>/dev/null || docker compose up -d mongodb minio

# 2. Wait for services to be healthy
echo "⏳ Waiting for services..."
sleep 5

# 3. Check Redis
if ! pgrep -f "redis-server" > /dev/null; then
    echo "🔴 Redis not running. Starting..."
    redis-server --daemonize yes 2>/dev/null || echo "⚠️  Please start Redis manually"
fi

# 4. Start Backend
echo "🔧 Starting backend..."
cd app/backend
npm run dev &
BACKEND_PID=$!
cd ../..

# 5. Wait for backend
sleep 3

# 6. Start Frontend
echo "🎨 Starting frontend..."
cd app/frontend
npm run dev &
FRONTEND_PID=$!
cd ../..

echo ""
echo "✅ Application started!"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for processes
wait
