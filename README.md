# AI Development System

A **multi-agent AI development platform** that orchestrates specialized agents to automate software development workflows.

## Overview

This system uses Claude Code Agent Teams to coordinate multiple AI agents that collaborate on building, testing, reviewing, and deploying software applications.

```
┌──────────────────────────────────────────────────────────────┐
│                    Claude Code Interface                      │
├──────────────────────────────────────────────────────────────┤
│                       Agent Teams                             │
│   Architect │ Planner │ Frontend │ Backend │ QA │ Security   │
│   UI-Designer │ Tester │ Debugger │ Reviewer │ DevOps │ Docs │
├──────────────────────────────────────────────────────────────┤
│                    Workspace Layer                             │
│                  apps/ │ saas-app/                            │
└──────────────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites

- [Claude Code](https://claude.ai/code) — VS Code extension or CLI
- Node.js 20+
- Git

### Setup

```bash
# Clone the repository
git clone <repo-url> ai-dev-system
cd ai-dev-system

# Configure environment (optional)
cp .env.example .env.local
# Edit .env.local with your API keys

# Open in Claude Code
code .
```

### First Command

```
/build-feature hello-world
```

## Commands

| Command | Description |
|---------|-------------|
| `/build-feature <name>` | Build a new feature |
| `/debug-bug <description>` | Debug and fix a bug |
| `/code-review` | Multi-lens code review |
| `/run-tests [--type unit\|e2e\|all]` | Run test suites |
| `/deploy-app --env staging` | Deploy application |
| `/research-tech <topic>` | Research technology |

## Agent Roles

| Agent | Role | Owns |
|-------|------|------|
| **Architect** | System design | `docs/architecture.md`, `knowledge/` |
| **Planner** | Task breakdown | `docs/tasks/` |
| **Frontend** | UI development | `apps/frontend/` |
| **Backend** | API development | `apps/backend/` |
| **UI-Designer** | Design system | `docs/design/` |
| **QA** | Quality assurance | `tests/` |
| **Tester** | Test implementation | `tests/` |
| **Security** | Security audits | Read-only |
| **Reviewer** | Code review | Read-only |
| **Debugger** | Bug analysis | Cross-codebase |
| **DevOps** | Deployment | `platform/` |
| **Documentation** | Documentation | `docs/` |

## Project Structure

```
ai-dev-system/
├── .agents/           # Agent definitions (YAML)
├── .claude/           # Claude Code config
│   ├── commands/      # Slash commands
│   ├── skills/        # Reusable skills
│   └── settings.json  # Agent Teams config
├── core/              # Orchestration
│   ├── agents/        # Teams, definitions, prompts
│   └── workflows/     # Workflow docs
├── configs/           # Configuration files
├── docs/              # Documentation
├── knowledge/         # Knowledge base
├── apps/              # Application workspace
│   ├── frontend/      # Next.js frontend
│   ├── backend/       # Backend services
│   └── database/      # Database config
├── saas-app/          # SaaS workspace
└── platform/          # Infrastructure
```

## Team Patterns

### Feature Development
```
Architect → Planner → Frontend + Backend (parallel) → QA → Reviewer
```

### Debug Investigation
```
Investigator A + B + C (competing) → Synthesis → Fix
```

### Code Review
```
Security + Quality + Coverage (parallel) → Summary
```

## Configuration

### Agent Definitions

Agents are defined in `.agents/*.yaml`:

```yaml
name: agent-name
role: Role Title
capabilities: [list]
responsibilities: [list]
permissions:
  write: [directories]
```

### Agent Teams

Enable in `.claude/settings.json`:

```json
{
  "experimental": {
    "agentTeams": true
  }
}
```

## Documentation

- [Architecture](docs/architecture.md) — System architecture
- [Workflow](docs/workflow.md) — Agent collaboration workflows
- [Developer Guide](docs/developer_guide.md) — Development guide
- [User Manual](docs/user_manual.md) — User manual

## Knowledge Base

- `knowledge/architecture.md` — Architecture decisions
- `knowledge/coding_standards.md` — Coding standards
- `knowledge/lessons_learned.md` — Lessons learned
- `knowledge/project_context.md` — Project context

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Test with Claude Code
5. Submit a pull request

## License

MIT
