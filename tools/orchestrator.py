#!/usr/bin/env python3
"""
Workflow Orchestrator - Main engine that runs the entire build process.
Usage: python3 tools/orchestrator.py prd/example.prd.md
       python3 tools/orchestrator.py --resume
       python3 tools/orchestrator.py --status
"""

import argparse
import json
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).parent))
from task_manager import load_json, save_json, TASKS_FILE, READY_QUEUE, WORKING_QUEUE, DONE_QUEUE
from state_sync import update_agent_status, start_build, update_progress, sync_state
from generate_tasks import generate_tasks_from_prd
from validate import check_integrity

PROGRESS_FILE = Path("core/state/progress.json")
AGENTS_FILE = Path("core/state/agents.json")

# Agent capabilities mapping
AGENT_CAPABILITIES = {
    "architect": ["architecture"],
    "database": ["database"],
    "backend": ["backend"],
    "frontend": ["frontend"],
    "ui-designer": ["ui"],
    "qa": ["testing"],
    "security": ["security"],
    "performance": ["performance"],
    "reviewer": ["review"],
    "devops": ["devops"],
}


def get_available_agents() -> list[str]:
    """Get list of idle agents."""
    data = load_json(AGENTS_FILE)
    if not data:
        return []
    
    available = []
    for agent, info in data.get("agents", {}).items():
        if info.get("status") == "idle":
            available.append(agent)
    return available


def get_ready_tasks() -> list[dict]:
    """Get tasks that are ready to be worked on."""
    tasks_data = load_json(TASKS_FILE)
    done_data = load_json(DONE_QUEUE)
    done_ids = set(done_data.get("queue", []))
    
    ready = []
    for task in tasks_data.get("tasks", []):
        if task["status"] == "ready":
            ready.append(task)
        elif task["status"] == "blocked":
            # Check if dependencies are done
            deps = task.get("dependencies", [])
            if deps and all(d in done_ids for d in deps):
                task["status"] = "ready"
                ready.append(task)
    
    # Sort by priority
    priority_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    ready.sort(key=lambda t: priority_order.get(t.get("priority", "medium"), 2))
    
    return ready


def assign_task_to_agent(task: dict, agent: str) -> bool:
    """Assign a task to an agent."""
    tasks_data = load_json(TASKS_FILE)
    
    for t in tasks_data["tasks"]:
        if t["task_id"] == task["task_id"]:
            t["assigned_agent"] = agent
            t["status"] = "working"
            t["started_at"] = datetime.utcnow().isoformat() + "Z"
            t["updated_at"] = datetime.utcnow().isoformat() + "Z"
            break
    
    save_json(TASKS_FILE, tasks_data)
    
    # Update queues
    ready_data = load_json(READY_QUEUE)
    if task["task_id"] in ready_data.get("queue", []):
        ready_data["queue"].remove(task["task_id"])
        save_json(READY_QUEUE, ready_data)
    
    working_data = load_json(WORKING_QUEUE)
    working_data["queue"].append(task["task_id"])
    save_json(WORKING_QUEUE, working_data)
    
    # Update agent status
    update_agent_status(agent, "working", task["task_id"], f"Working on {task['title']}")
    
    return True


def find_agent_for_task(task: dict, available_agents: list[str]) -> str | None:
    """Find an available agent that can handle this task type."""
    task_type = task.get("type", "")
    
    for agent in available_agents:
        capabilities = AGENT_CAPABILITIES.get(agent, [])
        if task_type in capabilities:
            return agent
    
    return None


def get_workflow_status() -> dict:
    """Get current workflow status."""
    tasks_data = load_json(TASKS_FILE)
    agents_data = load_json(AGENTS_FILE)
    progress_data = load_json(PROGRESS_FILE)
    
    tasks = tasks_data.get("tasks", [])
    
    status = {
        "total_tasks": len(tasks),
        "by_status": {
            "ready": len([t for t in tasks if t["status"] == "ready"]),
            "working": len([t for t in tasks if t["status"] == "working"]),
            "done": len([t for t in tasks if t["status"] == "done"]),
            "blocked": len([t for t in tasks if t["status"] == "blocked"]),
        },
        "agents": {},
        "current_build": None,
        "progress_percent": 0
    }
    
    # Agent statuses
    for agent, info in agents_data.get("agents", {}).items():
        status["agents"][agent] = {
            "status": info.get("status", "unknown"),
            "current_task": info.get("current_task"),
            "completed": info.get("tasks_completed", 0)
        }
    
    # Build progress
    builds = progress_data.get("builds", [])
    if builds:
        current = builds[-1]
        status["current_build"] = current.get("id")
        total = status["total_tasks"]
        done = status["by_status"]["done"]
        status["progress_percent"] = round((done / total * 100) if total > 0 else 0, 1)
    
    return status


def run_orchestration_step() -> dict:
    """Run one step of the orchestration loop."""
    result = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "actions": [],
        "completed": False
    }
    
    # Get current state
    ready_tasks = get_ready_tasks()
    available_agents = get_available_agents()
    
    if not ready_tasks and not load_json(WORKING_QUEUE).get("queue"):
        result["completed"] = True
        result["actions"].append("All tasks completed!")
        return result
    
    # Assign tasks to agents
    for task in ready_tasks:
        if not available_agents:
            break
        
        agent = find_agent_for_task(task, available_agents)
        if agent:
            assign_task_to_agent(task, agent)
            available_agents.remove(agent)
            result["actions"].append(f"Assigned {task['task_id']} to {agent}")
    
    # Update progress
    status = get_workflow_status()
    update_progress(
        completed=status["by_status"]["done"],
        total=status["total_tasks"],
        phase="implementation"
    )
    
    return result


def simulate_task_completion(task_id: str) -> dict:
    """Simulate completing a task (for testing without real agents)."""
    tasks_data = load_json(TASKS_FILE)
    
    task = None
    for t in tasks_data["tasks"]:
        if t["task_id"] == task_id:
            t["status"] = "done"
            t["completed_at"] = datetime.utcnow().isoformat() + "Z"
            t["updated_at"] = datetime.utcnow().isoformat() + "Z"
            task = t
            break
    
    if not task:
        return {"error": f"Task {task_id} not found"}
    
    save_json(TASKS_FILE, tasks_data)
    
    # Update queues
    working_data = load_json(WORKING_QUEUE)
    if task_id in working_data.get("queue", []):
        working_data["queue"].remove(task_id)
        save_json(WORKING_QUEUE, working_data)
    
    done_data = load_json(DONE_QUEUE)
    done_data["queue"].append(task_id)
    save_json(DONE_QUEUE, done_data)
    
    # Update agent
    agent = task.get("assigned_agent")
    if agent:
        update_agent_status(agent, "idle", None, f"Completed {task_id}")
    
    # Unblock dependent tasks
    sync_state()
    
    return {"completed": task_id, "agent": agent}


def run_full_build(prd_file: str, simulate: bool = False) -> dict:
    """Run a full build from PRD to completion."""
    print(f"🚀 Starting build from {prd_file}")
    
    # 1. Start build tracking
    build = start_build(prd_file)
    print(f"📋 Build {build['id']} started")
    
    # 2. Generate tasks
    gen_result = generate_tasks_from_prd(prd_file)
    print(f"📝 Generated {gen_result['tasks_generated']} tasks for {gen_result['features_count']} features")
    
    # 3. Validate
    valid, errors = check_integrity()
    if not valid:
        print(f"❌ Validation failed: {errors}")
        return {"error": "Validation failed", "errors": errors}
    print("✅ Validation passed")
    
    # 4. Run orchestration loop
    if simulate:
        print("\n🔄 Running simulated build...")
        iteration = 0
        max_iterations = 100  # Safety limit
        
        while iteration < max_iterations:
            iteration += 1
            step_result = run_orchestration_step()
            
            for action in step_result["actions"]:
                print(f"   {action}")
            
            if step_result["completed"]:
                break
            
            # Simulate: complete all working tasks
            working = load_json(WORKING_QUEUE).get("queue", [])
            for task_id in working:
                sim_result = simulate_task_completion(task_id)
                print(f"   ✓ Completed {task_id}")
        
        # Final status
        status = get_workflow_status()
        print(f"\n✅ Build complete!")
        print(f"   Total tasks: {status['total_tasks']}")
        print(f"   Completed: {status['by_status']['done']}")
        print(f"   Progress: {status['progress_percent']}%")
        
        return {"success": True, "status": status}
    else:
        print("\n📋 Tasks generated. Use VS Code Copilot to run agents:")
        print("   /build-prd")
        return {"success": True, "tasks_generated": gen_result["tasks_generated"]}


def main():
    parser = argparse.ArgumentParser(description="Workflow Orchestrator")
    parser.add_argument("prd_file", nargs="?", help="PRD file to build from")
    parser.add_argument("--status", action="store_true", help="Show current status")
    parser.add_argument("--resume", action="store_true", help="Resume existing build")
    parser.add_argument("--simulate", action="store_true", help="Simulate task completion")
    parser.add_argument("--step", action="store_true", help="Run one orchestration step")
    parser.add_argument("--complete", help="Mark a task as complete")
    
    args = parser.parse_args()
    
    if args.status:
        status = get_workflow_status()
        print(json.dumps(status, indent=2))
    
    elif args.step:
        result = run_orchestration_step()
        print(json.dumps(result, indent=2))
    
    elif args.complete:
        result = simulate_task_completion(args.complete)
        print(json.dumps(result, indent=2))
    
    elif args.resume:
        result = run_orchestration_step()
        print(json.dumps(result, indent=2))
    
    elif args.prd_file:
        result = run_full_build(args.prd_file, simulate=args.simulate)
        if not args.simulate:
            print(json.dumps(result, indent=2))
    
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
