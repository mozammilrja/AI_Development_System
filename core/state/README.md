# Shared State

This directory contains the **shared task list** and agent coordination state for the PRD-driven autonomous development system.

## Files

| File | Purpose |
|------|---------|
| `tasks.json` | **SHARED TASK LIST** - All agents read/write this |
| `agents.json` | Agent status tracking |
| `progress.json` | Build progress tracking |
| `schemas/` | JSON schema definitions |

## Task System

### tasks.json

The central coordination point for all agents:

```json
{
  "version": "2.0.0",
  "task_counter": 0,
  "tasks": [
    {
      "task_id": "TASK-001",
      "title": "Design system architecture",
      "type": "architecture",
      "assigned_agent": null,
      "status": "ready",
      "dependencies": [],
      "priority": "critical",
      "prd_source": "product.prd.md"
    }
  ]
}
```

### Task States

```
┌─────────┐     ┌─────────┐     ┌─────────┐
│  ready  │ ──► │ working │ ──► │  done   │
└─────────┘     └─────────┘     └─────────┘
```

### Task Lifecycle

1. **Team Lead** parses PRD and creates task with `status: ready`
2. **Worker Agent** claims task: `assigned_agent: "backend"`, `status: working`
3. **Worker Agent** finishes: `status: done`, updates `files`

## agents.json

Tracks agent status and workload:

```json
{
  "agents": {
    "team-lead": { "status": "idle", "current_task": null },
    "architect": { "status": "working", "current_task": "TASK-001" },
    "backend": { "status": "idle", "current_task": null }
  }
}
```

## progress.json

Tracks overall build progress:

```json
{
  "builds": [
    {
      "prd_file": "product.prd.md",
      "status": "in_progress",
      "total_tasks": 25,
      "completed_tasks": 10,
      "started_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

## Agent Claiming Protocol

```
1. READ tasks.json
2. FIND task where:
   - type matches agent specialty
   - status = "ready"
   - assigned_agent = null
   - all dependencies have status = "done"
3. SET assigned_agent = "<my-name>"
4. SET status = "working"
5. WRITE tasks.json
```

## Concurrency

Multiple agents may try to claim tasks simultaneously. Agents should:
- Re-read tasks.json before claiming
- Verify task is still available
- Update atomically
