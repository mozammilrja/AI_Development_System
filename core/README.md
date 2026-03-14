# core/

## Purpose

Core orchestration engine for the autonomous AI development system.

## Contents

This is the brain of the system, containing:

- **orchestration/**: Agent coordination and workflow execution
- **state/**: State management and persistence
- **tasks/**: Task definitions and routing logic

## Architecture

```
core/
├── orchestration/    # Agent runner, team coordination
├── state/            # Workflow state, checkpoints
└── tasks/            # Task definitions, routing
```

## Responsibilities

1. **Agent Orchestration**: Start, monitor, and coordinate agents
2. **Workflow Execution**: Execute multi-step workflows
3. **State Management**: Track progress and enable recovery
4. **Task Routing**: Route tasks to appropriate agents

## Design Principles

- Fully autonomous operation
- Parallel agent execution
- Asynchronous collaboration via repository
- Fault tolerance and recovery
