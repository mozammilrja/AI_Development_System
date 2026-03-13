# Workflow Documentation

This document describes how agents collaborate in the AI Development System.

---

## Autonomous Parallel Execution Model

The AI Development System uses **fully autonomous parallel execution** where all 10 agents start simultaneously and work independently without waiting for each other.

### Key Principles

1. **No Sequential Phases** — All agents start at t=0
2. **File-Based Coordination** — Agents communicate through repository files
3. **Exclusive Ownership** — Each agent writes only to their directories
4. **Continuous Monitoring** — Agents watch for relevant file changes
5. **Independent Completion** — Agents complete when their work is done

---

## The 10-Agent Team

| Agent | Role | Writes To |
|-------|------|-----------|
| **Product Manager** | Requirements, user stories | `docs/product.md`, `docs/user-stories/` |
| **Architect** | System design, APIs | `docs/architecture.md`, `docs/api-contracts/` |
| **Backend Engineer** | APIs, services, database | `app/backend/` |
| **Frontend Engineer** | React components, pages | `app/frontend/` |
| **UI Designer** | Component specs, design tokens | `ui/` |
| **DevOps Engineer** | CI/CD, infrastructure | `platform/`, `.github/` |
| **Security Engineer** | Security audits, policies | `security/` |
| **QA Engineer** | Tests | `tests/` |
| **Performance Engineer** | Benchmarks, load tests | `tests/benchmarks/` |
| **Code Reviewer** | Code review reports | `reviews/` |

---

## 1. Feature Development Workflow

### Execution

All 10 agents start **simultaneously** when `/build-feature` is invoked:

```
┌──────────────────────────────────────────────────────────────────┐
│                    t=0 : ALL AGENTS START                          │
├──────────┬──────────┬──────────┬──────────┬──────────┬──────────┤
│ Product  │ Architect│ Backend  │ Frontend │ UI       │ DevOps   │
│ Manager  │          │ Engineer │ Engineer │ Designer │ Engineer │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ Security │ QA       │ Perform- │ Code     │          │          │
│ Engineer │ Engineer │ ance Eng │ Reviewer │          │          │
└──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘
                              │
              [All working independently in parallel]
                              │
                              ▼
                    ┌─────────────────┐
                    │  FINAL REPORT   │
                    └─────────────────┘
```

### Command

```bash
/build-feature user-authentication
```

### Agent Activities (All Simultaneous)

| Agent | Activity |
|-------|----------|
| Product Manager | Write requirements to `docs/product.md` |
| Architect | Design architecture, write to `docs/architecture.md` |
| Backend Engineer | Implement APIs in `app/backend/` |
| Frontend Engineer | Build UI in `app/frontend/` |
| UI Designer | Create designs in `ui/` |
| DevOps Engineer | Configure CI/CD in `platform/` |
| Security Engineer | Audit code, write to `security/` |
| QA Engineer | Write tests in `tests/` |
| Performance Engineer | Create benchmarks in `tests/benchmarks/` |
| Code Reviewer | Review code, write to `reviews/` |

### Example Output

```
[t=0] All 10 agents started

[product-manager]     Writing requirements...
[architect]           Designing system architecture...
[backend-engineer]    Implementing auth service...
[frontend-engineer]   Creating login components...
[ui-designer]         Creating design specs...
[devops-engineer]     Setting up CI pipeline...
[security-engineer]   Auditing authentication code...
[qa-engineer]         Writing auth tests...
[performance-engineer] Creating auth benchmarks...
[code-reviewer]       Reviewing all changes...

[t=end] All agents completed

== FINAL REPORT ==
Product: 5 user stories defined
Architecture: System designed, 2 ADRs created
Backend: 8 files, 450 lines
Frontend: 12 files, 6 components
UI: 4 component specs, design tokens
DevOps: CI pipeline configured
Security: 0 critical, 1 medium issue
QA: 42 tests written, 100% passing
Performance: API < 50ms
Review: APPROVED with suggestions
```

---

## 2. Code Review Workflow

Multi-perspective parallel review:

```
┌────────────────┬────────────────┬────────────────┬────────────────┐
│   Security     │   Quality      │   Performance  │     Test       │
│   Reviewer     │   Reviewer     │   Reviewer     │   Reviewer     │
└───────┬────────┴───────┬────────┴───────┬────────┴───────┬────────┘
        │                │                 │                │
        └────────────────┴─────────────────┴────────────────┘
                                  │
                         [All work in parallel]
                                  │
                                  ▼
                         ┌─────────────────┐
                         │    SUMMARY      │
                         └─────────────────┘
```

### Command

```bash
/code-review
```

---

## 3. Deployment Workflow

Parallel preparation followed by deployment:

```
┌─────────────────────────────────────────┐
│        PHASE 1: Preparation (Parallel)  │
├──────────────┬──────────────┬───────────┤
│    DevOps    │      QA      │  Security │
│    Build     │   Prepare    │   Audit   │
└──────────────┴──────────────┴───────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│        PHASE 2: Deploy                  │
│             DevOps                      │
└─────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│        PHASE 3: Validation (Parallel)   │
├──────────────────────┬──────────────────┤
│          QA          │     Security     │
│    Smoke Tests       │    Pen Test      │
└──────────────────────┴──────────────────┘
                     │
              ┌──────┴──────┐
              ▼             ▼
           SUCCESS       ROLLBACK
```

### Command

```bash
/deploy-app --env staging
```

---

## File-Based Coordination

Agents coordinate by reading and writing repository files:

### Product Manager → All Agents
```
writes: docs/product.md
reads:  (feature request)
```

### Architect → Backend/Frontend
```
writes: docs/architecture.md, docs/api-contracts/
reads:  docs/product.md
```

### Backend/Frontend → QA/Security/Performance
```
writes: app/backend/, app/frontend/
reads:  docs/architecture.md, docs/api-contracts/, ui/
```

### QA/Security/Performance → Code Reviewer
```
writes: tests/, security/, tests/benchmarks/
reads:  services/
```

### Code Reviewer → Final Report
```
writes: reviews/
reads:  (all)
```

---

## Status Tracking

Each agent updates `.agent-status/<agent>.json`:

```json
{
  "agent": "backend-engineer",
  "status": "active",
  "currentTask": "Implementing user service",
  "progress": 0.75,
  "filesChanged": ["app/backend/src/user.ts"],
  "lastUpdate": "2025-03-14T12:00:00Z"
}
```

---

## Ownership Rules

### Strict Enforcement
- Agents ONLY write to their owned directories
- Agents can READ any file
- Code Reviewer is READ-ONLY (writes only to `reviews/`)

### Conflict Prevention
- No directory overlap between agents
- Clear boundaries prevent write conflicts
- Agents monitor others' output for coordination

---

## Previous vs Current Model

### Previous (Sequential)

```
Phase 1: Architect designs
Phase 2: Backend + Frontend implement
Phase 3: Tester writes tests
Phase 4: Reviewer audits

Total time: Sum of all phases
```

### Current (Parallel)

```
t=0: All 10 agents start
t=end: All agents complete

Total time: Max(agent completion times)
```

**Benefit:** Significantly faster feature development through parallelization.
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
