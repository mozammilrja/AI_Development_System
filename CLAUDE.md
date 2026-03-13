# AI Development System

## Overview

A **multi-agent AI development system** that orchestrates specialized agents to automate software development workflows. Agents collaborate via Claude Code Agent Teams to build, test, review, and deploy applications in the `apps/` and `saas-app/` workspaces.

## Architecture

```
┌─────────────────────────────────────────────────┐
│            Claude Code Agent Teams               │
│        (multi-instance orchestration)           │
├─────────────────────────────────────────────────┤
│                 Agent Layer                      │
│  architect · planner · frontend · backend        │
│  ui-designer · qa · tester · security           │
│  reviewer · debugger · devops · documentation   │
├─────────────────────────────────────────────────┤
│                Workflow Layer                    │
│  feature · debug · review · release · research  │
├─────────────────────────────────────────────────┤
│               Knowledge Layer                    │
│  knowledge/ · docs/ · .claude/                  │
└─────────────────────────────────────────────────┘
```

## Agent Roles

| Agent | Owns | Does |
|-------|------|------|
| **Architect** | `docs/architecture.md`, `knowledge/` | System design, ADRs, tech decisions |
| **Planner** | `docs/tasks/` | Task breakdown, coordination |
| **Frontend** | `apps/frontend/`, `saas-app/frontend/` | React/Next.js development |
| **Backend** | `apps/backend/`, `saas-app/backend/` | API and service development |
| **UI-Designer** | `docs/design/` | UI/UX design, design system |
| **QA** | `tests/` | Test strategy, quality assurance |
| **Tester** | `tests/` | Test implementation and execution |
| **Security** | `docs/security/` | Security audits, vulnerability checks |
| **Reviewer** | read-only | Code quality and review |
| **Debugger** | cross-codebase | Bug analysis and fixes |
| **DevOps** | `platform/infrastructure/` | CI/CD, deployment |
| **Documentation** | `docs/`, `README.md` | Documentation |

## Directory Structure

```
.agents/            — Agent role definitions (YAML)
.claude/            — Claude Code config, commands, skills
core/               — Orchestration logic
  agents/           — Agent definitions, prompts, team templates
  workflows/        — Workflow documentation
configs/            — Configuration files
docs/               — Documentation
knowledge/          — Project knowledge base
apps/               — Application workspace (frontend, backend, database)
saas-app/           — SaaS application workspace
platform/           — Infrastructure configs
```

## Team Patterns

| Team | Pattern | Command |
|------|---------|---------|
| **Feature** | architect → planner → frontend + backend → qa → reviewer | `/build-feature` |
| **Debug** | 3 competing investigators → synthesis | `/debug-bug` |
| **Review** | security + quality + coverage (parallel) | `/code-review` |
| **Release** | devops → qa validation → deploy | `/deploy-app` |
| **Research** | proponent + critic + evaluator | `/research-tech` |

## Commands

```
/build-feature <name>              — Build a new feature
/debug-bug <description>           — Debug and fix a bug
/code-review [--focus type]        — Multi-lens code review
/run-tests [--type unit|e2e|all]   — Run test suites
/deploy-app --env staging|production — Deploy application
/research-tech <topic>             — Research technology
```

## File Ownership Rules

1. Each agent owns specific directories
2. No overlapping writes between agents
3. All agents can read all files
4. Reviewer is always read-only

## Context Priority

When working on tasks, prioritize context:
1. Current task requirements
2. Relevant source code in ownership area
3. Test specifications
4. Architecture decisions (`knowledge/architecture.md`)
5. Coding standards (`knowledge/coding_standards.md`)
6. Lessons learned (`knowledge/lessons_learned.md`)

## Coding Conventions

- **TypeScript/React**: camelCase, functional components, hooks
- **Frontend**: Next.js App Router, Tailwind CSS
- **Testing**: Jest for unit tests, Playwright for E2E
- **Git**: Feature branches, conventional commits

## Configuration Files

| File | Purpose |
|------|---------|
| `.agents/*.yaml` | Agent role definitions |
| `configs/agents.yaml` | Agent model settings |
| `configs/model_config.yaml` | LLM provider config |
| `.claude/settings.json` | Agent Teams settings |
