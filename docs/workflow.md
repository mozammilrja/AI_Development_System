# Workflow Documentation

This document describes how agents collaborate in the AI Development System.

---

## Agent Collaboration Model

Agents work together through **Claude Code Agent Teams** — multiple Claude instances coordinating via shared task lists and direct messaging.

### Collaboration Principles

1. **File Ownership** — Each agent owns specific directories
2. **Sequential Handoffs** — Output from one agent feeds the next
3. **Parallel Execution** — Independent tasks run concurrently
4. **Adversarial Review** — Competing perspectives for better outcomes

---

## 1. Feature Development Workflow

Full feature development from requirements to deployment.

### Team Structure

```
         ┌──────────┐
         │ Architect │  → Design system architecture
         └────┬─────┘
              │
         ┌────┴────┐
         │ Planner │  → Break down into tasks
         └────┬────┘
              │
     ┌────────┴────────┐
     ▼                  ▼
┌──────────┐     ┌──────────┐
│ Frontend │     │ Backend  │  → Parallel implementation
└────┬─────┘     └────┬─────┘
     └────────┬───────┘
              ▼
         ┌──────────┐
         │    QA    │  → Test the implementation
         └────┬─────┘
              ▼
         ┌──────────┐
         │ Reviewer │  → Code review
         └──────────┘
```

### Command

```
/build-feature <feature-name>
```

### Agent Responsibilities

| Agent | Task |
|-------|------|
| **Architect** | Design architecture, define interfaces |
| **Planner** | Create task breakdown, assign work |
| **Frontend** | Build UI components and pages |
| **Backend** | Build APIs and services |
| **QA** | Write and run tests |
| **Reviewer** | Review code quality |

### Example

```
/build-feature user-authentication

[architect]   Designing authentication system...
[architect]   ADR created: JWT with refresh tokens
[planner]     Created 6 tasks: 2 backend, 3 frontend, 1 test
[backend]     Implementing AuthService...
[frontend]    Creating LoginForm component...
[backend]     ✓ Auth endpoints complete
[frontend]    ✓ Login/Register UI complete
[qa]          Running test suite... 18/18 passed
[reviewer]    Code review: APPROVED
```

---

## 2. Debug Investigation Workflow

Bug analysis using competing hypotheses.

### Team Structure

```
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│ Investigator A │  │ Investigator B │  │ Investigator C │
│ (Logic errors) │  │ (State/data)   │  │ (Integration)  │
└───────┬────────┘  └───────┬────────┘  └───────┬────────┘
        │                   │                    │
        └───────── challenge each other ─────────┘
                            │
                     ┌──────┴──────┐
                     │  Synthesis  │  → Best solution
                     └─────────────┘
```

### Command

```
/debug-bug <description>
```

### How It Works

1. Three investigators analyze the bug in parallel
2. Each proposes a hypothesis and evidence
3. Investigators challenge each other's theories
4. Lead debugger synthesizes the best fix
5. Fix is validated and applied

### Example

```
/debug-bug "Login fails with 500 error on special characters"

[debugger-a]  Hypothesis: SQL injection escape issue
[debugger-b]  Hypothesis: Password encoding problem
[debugger-c]  Hypothesis: Database constraint violation
[debugger-a]  ✓ Evidence: Stack trace shows escape function
[debugger-a]  Confirmed root cause: improper escaping
[debugger]    Fix applied: use parameterized queries
```

---

## 3. Code Review Workflow

Multi-lens code review in parallel.

### Team Structure

```
         ┌─────────────────┐
         │ Security Review │  → Check vulnerabilities
         ├─────────────────┤
         │ Quality Review  │  → Check code quality
         ├─────────────────┤
         │ Coverage Review │  → Check test coverage
         └────────┬────────┘
                  │
           ┌──────┴──────┐
           │   Summary   │  → Consolidated report
           └─────────────┘
```

### Command

```
/code-review [--focus security|quality|all]
```

### Review Categories

| Lens | Checks |
|------|--------|
| **Security** | Vulnerabilities, auth issues, data exposure |
| **Quality** | Code style, maintainability, complexity |
| **Coverage** | Test coverage, edge cases, error handling |

### Example

```
/code-review

== Security Review ==
✓ No SQL injection vulnerabilities
⚠ Warning: API rate limiting not implemented

== Quality Review ==
✓ Code follows style guidelines
⚠ Suggestion: Extract validation logic

== Coverage Review ==
Coverage: 87% (target: 80%)
✓ All critical paths tested

RESULT: APPROVED with 2 suggestions
```

---

## 4. Release Deployment Workflow

Deployment with validation and rollback support.

### Team Structure

```
┌──────────┐    ┌───────────┐    ┌──────────┐
│  DevOps  │ →  │    QA     │ →  │  Deploy  │
│ (Build)  │    │ (Validate)│    │ (Ship)   │
└──────────┘    └───────────┘    └────┬─────┘
                                      │
                               ┌──────┴──────┐
                               │ Health Check│
                               └──────┬──────┘
                                      │
                        ┌─────────────┴─────────────┐
                        ▼                           ▼
                   ┌─────────┐                ┌──────────┐
                   │ Success │                │ Rollback │
                   └─────────┘                └──────────┘
```

### Command

```
/deploy-app --env staging|production
```

### Deployment Stages

1. **Build** — DevOps builds and packages application
2. **Validate** — QA runs smoke tests
3. **Deploy** — Ship to target environment
4. **Health Check** — Verify deployment success
5. **Rollback** — Automatic on failure

### Example

```
/deploy-app --env staging

[devops]    Building application...
[devops]    ✓ Build complete: v1.2.0
[qa]        Running smoke tests...
[qa]        ✓ 12/12 tests passed
[devops]    Deploying to staging...
[devops]    ✓ Deployment complete
[devops]    Running health checks...
[devops]    ✓ All services healthy

Deployment successful: https://staging.example.com
```

---

## 5. Research & Evaluation Workflow

Technology evaluation using adversarial analysis.

### Team Structure

```
┌─────────────┐
│  Proponent  │  → Argues FOR the technology
├─────────────┤
│   Critic    │  → Argues AGAINST
├─────────────┤
│  Evaluator  │  → Neutral synthesis
└──────┬──────┘
       │
  ┌────┴────┐
  │ Report  │  → Final recommendation
  └─────────┘
```

### Command

```
/research-tech <topic>
```

### Example

```
/research-tech "GraphQL vs REST for mobile API"

[proponent]   GraphQL advantages: single endpoint, exact data...
[critic]      GraphQL concerns: caching, complexity, N+1...
[evaluator]   Considering mobile use case...

== Recommendation ==
GraphQL is recommended for this use case because:
- Reduced payload sizes benefit mobile
- Single endpoint simplifies networking
- Schema provides contract for mobile team

Effort: ~2 weeks | Risk: Medium
```

---

## 6. Test Execution Workflow

Run tests with parallel execution.

### Command

```
/run-tests [--type unit|integration|e2e|all]
```

### Test Types

| Type | Tool | Scope |
|------|------|-------|
| Unit | Jest | Individual functions |
| Integration | Jest/Playwright | Component interactions |
| E2E | Playwright | Full user flows |

### Example

```
/run-tests --type all

[tester]  Running unit tests... 45/45 passed
[tester]  Running integration tests... 12/12 passed
[tester]  Running E2E tests... 8/8 passed

== Results ==
Total: 65 tests | Passed: 65 | Failed: 0
Coverage: 89%
```

---

## Creating Custom Workflows

### 1. Define the Team Template

Create a markdown file in `core/agents/teams/`:

```markdown
# Custom Team

## Team Members
- agent_1: Role description
- agent_2: Role description

## Execution Flow
agent_1 → agent_2 → output

## File Ownership
- agent_1: directory_a/
- agent_2: directory_b/
```

### 2. Create the Command

Add a command file in `.claude/commands/`:

```markdown
# /custom-command

Spawn a custom team to perform a task.

## Arguments
- `<arg>`: Description

## Execution
1. Launch agent_1 with context
2. Hand off to agent_2
3. Generate output
```

### 3. Document the Workflow

Add documentation in `docs/workflow.md`.

---

## Best Practices

### Clear Task Definitions
- Define acceptance criteria for each task
- Include context and constraints
- Specify expected outputs

### Respect File Ownership
- Each agent writes only to owned directories
- Use handoffs for cross-boundary work
- Reviewer remains read-only

### Use Parallel Execution
- Independent tasks run in parallel
- Reduces total execution time
- Better resource utilization

### Enable Adversarial Review
- Multiple perspectives catch more issues
- Challenge assumptions explicitly
- Synthesize the best solution
