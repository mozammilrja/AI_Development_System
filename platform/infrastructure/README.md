# Platform Infrastructure

## Purpose

Contains all infrastructure-as-code and container definitions for deploying the AI Development System and its application workspaces.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `docker/` | Docker Compose stack and multi-stage Dockerfile |
| `terraform/` | AWS infrastructure (VPC, subnets, RDS PostgreSQL) |

## Docker Services

| Service | Image | Port |
|---------|-------|------|
| backend | Python 3.11 (Uvicorn) | 8000 |
| frontend | Node 20 | 3000 |
| postgres | PostgreSQL 16 Alpine | 5432 |
| redis | Redis 7 Alpine | 6379 |
| chromadb | ChromaDB | 8001 |

## Terraform Resources

- **VPC**: `10.0.0.0/16` with public and private subnets
- **RDS**: PostgreSQL 16, `db.t3.micro`, 20 GB storage
- **Region**: `us-east-1`

## Owner

**DevOps** agent owns all files in this directory.
