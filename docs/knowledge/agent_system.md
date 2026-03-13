# Agent System Design

This document explains how the AI agent system works, how to add new agents, and how to create new workflows.

---

## How the Agent System Works

The system orchestrates specialized AI agents through a TypeScript pipeline:

```
User Request
  │
  ├─ TaskRouter    — detects intent, selects workflow type
  ├─ *Flow class   — creates tasks, assigns agents, defines dependencies
  ├─ TeamLauncher  — executes tasks per team pattern (seq/par/adversarial)
  ├─ AgentRunner   — spawns each agent via Claude Agent Teams
  └─ MongoDB       — persists tasks, runs, messages, workflow state
```

### Key Components

| Module | Path | Responsibility |
|--------|------|----------------|
| `AgentRunner` | `core/orchestrator/agentRunner.ts` | Executes a single agent against a task via Claude Agent Teams |
| `TaskRouter` | `core/services/taskRouter.ts` | Maps free-text requests to workflow types and task lists |
| `TeamLauncher` | `core/services/teamLauncher.ts` | Runs tasks according to team patterns (sequential, parallel, adversarial) |
| `BaseWorkflow` | `core/workflows/baseWorkflow.ts` | Abstract base for all DAG-based workflows |
| MongoDB Models | `core/models/` | Mongoose models for tasks, agent_runs, team_messages, workflow_state |

### Execution Patterns

| Pattern | Description | Example |
|---------|-------------|---------|
| `sequential` | Tasks run one after another | Release: deploy → validate |
| `parallel` | All tasks run at the same time | Review: security + performance + coverage |
| `sequential_parallel` | Tasks batched by dependency; each batch parallel | Feature: design → (FE + BE) → test → review |
| `adversarial` | Competing tasks in parallel, then synthesis | Debug: 3 investigators → fix |

---

## How to Add a New Agent

### Step 1: Create the Agent Definition

Create `core/agents/definitions/<name>.yaml`:

```yaml
name: analytics
role: Analytics Engineer
description: Builds data pipelines and dashboards.

model:
  primary: claude-opus-4-20250514
  fallback: gpt-4o
  temperature: 0.3

tools:
  - file_editor
  - repo_reader
  - terminal_executor

permissions:
  read: all
  write:
    - apps/backend/analytics/**
  execute:
    - node
    - npm
```

### Step 2: Create the Implementation

Create a directory `core/agents/implementations/<name>_agent/` with:

**agent.ts** — Definition, system prompt, execute function:

```typescript
import type { AgentDefinition, AgentRunResult } from '../../orchestrator/types.js';

export const definition: AgentDefinition = {
  name: 'analytics' as any,
  role: 'Analytics Engineer',
  description: 'Builds data pipelines and dashboards.',
  model: { primary: 'claude-opus-4-20250514', fallback: 'gpt-4o', temperature: 0.3 },
  tools: ['file_editor', 'repo_reader', 'terminal_executor'],
  permissions: {
    read: 'all',
    write: ['apps/backend/analytics/**'],
    execute: ['node', 'npm'],
  },
};

export const systemPrompt = `You are a senior analytics engineer...`;

export async function execute(input: { taskDescription: string }): Promise<Partial<AgentRunResult>> {
  return {
    agentName: definition.name,
    status: 'completed',
    output: `Analytics work for: ${input.taskDescription}`,
    filesChanged: [],
  };
}
```

**tools.ts** — Tool descriptors:

```typescript
export const tools = {
  fileEditor: {
    name: 'file_editor',
    description: 'Create and edit analytics source files',
    allowedPaths: ['apps/backend/analytics/**'],
  },
  repoReader: {
    name: 'repo_reader',
    description: 'Read any file in the repository',
    allowedPaths: ['**/*'],
  },
} as const;
```

**README.md** — Agent documentation.

### Step 3: Register in Config

Add the agent to `configs/agents.yaml`:

```yaml
agents:
  analytics:
    model: claude-opus-4-20250514
    temperature: 0.3
```

### Step 4: Add to Team (Optional)

If the agent participates in a team, update the relevant team template in `core/agents/teams/` and add it to the team's `members` list in `configs/agents.yaml`.

---

## How to Create a New Workflow

### Step 1: Create the Workflow Class

Create `core/workflows/<name>Flow.ts`:

```typescript
import { BaseWorkflow } from './baseWorkflow.js';
import type { TeamTemplate } from '../orchestrator/types.js';

export class AnalyticsFlow extends BaseWorkflow {
  get template(): TeamTemplate {
    return {
      name: 'analytics',
      goal: 'Build and validate an analytics pipeline',
      members: ['backend', 'analytics' as any, 'tester'],
      pattern: 'sequential',
      taskFlow: [
        'backend prepares data models',
        'analytics builds pipeline',
        'tester validates output',
      ],
    };
  }
}
```

### Step 2: Register the Workflow

Export the class from `core/workflows/index.ts`:

```typescript
export { AnalyticsFlow } from './analyticsFlow.js';
```

### Step 3: Add TaskRouter Mapping

Update `core/services/taskRouter.ts` to detect the new intent:

```typescript
private static readonly INTENT_MAP: Record<string, WorkflowType> = {
  // ... existing mappings
  analytics: 'analytics' as any,
  dashboard: 'analytics' as any,
};
```

### Step 4: Create a Team Template (Optional)

Create `core/agents/teams/analytics_team.md` following the same structure as existing templates (Team Goal, Team Members, Responsibilities, File Ownership, Communication Rules, Task Flow).

### Step 5: Add a Slash Command (Optional)

Create `.claude/commands/build-analytics.md` to make the workflow accessible via a slash command.

---

## MongoDB Collections

All orchestration state is persisted to MongoDB:

| Collection | Model | Key Fields |
|------------|-------|------------|
| `tasks` | `Task` | title, assignedTo, status, priority, workflowId, dependsOn |
| `agent_runs` | `AgentRun` | taskId, agentName, status, output, tokenUsage |
| `team_messages` | `TeamMessage` | workflowId, fromAgent, toAgent, content |
| `workflow_state` | `WorkflowState` | type, status, teamName, tasks[], context |

---

## Integration with Claude Agent Teams

The system integrates with Claude Code's native Agent Teams feature:

1. **`.claude/settings.json`** configures global Agent Teams behavior
2. **`core/agents/definitions/*.yaml`** provides per-agent model, tools, and file permissions — Claude Code reads these at spawn time
3. **`core/agents/teams/*.md`** contains spawn prompts and communication protocols used by team workflows
4. **`core/agents/implementations/*/agent.ts`** provides the `systemPrompt` injected when each agent is spawned
5. **`AgentRunner`** in `core/orchestrator/agentRunner.ts` is the integration seam — it calls the Claude Code SDK/CLI to spawn agents

---

## Existing Agents

| Agent | Directory | Writable Paths |
|-------|-----------|----------------|
| Architect | `architect/` | `docs/architecture.md`, `docs/knowledge/` |
| Backend | `backend_agent/` | `apps/backend/`, `saas-app/backend/` |
| Frontend | `frontend_agent/` | `apps/frontend/`, `saas-app/frontend/` |
| Tester | `testing_agent/` | `tests/`, `platform/simulations/` |
| Debugger | `debug_agent/` | Cross-codebase (global write) |
| Reviewer | `review_agent/` | None (read-only) |
| DevOps | `deploy_agent/` | `platform/` |
| Documentation | `docs_agent/` | `docs/`, `README.md` |
| Planner | `project_manager/` | `docs/tasks/`, `core/agents/teams/` |
