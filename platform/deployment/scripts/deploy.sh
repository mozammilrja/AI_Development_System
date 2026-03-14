#!/bin/bash

# Deploy script for AI Development System
# Usage: ./deploy.sh <environment> [--skip-tests] [--dry-run]

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$(dirname "$SCRIPT_DIR")")")"
ENVIRONMENTS_DIR="$SCRIPT_DIR/../environments"

# Parse arguments
ENVIRONMENT="${1:-}"
SKIP_TESTS=false
DRY_RUN=false

for arg in "$@"; do
    case $arg in
        --skip-tests) SKIP_TESTS=true ;;
        --dry-run) DRY_RUN=true ;;
    esac
done

# Validate environment
if [[ -z "$ENVIRONMENT" ]] || [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    echo -e "${RED}Error: Invalid environment. Use: development, staging, or production${NC}"
    exit 1
fi

echo -e "${GREEN}=== AI Development System Deployment ===${NC}"
echo "Environment: $ENVIRONMENT"
echo "Skip Tests: $SKIP_TESTS"
echo "Dry Run: $DRY_RUN"
echo ""

# Load environment configuration
ENV_FILE="$ENVIRONMENTS_DIR/$ENVIRONMENT.env"
if [[ -f "$ENV_FILE" ]]; then
    echo -e "${YELLOW}Loading environment: $ENV_FILE${NC}"
    set -a
    source "$ENV_FILE"
    set +a
else
    echo -e "${RED}Error: Environment file not found: $ENV_FILE${NC}"
    exit 1
fi

# Pre-deployment checks
echo -e "${YELLOW}Running pre-deployment checks...${NC}"

# Check required tools
for tool in docker docker-compose; do
    if ! command -v $tool &> /dev/null; then
        echo -e "${RED}Error: $tool is required but not installed${NC}"
        exit 1
    fi
done

# Run tests (unless skipped)
if [[ "$SKIP_TESTS" == "false" && "$ENVIRONMENT" != "development" ]]; then
    echo -e "${YELLOW}Running tests...${NC}"
    cd "$PROJECT_ROOT"
    
    if [[ "$DRY_RUN" == "false" ]]; then
        npm run test:unit || { echo -e "${RED}Unit tests failed${NC}"; exit 1; }
        npm run test:integration || { echo -e "${RED}Integration tests failed${NC}"; exit 1; }
    else
        echo "[DRY RUN] Would run: npm run test:unit && npm run test:integration"
    fi
fi

# Build Docker images
echo -e "${YELLOW}Building Docker images...${NC}"

if [[ "$DRY_RUN" == "false" ]]; then
    docker-compose -f "$PROJECT_ROOT/platform/docker/docker-compose.yml" \
        --env-file "$ENV_FILE" \
        build --parallel
else
    echo "[DRY RUN] Would run: docker-compose build --parallel"
fi

# Deploy based on environment
deploy_development() {
    echo -e "${YELLOW}Starting local development environment...${NC}"
    
    if [[ "$DRY_RUN" == "false" ]]; then
        docker-compose -f "$PROJECT_ROOT/platform/docker/docker-compose.yml" \
            --env-file "$ENV_FILE" \
            up -d
    else
        echo "[DRY RUN] Would run: docker-compose up -d"
    fi
}

deploy_staging() {
    echo -e "${YELLOW}Deploying to staging...${NC}"
    
    if [[ "$DRY_RUN" == "false" ]]; then
        # Push images to registry
        docker-compose -f "$PROJECT_ROOT/platform/docker/docker-compose.yml" push
        
        # Deploy to staging cluster
        kubectl apply -k "$PROJECT_ROOT/platform/infrastructure/kubernetes/overlays/staging"
        
        # Wait for rollout
        kubectl rollout status deployment/backend -n ai-dev-staging
        kubectl rollout status deployment/frontend -n ai-dev-staging
    else
        echo "[DRY RUN] Would push images and apply kubernetes manifests"
    fi
}

deploy_production() {
    echo -e "${YELLOW}Deploying to production...${NC}"
    
    # Extra confirmation for production
    if [[ "$DRY_RUN" == "false" ]]; then
        read -p "Are you sure you want to deploy to PRODUCTION? (yes/no): " confirm
        if [[ "$confirm" != "yes" ]]; then
            echo "Deployment cancelled"
            exit 0
        fi
        
        # Push images to registry
        docker-compose -f "$PROJECT_ROOT/platform/docker/docker-compose.yml" push
        
        # Deploy to production cluster
        kubectl apply -k "$PROJECT_ROOT/platform/infrastructure/kubernetes/overlays/production"
        
        # Wait for rollout
        kubectl rollout status deployment/backend -n ai-dev-production
        kubectl rollout status deployment/frontend -n ai-dev-production
    else
        echo "[DRY RUN] Would push images and apply kubernetes manifests"
    fi
}

# Execute deployment
case $ENVIRONMENT in
    development) deploy_development ;;
    staging) deploy_staging ;;
    production) deploy_production ;;
esac

# Post-deployment health check
echo -e "${YELLOW}Running health checks...${NC}"

if [[ "$DRY_RUN" == "false" ]]; then
    sleep 10
    
    case $ENVIRONMENT in
        development)
            curl -sf http://localhost:8000/health || { echo -e "${RED}Backend health check failed${NC}"; exit 1; }
            curl -sf http://localhost:3000 || { echo -e "${RED}Frontend health check failed${NC}"; exit 1; }
            ;;
        staging|production)
            # Health checks handled by kubernetes probes
            echo "Health checks passed (kubernetes probes)"
            ;;
    esac
else
    echo "[DRY RUN] Would run health checks"
fi

echo -e "${GREEN}=== Deployment Complete ===${NC}"
echo "Environment: $ENVIRONMENT"
echo "Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
