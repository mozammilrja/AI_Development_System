# Apps Backend — Claude Context

## Purpose
Backend services for the primary application workspace.

## Technology
- Node.js with TypeScript (strict mode)
- PostgreSQL for persistence
- Redis for caching
- Docker Compose for local development

## Conventions
- Async/await for all I/O
- Parameterized queries only — no string concatenation in SQL
- Validate all inputs at API boundaries with Zod
- Environment variables for all configuration — no hardcoded secrets
