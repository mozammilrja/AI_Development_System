#!/bin/bash
# Build from PRD files
# Usage: ./scripts/build.sh [prd_file]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

echo "🏗️  Starting build process..."

# Parse PRD files
if [ -n "$1" ]; then
    echo "📄 Parsing: $1"
    python3 tools/parse_prd.py "$1"
else
    echo "📄 Parsing all PRD files..."
    python3 tools/parse_prd.py
fi

# Validate state before build
echo "🔍 Validating system state..."
python3 tools/validate.py all

# Sync state
echo "🔄 Syncing state..."
python3 tools/state_sync.py sync

echo ""
echo "✅ Build preparation complete"
echo "   Now run /build-prd in VS Code Copilot"
