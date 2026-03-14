# .claude/commands/

## Purpose

Custom slash commands for the AI development system. Each command triggers a multi-agent workflow.

## Commands

| Command | Description | Primary Agents |
|---------|-------------|----------------|
| `/build-feature` | Build complete feature | All agents (phased) |
| `/fix-bug` | Diagnose and fix bug | Backend/Frontend + QA + Reviewer |
| `/write-tests` | Create test suites | QA Engineer + Reviewer |
| `/security-audit` | Security assessment | Security Engineer |
| `/optimize-performance` | Performance optimization | Performance Engineer |
| `/code-review` | Review code changes | Reviewer |
| `/deploy-app` | Deploy to environment | DevOps Engineer |

## Command Format

Each command file follows this structure:

```markdown
# Command Name

Description: **$ARGUMENTS**

## Phase 1: Initialize
- Create tasks
- Update state files

## Phase 2-N: Execution
- Agent instructions
- State updates
- Exit criteria

## Completion
- Final report
- State cleanup
```

## Workflow Integration

Commands integrate with:

| Component | Purpose |
|-----------|---------|
| `core/state/tasks.json` | Task creation and tracking |
| `core/state/agents.json` | Agent status updates |
| `core/state/progress.json` | Progress tracking |
| `core/tasks/*.md` | Human-readable task board |

## Execution Model

```
Command Invocation
       │
       ▼
┌─────────────────┐
│ Initialize      │ Create tasks, update state
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Execute Phases  │ Agents work on tasks
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Loop Until Done │ Check completion, advance phases
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Generate Report │ Final output
└─────────────────┘
```

## Usage

```
/build-feature User Authentication
/fix-bug Login fails with special characters
/write-tests services/backend/src/auth/
/security-audit services/backend/
/optimize-performance API response times
```
