# Shared State

This directory contains the **shared task list** and agent coordination state for the parallel multi-agent system.

## Files

| File | Purpose |
|------|---------|
| `tasks.json` | **SHARED TASK LIST** - All agents read/write this |
| `agents.json` | Agent status tracking |
| `progress.json` | Feature progress tracking |
| `schemas/` | JSON schema definitions |

## Task System

### tasks.json

The central coordination point for all agents:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "task_id": "TASK-001",
      "title": "Implement login API",
      "assigned_agent": null,
      "status": "backlog",
      "dependencies": [],
      "priority": "high"
    }
  ]
}
```

### Task States

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌───────────┐
│ backlog │ ──► │ claimed │ ──► │ working │ ──► │ completed │
└─────────┘     └─────────┘     └─────────┘     └───────────┘
```

### Task Lifecycle

1. **Team Lead** creates task with `status: backlog`
2. **Worker Agent** claims task: `assigned_agent: "backend"`, `status: claimed`
3. **Worker Agent** starts work: `status: working`
4. **Worker Agent** finishes: `status: completed`, updates `files`

## Agent Claiming Protocol

```
1. READ tasks.json
2. FIND task where:
   - status = "backlog"
   - assigned_agent = null
   - dependencies all "completed"
3. SET assigned_agent = "<my-name>"
4. SET status = "claimed"
5. WRITE tasks.json
```

## Concurrency

Multiple agents may try to claim tasks simultaneously. Agents should:
- Re-read tasks.json before claiming
- Verify task is still available
- Update atomically

## Schema Validation

All state files are validated against schemas in `schemas/`:
- `tasks.schema.json` - Task structure
- `agents.schema.json` - Agent status structure
