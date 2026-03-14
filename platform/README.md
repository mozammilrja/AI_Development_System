# platform/

## Purpose

Infrastructure and deployment configurations for the AI Development System.

## Ownership

**DevOps Engineer Agent** has exclusive write access to this directory.

## Structure

```
platform/
├── docker/                    # Container configurations
│   ├── backend.Dockerfile     # Backend service image
│   ├── frontend.Dockerfile    # Frontend service image
│   ├── docker-compose.dev.yml # Development environment
│   └── docker-compose.yml     # Base compose file
├── deployment/                # Deployment configurations
│   ├── environments/          # Environment configs
│   │   ├── development.env
│   │   ├── staging.env
│   │   └── production.env
│   ├── pipelines/             # CI/CD pipelines
│   │   └── ci-cd.yaml         # GitHub Actions workflow
│   └── scripts/               # Deployment scripts
│       ├── deploy.sh
│       └── rollback.sh
├── infrastructure/            # Infrastructure as Code
│   ├── terraform/             # AWS infrastructure
│   │   ├── main.tf
│   │   └── environments/
│   └── kubernetes/            # K8s manifests
│       ├── base/
│       └── overlays/
└── terraform/                 # Legacy terraform location
```

## Quick Start

### Local Development

```bash
# Start all services
cd platform/docker
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

### Deployment

```bash
# Deploy to staging
./platform/deployment/scripts/deploy.sh staging

# Deploy to production
./platform/deployment/scripts/deploy.sh production

# Rollback
./platform/deployment/scripts/rollback.sh production
```

### Infrastructure

```bash
# Initialize Terraform
cd platform/infrastructure/terraform
terraform init

# Plan staging
terraform plan -var-file=environments/staging.tfvars

# Apply
terraform apply -var-file=environments/staging.tfvars
```

## Environments

| Environment | Purpose | Resources |
|-------------|---------|-----------|
| Development | Local dev | Docker Compose |
| Staging | Pre-prod testing | EKS (scaled down) |
| Production | Live system | EKS (full scale) |

## CI/CD Pipeline

```
Code Push → Lint → Test → Build → Deploy Staging → E2E → Deploy Production
```

See [pipelines/ci-cd.yaml](deployment/pipelines/ci-cd.yaml) for full workflow.
