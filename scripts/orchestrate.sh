#!/bin/bash
# Orchestrate full build from PRD
# Usage: ./scripts/orchestrate.sh prd/example.prd.md [--simulate]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

if [ -z "$1" ]; then
    echo "Usage: ./scripts/orchestrate.sh <prd_file> [--simulate]"
    echo ""
    echo "Options:"
    echo "  --simulate    Run full simulation without real agents"
    echo ""
    echo "Examples:"
    echo "  ./scripts/orchestrate.sh prd/example.prd.md"
    echo "  ./scripts/orchestrate.sh prd/example.prd.md --simulate"
    exit 1
fi

PRD_FILE="$1"
SIMULATE=""

if [ "$2" == "--simulate" ]; then
    SIMULATE="--simulate"
fi

# Reset state first
echo "🔄 Resetting system state..."
./scripts/reset.sh <<< "y"

# Run orchestrator
echo ""
python3 tools/orchestrator.py "$PRD_FILE" $SIMULATE
