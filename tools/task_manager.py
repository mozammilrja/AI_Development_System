#!/usr/bin/env python3
"""
Task Manager - CRUD operations for tasks.json with atomic updates.
Usage:
  python tools/task_manager.py list
  python tools/task_manager.py add --title "Task" --type backend --priority high
  python tools/task_manager.py update TASK-001 --status working
  python tools/task_manager.py claim TASK-001 --agent backend
  python tools/task_manager.py complete TASK-001
"""

import argparse
import fcntl
import json
import sys
from datetime import datetime
from pathlib import Path
from typing import Any

TASKS_FILE = Path("core/state/tasks.json")
READY_QUEUE = Path("core/queues/ready.json")
WORKING_QUEUE = Path("core/queues/working.json")
DONE_QUEUE = Path("core/queues/done.json")


def load_json(filepath: Path) -> dict[str, Any]:
    """Load JSON file with file locking."""
    if not filepath.exists():
        return {"version": "2.0.0", "tasks": [], "queue": []}
    
    with open(filepath, 'r') as f:
        fcntl.flock(f.fileno(), fcntl.LOCK_SH)
        try:
            return json.load(f)
        finally:
            fcntl.flock(f.fileno(), fcntl.LOCK_UN)


def save_json(filepath: Path, data: dict[str, Any]) -> None:
    """Save JSON file with file locking (atomic write)."""
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


def get_next_task_id() -> str:
    """Generate next task ID."""
    data = load_json(TASKS_FILE)
    if not data.get("tasks"):
        return "TASK-001"
    
    max_id = max(int(t["task_id"].split("-")[1]) for t in data["tasks"])
    return f"TASK-{str(max_id + 1).zfill(3)}"


def list_tasks(status: str = None, agent: str = None) -> list[dict]:
    """List tasks with optional filtering."""
    data = load_json(TASKS_FILE)
    tasks = data.get("tasks", [])
    
    if status:
        tasks = [t for t in tasks if t.get("status") == status]
    if agent:
        tasks = [t for t in tasks if t.get("assigned_agent") == agent]
    
    return tasks


def add_task(
    title: str,
    task_type: str,
    priority: str = "medium",
    description: str = "",
    dependencies: list[str] = None,
    prd_source: str = "",
    feature: str = ""
) -> dict:
    """Add a new task."""
    data = load_json(TASKS_FILE)
    
    task = {
        "task_id": get_next_task_id(),
        "title": title,
        "description": description,
        "type": task_type,
        "assigned_agent": None,
        "status": "ready",
        "dependencies": dependencies or [],
        "priority": priority,
        "prd_source": prd_source,
        "feature": feature,
        "files": [],
        "created_at": datetime.utcnow().isoformat() + "Z",
        "updated_at": datetime.utcnow().isoformat() + "Z"
    }
    
    data["tasks"].append(task)
    data["last_updated"] = datetime.utcnow().isoformat() + "Z"
    data["task_counter"] = len(data["tasks"])
    
    save_json(TASKS_FILE, data)
    
    # Add to ready queue if no dependencies
    if not dependencies:
        add_to_queue(READY_QUEUE, task["task_id"])
    
    return task


def update_task(task_id: str, **updates) -> dict:
    """Update a task's fields."""
    data = load_json(TASKS_FILE)
    
    for task in data["tasks"]:
        if task["task_id"] == task_id:
            task.update(updates)
            task["updated_at"] = datetime.utcnow().isoformat() + "Z"
            save_json(TASKS_FILE, data)
            return task
    
    raise ValueError(f"Task {task_id} not found")


def claim_task(task_id: str, agent: str) -> dict:
    """Claim a task for an agent."""
    task = update_task(task_id, assigned_agent=agent, status="working")
    
    # Move from ready to working queue
    remove_from_queue(READY_QUEUE, task_id)
    add_to_queue(WORKING_QUEUE, task_id)
    
    return task


def complete_task(task_id: str) -> dict:
    """Mark a task as complete."""
    task = update_task(task_id, status="done")
    
    # Move from working to done queue
    remove_from_queue(WORKING_QUEUE, task_id)
    add_to_queue(DONE_QUEUE, task_id)
    
    # Check if any blocked tasks can now be unblocked
    unblock_dependent_tasks(task_id)
    
    return task


def add_to_queue(queue_path: Path, task_id: str) -> None:
    """Add task to a queue."""
    data = load_json(queue_path)
    if "queue" not in data:
        data["queue"] = []
    if task_id not in data["queue"]:
        data["queue"].append(task_id)
    save_json(queue_path, data)


def remove_from_queue(queue_path: Path, task_id: str) -> None:
    """Remove task from a queue."""
    data = load_json(queue_path)
    if "queue" in data and task_id in data["queue"]:
        data["queue"].remove(task_id)
    save_json(queue_path, data)


def unblock_dependent_tasks(completed_task_id: str) -> None:
    """Check and unblock tasks that depended on completed task."""
    data = load_json(TASKS_FILE)
    done_data = load_json(DONE_QUEUE)
    done_tasks = set(done_data.get("queue", []))
    
    for task in data["tasks"]:
        if task["status"] == "ready":
            continue
        
        deps = task.get("dependencies", [])
        if deps and all(d in done_tasks for d in deps):
            if task["status"] == "blocked":
                task["status"] = "ready"
                add_to_queue(READY_QUEUE, task["task_id"])
    
    save_json(TASKS_FILE, data)


def main():
    parser = argparse.ArgumentParser(description="Task Manager")
    subparsers = parser.add_subparsers(dest="command", required=True)
    
    # List command
    list_parser = subparsers.add_parser("list", help="List tasks")
    list_parser.add_argument("--status", help="Filter by status")
    list_parser.add_argument("--agent", help="Filter by agent")
    
    # Add command
    add_parser = subparsers.add_parser("add", help="Add a task")
    add_parser.add_argument("--title", required=True)
    add_parser.add_argument("--type", required=True, dest="task_type")
    add_parser.add_argument("--priority", default="medium")
    add_parser.add_argument("--description", default="")
    add_parser.add_argument("--dependencies", nargs="*", default=[])
    add_parser.add_argument("--prd", default="")
    add_parser.add_argument("--feature", default="")
    
    # Update command
    update_parser = subparsers.add_parser("update", help="Update a task")
    update_parser.add_argument("task_id")
    update_parser.add_argument("--status")
    update_parser.add_argument("--agent")
    
    # Claim command
    claim_parser = subparsers.add_parser("claim", help="Claim a task")
    claim_parser.add_argument("task_id")
    claim_parser.add_argument("--agent", required=True)
    
    # Complete command
    complete_parser = subparsers.add_parser("complete", help="Complete a task")
    complete_parser.add_argument("task_id")
    
    args = parser.parse_args()
    
    if args.command == "list":
        tasks = list_tasks(args.status, args.agent)
        print(json.dumps(tasks, indent=2))
    
    elif args.command == "add":
        task = add_task(
            title=args.title,
            task_type=args.task_type,
            priority=args.priority,
            description=args.description,
            dependencies=args.dependencies,
            prd_source=args.prd,
            feature=args.feature
        )
        print(json.dumps(task, indent=2))
    
    elif args.command == "update":
        updates = {}
        if args.status:
            updates["status"] = args.status
        if args.agent:
            updates["assigned_agent"] = args.agent
        task = update_task(args.task_id, **updates)
        print(json.dumps(task, indent=2))
    
    elif args.command == "claim":
        task = claim_task(args.task_id, args.agent)
        print(json.dumps(task, indent=2))
    
    elif args.command == "complete":
        task = complete_task(args.task_id)
        print(json.dumps(task, indent=2))


if __name__ == "__main__":
    main()
