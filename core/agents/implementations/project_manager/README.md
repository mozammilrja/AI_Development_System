# Project Manager (Planner) Agent

## Purpose

Contains prompt templates for the **Planner** agent, responsible for breaking down requirements into tasks, assigning work to agents, and tracking progress.

## Owned Paths

- `docs/tasks/`
- `core/agents/teams/`

## Capabilities

- Decompose feature requests into discrete, assignable tasks
- Define acceptance criteria and complexity estimates per task
- Resolve inter-task dependencies
- Generate project status reports with progress, blockers, and risks

## Files

| File | Description |
|------|-------------|
| `prompts.md` | System prompt, task breakdown prompt, status report prompt |

## Model

Primary: Claude Sonnet · Fallback: GPT-4o → GPT-4o-mini
