#!/usr/bin/env python3
"""
Task Generator - Convert parsed PRD features into development tasks.
Usage: python3 tools/generate_tasks.py prd/example.prd.md
"""

import json
import sys
from datetime import datetime
from pathlib import Path
from typing import Any

# Import our tools
sys.path.insert(0, str(Path(__file__).parent))
from parse_prd import parse_prd
from task_manager import load_json, save_json, TASKS_FILE

# Task templates by type
TASK_TEMPLATES = [
    {"type": "architecture", "agent": "architect", "title": "Design architecture for {feature}", "priority": "critical", "deps": []},
    {"type": "database", "agent": "database", "title": "Design database schema for {feature}", "priority": "high", "deps": ["architecture"]},
    {"type": "backend", "agent": "backend", "title": "Implement backend API for {feature}", "priority": "high", "deps": ["database"]},
    {"type": "frontend", "agent": "frontend", "title": "Implement frontend UI for {feature}", "priority": "high", "deps": ["backend"]},
    {"type": "ui", "agent": "ui-designer", "title": "Design UI components for {feature}", "priority": "medium", "deps": ["architecture"]},
    {"type": "testing", "agent": "qa", "title": "Write tests for {feature}", "priority": "high", "deps": ["backend", "frontend"]},
    {"type": "security", "agent": "security", "title": "Security audit for {feature}", "priority": "high", "deps": ["testing"]},
    {"type": "review", "agent": "reviewer", "title": "Code review for {feature}", "priority": "medium", "deps": ["security"]},
]


def generate_tasks_for_feature(feature: dict, prd_file: str, task_counter: int) -> list[dict]:
    """Generate all tasks for a single feature."""
    tasks = []
    feature_id = feature["id"]
    feature_name = feature["name"]
    priority_boost = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    base_priority = feature.get("priority", "medium")
    
    # Map of type -> task_id for dependency resolution
    type_to_task = {}
    
    for template in TASK_TEMPLATES:
        task_counter += 1
        task_id = f"TASK-{task_counter:03d}"
        type_to_task[template["type"]] = task_id
        
        # Resolve dependencies to actual task IDs
        deps = []
        for dep_type in template["deps"]:
            if dep_type in type_to_task:
                deps.append(type_to_task[dep_type])
        
        task = {
            "task_id": task_id,
            "title": template["title"].format(feature=feature_name),
            "description": f"Feature: {feature_name}\n\nAcceptance Criteria:\n" + 
                          "\n".join(f"- {c}" for c in feature.get("acceptance_criteria", [])),
            "type": template["type"],
            "assigned_agent": None,
            "status": "ready" if not deps else "blocked",
            "dependencies": deps,
            "priority": template["priority"] if template["priority"] == "critical" else base_priority,
            "prd_source": prd_file,
            "feature": feature_name,
            "feature_id": feature_id,
            "files": [],
            "created_at": datetime.utcnow().isoformat() + "Z",
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }
        tasks.append(task)
    
    return tasks, task_counter


def generate_tasks_from_prd(prd_file: str) -> dict:
    """Generate all tasks from a PRD file."""
    # Parse PRD
    prd_data = parse_prd(prd_file)
    
    # Load existing tasks
    tasks_data = load_json(TASKS_FILE)
    if not tasks_data:
        tasks_data = {"version": "2.0.0", "tasks": [], "task_counter": 0}
    
    task_counter = tasks_data.get("task_counter", 0)
    all_new_tasks = []
    
    # Generate tasks for each feature
    for feature in prd_data.get("features", []):
        feature_tasks, task_counter = generate_tasks_for_feature(
            feature, prd_file, task_counter
        )
        all_new_tasks.extend(feature_tasks)
    
    # Add to tasks file
    tasks_data["tasks"].extend(all_new_tasks)
    tasks_data["task_counter"] = task_counter
    tasks_data["last_updated"] = datetime.utcnow().isoformat() + "Z"
    
    save_json(TASKS_FILE, tasks_data)
    
    # Update ready queue
    ready_tasks = [t["task_id"] for t in all_new_tasks if t["status"] == "ready"]
    ready_queue = load_json(Path("core/queues/ready.json"))
    if not ready_queue:
        ready_queue = {"version": "2.0.0", "queue": []}
    ready_queue["queue"].extend(ready_tasks)
    save_json(Path("core/queues/ready.json"), ready_queue)
    
    return {
        "prd_file": prd_file,
        "product": prd_data.get("product_name", "Unknown"),
        "features_count": len(prd_data.get("features", [])),
        "tasks_generated": len(all_new_tasks),
        "ready_tasks": len(ready_tasks),
        "blocked_tasks": len(all_new_tasks) - len(ready_tasks)
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 generate_tasks.py <prd_file>")
        sys.exit(1)
    
    result = generate_tasks_from_prd(sys.argv[1])
    print(json.dumps(result, indent=2))
