# Multi-stage build for ai-dev-system
FROM python:3.11-slim AS python-base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Install system deps
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

# Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ---------- Backend stage ----------
FROM python-base AS backend

COPY services/backend/ ./services/backend/
COPY orchestration/ ./orchestration/
COPY models/ ./models/
COPY agents/ ./agents/
COPY workflows/ ./workflows/
COPY rag/ ./rag/
COPY tools/ ./tools/
COPY tool_registry/ ./tool_registry/
COPY governance/ ./governance/
COPY observability/ ./observability/
COPY learning/ ./learning/
COPY configs/ ./configs/
COPY scripts/ ./scripts/

EXPOSE 8000

CMD ["uvicorn", "services.backend.main:app", "--host", "0.0.0.0", "--port", "8000"]

# ---------- Frontend stage ----------
FROM node:20-slim AS frontend-deps

WORKDIR /app
COPY package.json ./
RUN npm install --production

FROM node:20-slim AS frontend

WORKDIR /app
COPY --from=frontend-deps /app/node_modules ./node_modules
COPY package.json ./
COPY services/frontend/ ./services/frontend/

EXPOSE 3000

CMD ["npm", "start"]
