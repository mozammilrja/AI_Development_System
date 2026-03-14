# Developer Guide

This guide explains how to set up, use, and extend the AI Development System.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Repository Structure](#repository-structure)
3. [Agent System](#agent-system)
4. [Commands](#commands)
5. [Task Management](#task-management)
6. [Development Workflow](#development-workflow)
7. [Adding Components](#adding-components)
8. [Testing](#testing)
9. [Best Practices](#best-practices)

---

## Getting Started

### Prerequisites

- **Claude Code** — VS Code extension or CLI
- **Node.js 20+** — Runtime environment
- **Git** — Version control
- **Docker** — Container runtime (optional, for local services)

### Installation

```bash
# Clone the repository
git clone <repo-url> ai-dev-system
cd ai-dev-system

# Install dependencies
npm install

# Verify setup
npm run verify
```

### Quick Start

1. **Open in Claude Code**
   - Open project in VS Code with Claude Code extension
   - Or use Claude Code CLI

2. **Run a command**
   ```bash
   /build-feature user-authentication
   ```

3. **Monitor progress**
   - Watch `core/state/progress.json`
   - Check `core/tasks/in-progress.md`

---

## Repository Structure

```
AI_Development_System/
├── .agents/                   # Agent role definitions
│   ├── architect.agent.md
│   ├── backend-engineer.agent.md
│   ├── frontend-engineer.agent.md
│   ├── ui-designer.agent.md
│   ├── devops-engineer.agent.md
│   ├── security-engineer.agent.md
│   ├── qa-engineer.agent.md
│   ├── performance-engineer.agent.md
│   ├── product-manager.agent.md
│   └── reviewer.agent.md
│
├── .claude/                   # Claude Code configuration
│   ├── commands/              # Workflow commands
│   │   ├── build-feature.md
│   │   ├── code-review.md
│   │   ├── deploy-app.md
│   │   ├── fix-bug.md
│   │   ├── write-tests.md
│   │   ├── security-audit.md
│   │   └── optimize-performance.md
│   └── settings.json
│
├── core/                      # Orchestration engine
│   ├── orchestration/         # Workflow documentation
│   ├── state/                 # State management (JSON)
│   │   ├── tasks.json         # Task registry
│   │   ├── agents.json        # Agent status
│   │   └── progress.json      # Build progress
│   └── tasks/                 # Task board (Markdown)
│       ├── backlog.md
│       ├── in-progress.md
│       └── completed.md
│
├── services/                  # Application code
│   ├── backend/               # Backend API
│   └── frontend/              # Frontend app
│
├── ui/                        # Design system
├── security/                  # Security policies
├── tests/                     # Test suites
├── platform/                  # Infrastructure
├── knowledge/                 # Engineering knowledge base
└── docs/                      # Documentation
```

---

## Agent System

### The 10-Agent Team

| # | Agent | Role | Owned Directories |
|---|-------|------|-------------------|
| 1 | **Product Manager** | Requirements & user stories | `knowledge/product.md` |
| 2 | **Architect** | System design & API contracts | `docs/architecture.md` |
| 3 | **Backend Engineer** | APIs, services, database | `services/backend/` |
| 4 | **Frontend Engineer** | React components, pages | `services/frontend/` |
| 5 | **UI Designer** | Design system, tokens | `ui/` |
| 6 | **DevOps Engineer** | CI/CD, infrastructure | `platform/` |
| 7 | **Security Engineer** | Security audits, policies | `security/` |
| 8 | **QA Engineer** | Unit, integration, E2E tests | `tests/` |
| 9 | **Performance Engineer** | Benchmarks, profiling | `tests/benchmarks/` |
| 10 | **Code Reviewer** | Final review (read-only) | `reviews/` |

### Agent Definition Format

Each agent is defined in `.agents/<name>.agent.md`:

```markdown
# Agent Name

## Role
Description of the agent's responsibility.

## Responsibilities
- Primary task 1
- Primary task 2

## Owned Directories
| Directory | Purpose |
|-----------|---------|
| `path/` | Description |

## Collaboration Rules
### Reads From
- Source files and dependencies

### Writes To
- Output destinations
```

---

## Commands

### Available Commands

| Command | Description |
|---------|-------------|
| `/build-feature <name>` | Build complete feature with all 10 agents |
| `/code-review` | Multi-perspective parallel code review |
| `/deploy-app --env <env>` | Deploy to staging or production |
| `/fix-bug <description>` | Debug and fix an issue |
| `/write-tests` | Generate comprehensive test suite |
| `/security-audit` | Run security vulnerability scan |
| `/optimize-performance` | Analyze and optimize performance |

### Using Commands

```bash
# Build a new feature
/build-feature user-authentication with JWT tokens

# Review code changes
/code-review

# Deploy to staging
/deploy-app --env staging

# Fix a bug
/fix-bug "Login fails with special characters"

# Generate tests
/write-tests

# Run security scan
/security-audit

# Optimize performance
/optimize-performance
```

---

## Task Management

### Task Board

Tasks flow through three states:

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│    BACKLOG      │ ───► │   IN-PROGRESS   │ ───► │   COMPLETED     │
│  (backlog.md)   │      │(in-progress.md) │      │ (completed.md)  │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

### Task Format

```markdown
## TASK-001: Task Title

- **Feature:** FEAT-001
- **Agent:** architect
- **Priority:** high
- **Status:** in-progress
- **Created:** 2026-03-14T10:00:00Z

### Description
Design the authentication system architecture.

### Acceptance Criteria
- [ ] API contract defined
- [ ] Data models specified
- [ ] Security considerations documented
```

### State Files

**`core/state/tasks.json`** — Machine-readable task registry:
```json
{
  "tasks": [
    {
      "id": "TASK-001",
      "title": "Design authentication",
      "assignedTo": "architect",
      "status": "completed"
    }
  ]
}
```

**`core/state/agents.json`** — Agent status:
```json
{
  "agents": {
    "architect": {
      "status": "active",
      "currentTask": "TASK-002"
    }
  }
}
```

**`core/state/progress.json`** — Feature progress:
```json
{
  "features": {
    "FEAT-001": {
      "name": "User Authentication",
      "status": "in-progress",
      "phases": {
        "architecture": "completed",
        "implementation": "in-progress"
      }
    }
  }
}
```

---

## Development Workflow

### 1. Feature Development

1. **Invoke command**
   ```bash
   /build-feature <feature-description>
   ```

2. **Tasks created**
   - Tasks added to `core/tasks/backlog.md`
   - State updated in `core/state/tasks.json`

3. **Agents work in parallel**
   - Each agent claims their task
   - Moves to `in-progress.md`
   - Works autonomously

4. **Coordination via files**
   - Agents read each other's outputs
   - No direct messaging

5. **Completion**
   - Tasks move to `completed.md`
   - Final report generated

### 2. Code Review

```bash
/code-review
```

Reviews from multiple perspectives:
- Security vulnerabilities
- Code quality standards
- Performance implications
- Test coverage

### 3. Deployment

```bash
/deploy-app --env staging
/deploy-app --env production
```

Stages:
1. Build and package
2. Run pre-deployment tests
3. Deploy to environment
4. Run smoke tests
5. Validate deployment

---

## Adding Components

### Adding a New Agent

1. **Create agent definition**

   Create `.agents/<agent-name>.agent.md`:

   ```markdown
   # Agent Name

   ## Role
   Description of responsibility.

   ## Responsibilities
   - Task 1
   - Task 2

   ## Owned Directories
   | Directory | Purpose |
   |-----------|---------|
   | `my-path/` | Description |

   ## Collaboration Rules
   ### Reads From
   - Input sources

   ### Writes To
   - Output destinations
   ```

2. **Create owned directory**

   ```bash
   mkdir -p my-path
   echo "# My Directory" > my-path/README.md
   ```

3. **Update documentation**

   Add agent to relevant docs (architecture.md, workflow.md).

### Adding a New Command

1. **Create command file**

   Create `.claude/commands/<command-name>.md`:

   ```markdown
   # Command Name

   Execute: **$ARGUMENTS**

   ---

   ## Agents

   | Agent | Task |
   |-------|------|
   | agent-1 | Do X |
   | agent-2 | Do Y |

   ---

   ## Instructions

   ### agent-1
   START IMMEDIATELY.
   1. Step 1
   2. Step 2

   ---

   ## Output

   Generate report.
   ```

2. **Test command**

   ```bash
   /<command-name> test-argument
   ```

---

## Testing

### Running Tests

```bash
# All tests
npm test

# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

### Test Structure

```
tests/
├── unit/
│   ├── backend/           # Backend unit tests
│   └── frontend/          # Frontend unit tests
├── integration/           # Integration tests
├── e2e/                   # End-to-end tests
├── security/              # Security tests
└── benchmarks/            # Performance benchmarks
```

### Testing Standards

- **Coverage target:** 80%+ for all code
- **Unit tests:** Jest for both backend and frontend
- **E2E tests:** Playwright for browser automation
- **Test naming:** `describe('Component', () => { it('should...') })`

---

## Best Practices

### For Agents

1. **Start Immediately** — Never wait for other agents
2. **Stay In Lane** — Only write to owned directories
3. **Coordinate via Files** — Monitor relevant repository files
4. **Update Status** — Keep task state current
5. **Document Work** — Add comments and documentation

### For Commands

1. **Spawn All Agents** — Start agents simultaneously
2. **Clear Task Definitions** — Specific acceptance criteria
3. **Generate Reports** — Summarize results at completion

### For Code

1. **TypeScript** — Use strict mode
2. **Testing** — Write tests for all code
3. **Documentation** — JSDoc for public APIs
4. **Consistency** — Follow knowledge/ guidelines

---

## File Ownership Rules

### Critical Rules

1. **Exclusive Write Access** — Each agent writes ONLY to their directories
2. **Universal Read Access** — All agents can read any file
3. **No Overlap** — Directory ownership does not overlap
4. **Read-Only Reviewers** — Code Reviewer only writes to `reviews/`

### Ownership Table

| Agent | Exclusive Write Access |
|-------|------------------------|
| Product Manager | `knowledge/product.md`, `docs/user-stories/` |
| Architect | `docs/architecture.md`, `docs/adr/`, `knowledge/architecture.md` |
| Backend Engineer | `services/backend/`, `tests/unit/backend/`, `tests/integration/` |
| Frontend Engineer | `services/frontend/`, `tests/unit/frontend/`, `tests/e2e/` |
| UI Designer | `ui/`, `docs/design/` |
| DevOps Engineer | `platform/`, `.github/`, `docker-compose.yml` |
| Security Engineer | `security/`, `docs/security/`, `tests/security/` |
| QA Engineer | `tests/`, `docs/testing/` |
| Performance Engineer | `tests/benchmarks/`, `performance/` |
| Code Reviewer | `reviews/` |

---

## Troubleshooting

### Agent Not Working

1. Check agent definition in `.agents/`
2. Verify task is properly assigned
3. Check `core/state/agents.json` for status

### Task Stuck

1. Check `core/tasks/in-progress.md`
2. Verify assigned agent is active
3. Check for blocking dependencies

### Command Failed

1. Verify command file syntax
2. Check all required agents exist
3. Review error logs

---

## See Also

- [Architecture Documentation](architecture.md) — System architecture
- [Workflow Documentation](workflow.md) — Workflow phases
- [Product Documentation](product.md) — Product overview
