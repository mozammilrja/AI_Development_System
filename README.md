# AI Development System

A **fully autonomous multi-agent software engineering platform** where 10 specialized AI agents work **in parallel** to design, build, test, and deploy software.

## Overview

This system uses Claude Code Agent Teams to orchestrate 10 autonomous AI agents that collaborate **simultaneously** without sequential phases. All agents start at the same time and coordinate through repository files.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AUTONOMOUS MULTI-AGENT TEAM                          │
│                        (10 Agents Running in Parallel)                      │
├──────────┬──────────┬──────────┬──────────┬──────────┬──────────────────────┤
│ Product  │ Arch-    │ Backend  │ Frontend │ UI       │ DevOps               │
│ Manager  │ itect    │ Engineer │ Engineer │ Designer │ Engineer             │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────────────────┤
│ Security │ QA       │ Perform- │ Code     │          │                      │
│ Engineer │ Engineer │ ance Eng │ Reviewer │          │                      │
└──────────┴──────────┴──────────┴──────────┴──────────┴──────────────────────┘
                                    │
                        ┌───────────┴────────────┐
                        │   File-Based Coord.    │
                        └────────────────────────┘
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

# Install dependencies
npm install

# Open in Claude Code
code .
```

### Build Your First Feature

```bash
/build-feature user-authentication
```

This spawns all 10 agents to work simultaneously on the feature.

## Commands

| Command | Description |
|---------|-------------|
| `/build-feature <name>` | Build feature with 10 parallel agents |
| `/code-review` | Multi-lens parallel code review |
| `/deploy-app --env staging` | Deploy to staging/production |
| `/run-tests` | Run test suites |

## The 10-Agent Team

| Agent | Role | Owns |
|-------|------|------|
| **Product Manager** | Requirements, user stories | `docs/product.md`, `docs/user-stories/` |
| **Architect** | System design, APIs | `docs/architecture.md`, `docs/api-contracts/` |
| **Backend Engineer** | APIs, services, database | `app/backend/` |
| **Frontend Engineer** | React components, pages | `app/frontend/` |
| **UI Designer** | Component specs, design tokens | `ui/` |
| **DevOps Engineer** | CI/CD, infrastructure | `platform/`, `.github/` |
| **Security Engineer** | Security audits | `security/` |
| **QA Engineer** | Unit, integration, E2E tests | `tests/` |
| **Performance Engineer** | Benchmarks, load tests | `tests/benchmarks/` |
| **Code Reviewer** | Code quality review | `reviews/` (read-only) |

## Execution Model

### Autonomous Parallel Execution

All 10 agents start **simultaneously** when a command is invoked:

1. **No Sequential Phases** — All agents begin at t=0
2. **Independent Work** — Agents work autonomously
3. **File-Based Coordination** — Agents communicate through files
4. **Exclusive Ownership** — Each agent writes only to their directories
5. **Final Report** — Generated when all agents complete

### Example

```
/build-feature user-authentication

[t=0] All 10 agents started simultaneously

[product-manager]     Defining requirements...
[architect]           Designing authentication system...
[backend-engineer]    Implementing auth APIs...
[frontend-engineer]   Creating login components...
[ui-designer]         Creating design specs...
[devops-engineer]     Setting up CI pipeline...
[security-engineer]   Auditing auth implementation...
[qa-engineer]         Writing auth tests...
[performance-engineer] Creating benchmarks...
[code-reviewer]       Reviewing all changes...

[t=end] All agents completed

== FINAL REPORT ==
✓ 5 user stories defined
✓ Architecture designed
✓ Backend: 8 files, 450 lines
✓ Frontend: 12 files, 6 components
✓ 42 tests passing
✓ Security: 0 critical issues
✓ Review: APPROVED
```

## Project Structure

```
ai-development-system/
├── .agents/           # Agent definitions (10 YAML files)
├── .claude/           # Commands and config
│   └── commands/      # Slash commands
├── .agent-status/     # Agent status tracking
├── core/              # Orchestration (TypeScript)
│   ├── orchestrator/  # Agent execution
│   ├── services/      # Team launcher
│   └── workflows/     # Workflow definitions
├── services/          # Application code
│   ├── backend/       # (Backend Engineer)
│   └── frontend/      # (Frontend Engineer)
├── ui/                # UI designs (UI Designer)
├── security/          # Security (Security Engineer)
├── tests/benchmarks/       # Performance (Performance Engineer)
├── reviews/           # Code reviews (Code Reviewer)
├── tests/             # Tests (QA Engineer)
├── platform/          # Infrastructure (DevOps)
├── docs/              # Documentation
└── docs/knowledge/         # Knowledge base
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

- `docs/knowledge/architecture.md` — Architecture decisions
- `docs/knowledge/coding_standards.md` — Coding standards
- `docs/knowledge/lessons_learned.md` — Lessons learned
- `docs/knowledge/project_context.md` — Project context

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Test with Claude Code
5. Submit a pull request

## License

MIT
