#!/bin/bash
# AI Development System - Startup Script
# This script validates the system and prepares it for use

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🤖 AI Development System"
echo "========================"
echo ""

# Check Python
echo "📦 Checking dependencies..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi
echo "   ✅ Python 3 found"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    exit 1
fi
echo "   ✅ Node.js found"

# Install npm dependencies if needed
if [ ! -d "node_modules" ]; then
    echo ""
    echo "📥 Installing npm dependencies..."
    npm install
fi

# Validate system state
echo ""
echo "🔍 Validating system state..."
python3 tools/validate.py all || true

# Sync state files
echo ""
echo "🔄 Synchronizing state..."
python3 tools/state_sync.py sync

# Check for PRD files
echo ""
echo "📄 Checking PRD files..."
PRD_COUNT=$(find prd -name "*.prd.md" 2>/dev/null | wc -l)
if [ "$PRD_COUNT" -eq 0 ]; then
    echo "   ⚠️  No PRD files found in prd/"
    echo "   Create a PRD file to start building"
else
    echo "   ✅ Found $PRD_COUNT PRD file(s)"
    find prd -name "*.prd.md" -exec echo "      - {}" \;
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ System ready!"
echo ""
echo "📋 Available Commands:"
echo "   /build-prd            Build from all PRD files"
echo "   /build-feature        Build a specific feature"
echo "   /code-review          Run code review"
echo "   /security-audit       Run security audit"
echo ""
echo "🛠️  Python Tools:"
echo "   python3 tools/parse_prd.py prd/example.prd.md"
echo "   python3 tools/task_manager.py list"
echo "   python3 tools/validate.py all"
echo "   python3 tools/state_sync.py sync"
echo ""
echo "📖 Open in VS Code with Copilot to use slash commands"
echo ""
