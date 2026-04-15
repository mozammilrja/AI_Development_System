#!/bin/bash
# Show system status
# Usage: ./scripts/status.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

echo "📊 AI Development System Status"
echo "================================"
echo ""

# Task counts
TASKS_FILE="core/state/tasks.json"
if [ -f "$TASKS_FILE" ]; then
    TOTAL=$(python3 -c "import json; d=json.load(open('$TASKS_FILE')); print(len(d.get('tasks', [])))")
    READY=$(python3 -c "import json; d=json.load(open('$TASKS_FILE')); print(len([t for t in d.get('tasks', []) if t.get('status')=='ready']))")
    WORKING=$(python3 -c "import json; d=json.load(open('$TASKS_FILE')); print(len([t for t in d.get('tasks', []) if t.get('status')=='working']))")
    DONE=$(python3 -c "import json; d=json.load(open('$TASKS_FILE')); print(len([t for t in d.get('tasks', []) if t.get('status')=='done']))")
    
    echo "📋 Tasks:"
    echo "   Total:   $TOTAL"
    echo "   Ready:   $READY"
    echo "   Working: $WORKING"
    echo "   Done:    $DONE"
else
    echo "📋 Tasks: No tasks file found"
fi

echo ""

# Agent status
AGENTS_FILE="core/state/agents.json"
if [ -f "$AGENTS_FILE" ]; then
    echo "🤖 Agents:"
    python3 -c "
import json
d = json.load(open('$AGENTS_FILE'))
for name, info in d.get('agents', {}).items():
    status = info.get('status', 'unknown')
    task = info.get('current_task', '-')
    completed = info.get('tasks_completed', 0)
    icon = '🟢' if status == 'idle' else '🔵' if status == 'working' else '🔴'
    print(f'   {icon} {name}: {status} (completed: {completed})')
"
else
    echo "🤖 Agents: No agents file found"
fi

echo ""

# PRD files
echo "📄 PRD Files:"
find prd -name "*.prd.md" 2>/dev/null | while read f; do
    echo "   - $f"
done || echo "   None found"

echo ""

# Validation
echo "🔍 Validation:"
python3 tools/validate.py all 2>/dev/null || echo "   Run: python3 tools/validate.py all"
