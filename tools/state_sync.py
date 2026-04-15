#!/usr/bin/env python3
"""
State Synchronization - Atomic updates to agent and progress state.
Usage:
  python tools/state_sync.py agent-status backend working TASK-001
  python tools/state_sync.py progress start example.prd.md
  python tools/state_sync.py progress update --completed 5 --total 10
  python tools/state_sync.py sync  # Sync all state files
"""

import argparse
import fcntl
import json
import sys
from datetime import datetime
from pathlib import Path
from typing import Any

STATE_DIR = Path("core/state")
AGENTS_FILE = STATE_DIR / "agents.json"
PROGRESS_FILE = STATE_DIR / "progress.json"
TASKS_FILE = STATE_DIR / "tasks.json"
QUEUES_DIR = Path("core/queues")


def load_json(filepath: Path) -> dict[str, Any]:
    """Load JSON file with file locking."""
    if not filepath.exists():
        return {}
    
    with open(filepath, 'r') as f:
        fcntl.flock(f.fileno(), fcntl.LOCK_SH)
        try:
            return json.load(f)
        finally:
            fcntl.flock(f.fileno(), fcntl.LOCK_UN)


def save_json(filepath: Path, data: dict[str, Any]) -> None:
    """Save JSON file with atomic write."""
    filepath.parent.mkdir(parents=True, exist_ok=True)
    temp_path = filepath.with_suffix('.tmp')
    
    with open(temp_path, 'w') as f:
        fcntl.flock(f.fileno(), fcntl.LOCK_EX)
        try:
            json.dump(data, f, indent=2)
            f.flush()
        finally:
            fcntl.flock(f.fileno(), fcntl.LOCK_UN)
    
    temp_path.rename(filepath)


def update_agent_status(
    agent: str,
    status: str,
    current_task: str = None,
    action: str = None
) -> dict:
    """Update an agent's status."""
    data = load_json(AGENTS_FILE)
    
    if "agents" not in data:
        data["agents"] = {}
    
    if agent not in data["agents"]:
        data["agents"][agent] = {
            "status": "idle",
            "current_task": None,
            "tasks_completed": 0,
            "last_active": None
        }
    
    agent_data = data["agents"][agent]
    agent_data["status"] = status
    agent_data["current_task"] = current_task
    agent_data["last_active"] = datetime.utcnow().isoformat() + "Z"
    
    if action:
        agent_data["last_action"] = action
    
    if status == "idle" and agent_data.get("current_task"):
        agent_data["tasks_completed"] = agent_data.get("tasks_completed", 0) + 1
    
    save_json(AGENTS_FILE, data)
    return agent_data


def start_build(prd_file: str) -> dict:
    """Start a new build from a PRD file."""
    data = load_json(PROGRESS_FILE)
    
    if "builds" not in data:
        data["builds"] = []
    
    build = {
        "id": f"BUILD-{len(data['builds']) + 1:03d}",
        "prd_file": prd_file,
        "status": "started",
        "phase": "parsing",
        "total_tasks": 0,
        "completed_tasks": 0,
        "started_at": datetime.utcnow().isoformat() + "Z",
        "updated_at": datetime.utcnow().isoformat() + "Z"
    }
    
    data["builds"].append(build)
    data["current_build"] = build["id"]
    
    save_json(PROGRESS_FILE, data)
    return build


def update_progress(
    completed: int = None,
    total: int = None,
    phase: str = None,
    status: str = None
) -> dict:
    """Update current build progress."""
    data = load_json(PROGRESS_FILE)
    
    if not data.get("builds"):
        raise ValueError("No active build")
    
    # Find current build
    current_id = data.get("current_build")
    build = None
    for b in data["builds"]:
        if b["id"] == current_id:
            build = b
            break
    
    if not build:
        build = data["builds"][-1]
    
    if completed is not None:
        build["completed_tasks"] = completed
    if total is not None:
        build["total_tasks"] = total
    if phase is not None:
        build["phase"] = phase
    if status is not None:
        build["status"] = status
    
    build["updated_at"] = datetime.utcnow().isoformat() + "Z"
    
    # Calculate percentage
    if build["total_tasks"] > 0:
        build["progress_percent"] = round(
            (build["completed_tasks"] / build["total_tasks"]) * 100, 1
        )
    
    save_json(PROGRESS_FILE, data)
    return build


def sync_state() -> dict:
    """Synchronize all state files - ensure consistency."""
    tasks_data = load_json(TASKS_FILE)
    agents_data = load_json(AGENTS_FILE)
    
    ready_queue = load_json(QUEUES_DIR / "ready.json")
    working_queue = load_json(QUEUES_DIR / "working.json")
    done_queue = load_json(QUEUES_DIR / "done.json")
    
    tasks = tasks_data.get("tasks", [])
    
    # Rebuild queues from task statuses
    ready_ids = []
    working_ids = []
    done_ids = []
    
    for task in tasks:
        task_id = task["task_id"]
        status = task["status"]
        
        if status == "ready":
            ready_ids.append(task_id)
        elif status == "working":
            working_ids.append(task_id)
        elif status == "done":
            done_ids.append(task_id)
    
    # Update queues
    ready_queue["queue"] = ready_ids
    working_queue["queue"] = working_ids
    done_queue["queue"] = done_ids
    
    save_json(QUEUES_DIR / "ready.json", ready_queue)
    save_json(QUEUES_DIR / "working.json", working_queue)
    save_json(QUEUES_DIR / "done.json", done_queue)
    
    # Update agent statuses based on tasks
    for agent_name, agent_info in agents_data.get("agents", {}).items():
        current_task = agent_info.get("current_task")
        if current_task:
            # Check if task is still in working
            task = next((t for t in tasks if t["task_id"] == current_task), None)
            if not task or task["status"] != "working":
                agent_info["status"] = "idle"
                agent_info["current_task"] = None
    
    save_json(AGENTS_FILE, agents_data)
    
    return {
        "ready": len(ready_ids),
        "working": len(working_ids),
        "done": len(done_ids),
        "total_tasks": len(tasks)
    }


def main():
    parser = argparse.ArgumentParser(description="State Synchronization")
    subparsers = parser.add_subparsers(dest="command", required=True)
    
    # Agent status command
    agent_parser = subparsers.add_parser("agent-status", help="Update agent status")
    agent_parser.add_argument("agent", help="Agent name")
    agent_parser.add_argument("status", choices=["idle", "working", "blocked", "error"])
    agent_parser.add_argument("task_id", nargs="?", help="Current task ID")
    agent_parser.add_argument("--action", help="Description of action")
    
    # Progress commands
    progress_parser = subparsers.add_parser("progress", help="Update build progress")
    progress_sub = progress_parser.add_subparsers(dest="progress_cmd", required=True)
    
    start_parser = progress_sub.add_parser("start", help="Start a build")
    start_parser.add_argument("prd_file", help="PRD file name")
    
    update_parser = progress_sub.add_parser("update", help="Update progress")
    update_parser.add_argument("--completed", type=int)
    update_parser.add_argument("--total", type=int)
    update_parser.add_argument("--phase")
    update_parser.add_argument("--status")
    
    # Sync command
    subparsers.add_parser("sync", help="Synchronize all state files")
    
    args = parser.parse_args()
    
    if args.command == "agent-status":
        result = update_agent_status(
            args.agent,
            args.status,
            args.task_id,
            getattr(args, 'action', None)
        )
        print(json.dumps(result, indent=2))
    
    elif args.command == "progress":
        if args.progress_cmd == "start":
            result = start_build(args.prd_file)
        else:
            result = update_progress(
                completed=args.completed,
                total=args.total,
                phase=args.phase,
                status=args.status
            )
        print(json.dumps(result, indent=2))
    
    elif args.command == "sync":
        result = sync_state()
        print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
