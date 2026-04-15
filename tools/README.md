# Tools

Python scripts for deterministic, reliable operations that AI agents can call.

## Available Tools

| Tool | Purpose | Usage |
|------|---------|-------|
| `orchestrator.py` | **Main workflow engine** | `python3 tools/orchestrator.py prd/example.prd.md --simulate` |
| `generate_tasks.py` | Generate tasks from PRD | `python3 tools/generate_tasks.py prd/example.prd.md` |
| `parse_prd.py` | Extract features from PRD files | `python3 tools/parse_prd.py prd/example.prd.md` |
| `task_manager.py` | CRUD operations for tasks | `python3 tools/task_manager.py list` |
| `state_sync.py` | Atomic state updates | `python3 tools/state_sync.py sync` |
| `validate.py` | Validate JSON schemas | `python3 tools/validate.py all` |

## orchestrator.py (Main Entry Point)

The **workflow orchestrator** runs the entire build process:

```bash
# Full simulated build (test mode)
python3 tools/orchestrator.py prd/example.prd.md --simulate

# Generate tasks only (for VS Code Copilot)
python3 tools/orchestrator.py prd/example.prd.md

# Check status
python3 tools/orchestrator.py --status

# Run one orchestration step
python3 tools/orchestrator.py --step

# Mark task complete manually
python3 tools/orchestrator.py --complete TASK-001
```

## generate_tasks.py

Convert PRD features into development tasks with dependencies:

```bash
python3 tools/generate_tasks.py prd/example.prd.md
```

Output: Creates 8 tasks per feature (architecture → database → backend → frontend → ui → testing → security → review)

## parse_prd.py

Extract structured data from PRD files:

```bash
# Parse single file
python3 tools/parse_prd.py prd/example.prd.md

# Parse all PRDs
python3 tools/parse_prd.py
```

## task_manager.py

Manage tasks with atomic file operations:

```bash
# List all tasks
python3 tools/task_manager.py list

# List by status
python3 tools/task_manager.py list --status ready

# Add a task
python3 tools/task_manager.py add --title "Build API" --type backend --priority high

# Claim a task
python3 tools/task_manager.py claim TASK-001 --agent backend

# Complete a task
python3 tools/task_manager.py complete TASK-001
```

## state_sync.py

Manage agent and progress state:

```bash
# Update agent status
python3 tools/state_sync.py agent-status backend working TASK-001

# Start a build
python3 tools/state_sync.py progress start example.prd.md

# Update progress
python3 tools/state_sync.py progress update --completed 5 --total 10

# Sync all state files
python3 tools/state_sync.py sync
```

## validate.py

Validate system state and integrity:

```bash
# Validate all
python3 tools/validate.py all

# Validate specific
python3 tools/validate.py tasks
python3 tools/validate.py agents

# Check integrity
python3 tools/validate.py integrity

# JSON output
python3 tools/validate.py all --json
```

## Why Tools?

AI agents are good at reasoning but unreliable for:
- Exact JSON formatting
- Atomic file operations
- State consistency

These tools provide:
- **File locking** - No race conditions
- **Schema validation** - Correct data structure
- **Atomic writes** - No corruption
- **Consistent output** - Same input = same output
