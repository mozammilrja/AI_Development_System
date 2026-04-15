#!/bin/bash
# Reset system state - clears all tasks and progress
# Usage: ./scripts/reset.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

echo "⚠️  This will reset all system state!"
read -p "Are you sure? (y/N): " confirm

if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
    echo "Cancelled."
    exit 0
fi

echo "🔄 Resetting system state..."

# Reset tasks.json
cat > core/state/tasks.json << 'EOF'
{
  "version": "2.0.0",
  "last_updated": null,
  "task_counter": 0,
  "tasks": []
}
EOF

# Reset agents.json
cat > core/state/agents.json << 'EOF'
{
  "version": "2.0.0",
  "agents": {
    "team-lead": {"status": "idle", "current_task": null, "tasks_completed": 0, "last_active": null},
    "architect": {"status": "idle", "current_task": null, "tasks_completed": 0, "last_active": null},
    "backend": {"status": "idle", "current_task": null, "tasks_completed": 0, "last_active": null},
    "frontend": {"status": "idle", "current_task": null, "tasks_completed": 0, "last_active": null},
    "ui-designer": {"status": "idle", "current_task": null, "tasks_completed": 0, "last_active": null},
    "database": {"status": "idle", "current_task": null, "tasks_completed": 0, "last_active": null},
    "devops": {"status": "idle", "current_task": null, "tasks_completed": 0, "last_active": null},
    "qa": {"status": "idle", "current_task": null, "tasks_completed": 0, "last_active": null},
    "security": {"status": "idle", "current_task": null, "tasks_completed": 0, "last_active": null},
    "performance": {"status": "idle", "current_task": null, "tasks_completed": 0, "last_active": null},
    "reviewer": {"status": "idle", "current_task": null, "tasks_completed": 0, "last_active": null}
  }
}
EOF

# Reset progress.json
cat > core/state/progress.json << 'EOF'
{
  "version": "2.0.0",
  "builds": []
}
EOF

# Reset queues
cat > core/queues/ready.json << 'EOF'
{
  "version": "2.0.0",
  "description": "Tasks ready for claiming by agents",
  "queue": []
}
EOF

cat > core/queues/working.json << 'EOF'
{
  "version": "2.0.0",
  "description": "Tasks currently being worked on",
  "queue": []
}
EOF

cat > core/queues/done.json << 'EOF'
{
  "version": "2.0.0",
  "description": "Completed tasks",
  "queue": []
}
EOF

echo "✅ System state reset complete"
