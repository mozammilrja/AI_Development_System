#!/bin/bash

# Rollback script for AI Development System
# Usage: ./rollback.sh <environment> [--revision <number>]

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Parse arguments
ENVIRONMENT="${1:-}"
REVISION=""

shift || true
while [[ $# -gt 0 ]]; do
    case $1 in
        --revision)
            REVISION="$2"
            shift 2
            ;;
        *)
            shift
            ;;
    esac
done

# Validate environment
if [[ -z "$ENVIRONMENT" ]] || [[ ! "$ENVIRONMENT" =~ ^(staging|production)$ ]]; then
    echo -e "${RED}Error: Invalid environment. Use: staging or production${NC}"
    exit 1
fi

echo -e "${YELLOW}=== AI Development System Rollback ===${NC}"
echo "Environment: $ENVIRONMENT"
echo "Revision: ${REVISION:-previous}"
echo ""

# Get namespace
case $ENVIRONMENT in
    staging) NAMESPACE="ai-dev-staging" ;;
    production) NAMESPACE="ai-dev-production" ;;
esac

# Confirmation for production
if [[ "$ENVIRONMENT" == "production" ]]; then
    read -p "Are you sure you want to rollback PRODUCTION? (yes/no): " confirm
    if [[ "$confirm" != "yes" ]]; then
        echo "Rollback cancelled"
        exit 0
    fi
fi

# Show rollout history
echo -e "${YELLOW}Current rollout history:${NC}"
kubectl rollout history deployment/backend -n "$NAMESPACE"
kubectl rollout history deployment/frontend -n "$NAMESPACE"

# Perform rollback
echo -e "${YELLOW}Performing rollback...${NC}"

if [[ -n "$REVISION" ]]; then
    kubectl rollout undo deployment/backend -n "$NAMESPACE" --to-revision="$REVISION"
    kubectl rollout undo deployment/frontend -n "$NAMESPACE" --to-revision="$REVISION"
else
    kubectl rollout undo deployment/backend -n "$NAMESPACE"
    kubectl rollout undo deployment/frontend -n "$NAMESPACE"
fi

# Wait for rollout
echo -e "${YELLOW}Waiting for rollout to complete...${NC}"
kubectl rollout status deployment/backend -n "$NAMESPACE"
kubectl rollout status deployment/frontend -n "$NAMESPACE"

echo -e "${GREEN}=== Rollback Complete ===${NC}"
echo "Environment: $ENVIRONMENT"
echo "Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
