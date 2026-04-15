#!/usr/bin/env python3
"""
Validator - Validate JSON files against schemas and check system integrity.
Usage:
  python tools/validate.py tasks     # Validate tasks.json
  python tools/validate.py agents    # Validate agents.json
  python tools/validate.py progress  # Validate progress.json
  python tools/validate.py all       # Validate everything
  python tools/validate.py integrity # Check system integrity
"""

import argparse
import json
import sys
from pathlib import Path
from typing import Any

# Schema definitions (inline for simplicity)
TASK_SCHEMA = {
    "required": ["task_id", "title", "status", "priority"],
    "types": {
        "task_id": str,
        "title": str,
        "description": str,
        "type": str,
        "assigned_agent": (str, type(None)),
        "status": str,
        "dependencies": list,
        "priority": str,
        "prd_source": str,
        "feature": str,
        "files": list,
        "created_at": str,
        "updated_at": str
    },
    "enums": {
        "status": ["ready", "working", "done", "blocked"],
        "priority": ["critical", "high", "medium", "low"],
        "type": ["architecture", "database", "backend", "frontend", "ui", 
                 "devops", "testing", "security", "performance", "review"]
    }
}

AGENT_SCHEMA = {
    "valid_agents": [
        "team-lead", "architect", "backend", "frontend", "ui-designer",
        "database", "devops", "qa", "security", "performance", "reviewer"
    ],
    "valid_statuses": ["idle", "working", "blocked", "error"]
}


def load_json(filepath: Path) -> dict[str, Any]:
    """Load JSON file."""
    if not filepath.exists():
        return None
    with open(filepath, 'r') as f:
        return json.load(f)


def validate_task(task: dict) -> list[str]:
    """Validate a single task against schema."""
    errors = []
    
    # Check required fields
    for field in TASK_SCHEMA["required"]:
        if field not in task:
            errors.append(f"Missing required field: {field}")
    
    # Check types
    for field, expected_type in TASK_SCHEMA["types"].items():
        if field in task:
            if isinstance(expected_type, tuple):
                if not isinstance(task[field], expected_type):
                    errors.append(f"Field '{field}' has wrong type: expected {expected_type}, got {type(task[field])}")
            elif not isinstance(task[field], expected_type):
                errors.append(f"Field '{field}' has wrong type: expected {expected_type.__name__}, got {type(task[field]).__name__}")
    
    # Check enums
    for field, valid_values in TASK_SCHEMA["enums"].items():
        if field in task and task[field] not in valid_values:
            errors.append(f"Invalid value for '{field}': '{task[field]}'. Valid: {valid_values}")
    
    # Check task_id format
    if "task_id" in task:
        import re
        if not re.match(r'^TASK-\d{3}$', task["task_id"]):
            errors.append(f"Invalid task_id format: '{task['task_id']}'. Expected: TASK-XXX")
    
    return errors


def validate_tasks_file() -> tuple[bool, list[str]]:
    """Validate tasks.json."""
    filepath = Path("core/state/tasks.json")
    data = load_json(filepath)
    
    if data is None:
        return False, ["tasks.json not found"]
    
    all_errors = []
    
    # Check version
    if "version" not in data:
        all_errors.append("Missing 'version' field")
    
    # Validate each task
    tasks = data.get("tasks", [])
    task_ids = set()
    
    for i, task in enumerate(tasks):
        errors = validate_task(task)
        for error in errors:
            all_errors.append(f"Task {i} ({task.get('task_id', 'unknown')}): {error}")
        
        # Check for duplicate IDs
        task_id = task.get("task_id")
        if task_id:
            if task_id in task_ids:
                all_errors.append(f"Duplicate task_id: {task_id}")
            task_ids.add(task_id)
    
    return len(all_errors) == 0, all_errors


def validate_agents_file() -> tuple[bool, list[str]]:
    """Validate agents.json."""
    filepath = Path("core/state/agents.json")
    data = load_json(filepath)
    
    if data is None:
        return False, ["agents.json not found"]
    
    all_errors = []
    
    agents = data.get("agents", {})
    for agent_name, agent_data in agents.items():
        if agent_name not in AGENT_SCHEMA["valid_agents"]:
            all_errors.append(f"Unknown agent: {agent_name}")
        
        status = agent_data.get("status")
        if status and status not in AGENT_SCHEMA["valid_statuses"]:
            all_errors.append(f"Agent '{agent_name}' has invalid status: {status}")
    
    return len(all_errors) == 0, all_errors


def validate_progress_file() -> tuple[bool, list[str]]:
    """Validate progress.json."""
    filepath = Path("core/state/progress.json")
    data = load_json(filepath)
    
    if data is None:
        return False, ["progress.json not found"]
    
    all_errors = []
    
    builds = data.get("builds", [])
    for i, build in enumerate(builds):
        if "id" not in build:
            all_errors.append(f"Build {i}: Missing 'id' field")
        if "status" not in build:
            all_errors.append(f"Build {i}: Missing 'status' field")
    
    return len(all_errors) == 0, all_errors


def check_integrity() -> tuple[bool, list[str]]:
    """Check overall system integrity."""
    errors = []
    
    # Load all state
    tasks_data = load_json(Path("core/state/tasks.json"))
    agents_data = load_json(Path("core/state/agents.json"))
    ready_queue = load_json(Path("core/queues/ready.json"))
    working_queue = load_json(Path("core/queues/working.json"))
    done_queue = load_json(Path("core/queues/done.json"))
    
    if not tasks_data:
        errors.append("Cannot load tasks.json")
        return False, errors
    
    tasks = {t["task_id"]: t for t in tasks_data.get("tasks", [])}
    
    # Check queue consistency
    for queue_name, queue_data in [
        ("ready", ready_queue),
        ("working", working_queue),
        ("done", done_queue)
    ]:
        if queue_data:
            for task_id in queue_data.get("queue", []):
                if task_id not in tasks:
                    errors.append(f"Queue '{queue_name}' contains unknown task: {task_id}")
                elif tasks[task_id]["status"] != queue_name.replace("ready", "ready"):
                    expected_status = "done" if queue_name == "done" else queue_name
                    actual_status = tasks[task_id]["status"]
                    if actual_status != expected_status:
                        errors.append(
                            f"Task {task_id} in '{queue_name}' queue but has status '{actual_status}'"
                        )
    
    # Check agent-task consistency
    if agents_data:
        for agent_name, agent_data in agents_data.get("agents", {}).items():
            current_task = agent_data.get("current_task")
            if current_task:
                if current_task not in tasks:
                    errors.append(f"Agent '{agent_name}' working on unknown task: {current_task}")
                elif tasks[current_task]["status"] != "working":
                    errors.append(
                        f"Agent '{agent_name}' claims task {current_task} but task status is '{tasks[current_task]['status']}'"
                    )
    
    # Check dependency chains
    for task_id, task in tasks.items():
        for dep_id in task.get("dependencies", []):
            if dep_id not in tasks:
                errors.append(f"Task {task_id} depends on unknown task: {dep_id}")
    
    return len(errors) == 0, errors


def main():
    parser = argparse.ArgumentParser(description="System Validator")
    parser.add_argument(
        "target",
        choices=["tasks", "agents", "progress", "all", "integrity"],
        help="What to validate"
    )
    parser.add_argument("--json", action="store_true", help="Output as JSON")
    
    args = parser.parse_args()
    
    results = {}
    
    if args.target in ["tasks", "all"]:
        valid, errors = validate_tasks_file()
        results["tasks"] = {"valid": valid, "errors": errors}
    
    if args.target in ["agents", "all"]:
        valid, errors = validate_agents_file()
        results["agents"] = {"valid": valid, "errors": errors}
    
    if args.target in ["progress", "all"]:
        valid, errors = validate_progress_file()
        results["progress"] = {"valid": valid, "errors": errors}
    
    if args.target in ["integrity", "all"]:
        valid, errors = check_integrity()
        results["integrity"] = {"valid": valid, "errors": errors}
    
    # Output
    if args.json:
        print(json.dumps(results, indent=2))
    else:
        all_valid = True
        for name, result in results.items():
            status = "✅" if result["valid"] else "❌"
            print(f"{status} {name.upper()}")
            for error in result["errors"]:
                print(f"   - {error}")
            if not result["valid"]:
                all_valid = False
        
        print()
        if all_valid:
            print("✅ All validations passed")
        else:
            print("❌ Some validations failed")
            sys.exit(1)


if __name__ == "__main__":
    main()
