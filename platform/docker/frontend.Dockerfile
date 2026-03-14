# Frontend Service Dockerfile
# Multi-stage build for optimized production images

# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:20-alpine AS deps

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci && npm cache clean --force

# ============================================
# Stage 2: Builder
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./

# Copy source code
COPY services/frontend ./services/frontend
COPY tsconfig.json ./

# Build application
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build:frontend

# ============================================
# Stage 3: Production
# ============================================
FROM node:20-alpine AS production

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 frontend

# Copy built application
COPY --from=builder /app/services/frontend/.next/standalone ./
COPY --from=builder /app/services/frontend/.next/static ./services/frontend/.next/static
COPY --from=builder /app/services/frontend/public ./services/frontend/public

# Set ownership
RUN chown -R frontend:nodejs /app

# Switch to non-root user
USER frontend

# Environment
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

CMD ["node", "services/frontend/server.js"]
