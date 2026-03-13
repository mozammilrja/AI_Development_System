# AI Development System — User Manual

**Version 2.0 | March 2026**

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Quick Start](#2-quick-start)
3. [Core Commands](#3-core-commands)
4. [Agent Roles](#4-agent-roles)
5. [Typical Workflows](#5-typical-workflows)
6. [Best Practices](#6-best-practices)
7. [Troubleshooting](#7-troubleshooting)
8. [FAQ](#8-faq)

---

## 1. Introduction

### What is the AI Development System?

The AI Development System is a **multi-agent platform** that automates software development workflows. Instead of manually writing code, you issue high-level commands and AI agents collaborate to complete the work.

### Key Capabilities

| Capability | Description |
|------------|-------------|
| **Feature Development** | Converts requirements into working code |
| **Automated Testing** | Generates and executes tests |
| **Intelligent Debugging** | Analyzes bugs and generates fixes |
| **Code Review** | Multi-lens analysis for quality |
| **Deployment** | Manages staging and production releases |
| **Research** | Evaluates technologies adversarially |

### How It Works

1. You issue a command (e.g., `/build-feature user-authentication`)
2. Agent Teams are spawned to handle the task
3. Agents collaborate, each owning specific responsibilities
4. Work is reviewed and refined
5. Final output is ready for deployment

---

## 2. Quick Start

### Prerequisites

- [Claude Code](https://claude.ai/code) installed
- Node.js 20+ (for frontend work)
- Git

### Setup

```bash
# Clone the repository
git clone <repo-url> ai-dev-system
cd ai-dev-system

# Configure environment (optional)
cp .env.example .env.local
# Edit .env.local with your API keys
```

### Open in Claude Code

1. Open VS Code with Claude Code extension
2. Open the `ai-dev-system` folder
3. Agent Teams will be automatically enabled

### First Command

Try building your first feature:

```
/build-feature hello-world
```

---

## 3. Core Commands

All commands use the pattern: `/<command> <arguments> [--options]`

### `/build-feature`

Build a new feature from requirements.

```
/build-feature <feature-name>
```

**Example:**
```
/build-feature user-authentication
```

**What happens:**
1. Architect designs the system
2. Planner creates task breakdown
3. Frontend and Backend implement in parallel
4. QA tests the implementation
5. Reviewer audits the code

---

### `/debug-bug`

Investigate and fix a bug.

```
/debug-bug <description>
```

**Example:**
```
/debug-bug "Login fails with 500 error on special characters"
```

**What happens:**
1. Multiple investigators analyze in parallel
2. Hypotheses compete and challenge each other
3. Best fix is synthesized and applied

---

### `/code-review`

Run a comprehensive code review.

```
/code-review [--focus security|quality|all]
```

**Example:**
```
/code-review --focus security
```

**What happens:**
1. Security review checks vulnerabilities
2. Quality review checks code standards
3. Coverage review checks test coverage
4. Consolidated report is generated

---

### `/run-tests`

Execute test suites.

```
/run-tests [--type unit|integration|e2e|all]
```

**Example:**
```
/run-tests --type all
```

---

### `/deploy-app`

Deploy to an environment.

```
/deploy-app --env staging|production
```

**Example:**
```
/deploy-app --env staging
```

**What happens:**
1. Application is built and validated
2. Smoke tests run
3. Deployment executed
4. Health checks verify success

---

### `/research-tech`

Research and evaluate a technology.

```
/research-tech <topic>
```

**Example:**
```
/research-tech "GraphQL vs REST for mobile API"
```

**What happens:**
1. Proponent argues FOR
2. Critic argues AGAINST
3. Evaluator synthesizes recommendation

---

## 4. Agent Roles

### Team Overview

| Agent | Role | Owns |
|-------|------|------|
| **Architect** | System design | `docs/architecture.md`, `docs/knowledge/` |
| **Planner** | Task breakdown | `docs/tasks/` |
| **Frontend** | UI development | `apps/frontend/` |
| **Backend** | API development | `apps/backend/` |
| **UI-Designer** | Design system | `docs/design/` |
| **QA** | Quality assurance | `tests/` |
| **Tester** | Test implementation | `tests/` |
| **Security** | Security audits | Read-only |
| **Reviewer** | Code review | Read-only |
| **Debugger** | Bug fixing | Cross-codebase |
| **DevOps** | Deployment | `platform/` |
| **Documentation** | Documentation | `docs/`, `README.md` |

### Collaboration Rules

- **File Ownership:** Agents only write to their owned directories
- **Handoffs:** Output from one agent feeds the next
- **Parallel Work:** Independent tasks run concurrently
- **Review:** Reviewer agent is always read-only

---

## 5. Typical Workflows

### Daily Development

```
Morning:
  /build-feature payment-integration

Midday:
  /run-tests --type unit

Afternoon:
  /debug-bug "Payment webhook validation failing"
  /code-review

End of day:
  /deploy-app --env staging
```

### Weekly Cycle

| Day | Activities |
|-----|------------|
| Monday | Plan sprint, prioritize features |
| Tuesday | `/build-feature` for priority items |
| Wednesday | Continue features, `/debug-bug` for issues |
| Thursday | `/code-review`, `/run-tests` |
| Friday | `/deploy-app`, `/research-tech` for next sprint |

---

## 6. Best Practices

### Writing Good Requirements

**DO:**
```markdown
# Feature: User Authentication

## User Stories
- As a user, I want to log in with email/password

## Acceptance Criteria
- Login returns JWT token on success
- Invalid credentials return 401
```

**DON'T:**
```markdown
Need login. Make it work.
```

### Let Agents Debug First

Before manually fixing bugs:
```
/debug-bug "Describe the issue clearly"
```

### Use Appropriate Commands

| Need | Command |
|------|---------|
| New feature | `/build-feature` |
| Bug fix | `/debug-bug` |
| Quality check | `/code-review` |
| Testing | `/run-tests` |
| Ship code | `/deploy-app` |
| Research | `/research-tech` |

---

## 7. Troubleshooting

### Agent Teams Not Starting

**Check:**
1. Claude Code is installed and updated
2. `.claude/settings.json` has `agentTeams: true`
3. Environment variable `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` is set

### Command Not Found

**Check:**
1. Command file exists in `.claude/commands/`
2. Markdown format is correct
3. Restart Claude Code

### Agent Writing to Wrong Directory

**Check:**
1. Agent permissions in `.agents/<agent>.yaml`
2. Correct agent is assigned to task
3. File paths match expected pattern

---

## 8. FAQ

### How do I add a new agent?

1. Create `.agents/<agent-name>.yaml`
2. Define role, capabilities, permissions
3. Add to team templates if needed

### Can I use custom models?

Yes, configure in `.agents/<agent>.yaml`:
```yaml
model:
  primary: claude-sonnet-4-20250514
  fallback: gpt-4o
```

### How do agents communicate?

Agents use Claude Code's Agent Teams feature — shared task lists and direct messaging between Claude instances.

### What if an agent makes a mistake?

1. Use `/debug-bug` to analyze and fix
2. Update knowledge base with lessons learned
3. Refine agent prompts if needed

### Can I run multiple commands at once?

Commands are executed sequentially. For parallel work, the agent team handles parallelization internally.

---

## Command Reference

| Command | Description |
|---------|-------------|
| `/build-feature <name>` | Build a new feature |
| `/debug-bug <description>` | Fix a bug |
| `/code-review` | Review code |
| `/run-tests [--type]` | Run tests |
| `/deploy-app --env` | Deploy |
| `/research-tech <topic>` | Research |

---

## Directory Structure

```
ai-dev-system/
├── .agents/           # Agent definitions
├── .claude/           # Claude Code config
├── core/              # Orchestration
├── configs/           # Configuration
├── docs/              # Documentation
├── docs/knowledge/         # Knowledge base
├── apps/              # App workspace
├── saas-app/          # SaaS workspace
└── platform/          # Infrastructure
```

---

**Document Version:** 2.0  
**Last Updated:** March 2026  
**Maintainer:** AI Dev System Team
