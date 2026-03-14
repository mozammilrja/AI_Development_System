# Workflow Documentation

This document describes the workflow phases, task management, and agent collaboration patterns in the AI Development System.

---

## Table of Contents

1. [Execution Model](#execution-model)
2. [Workflow Phases](#workflow-phases)
3. [Task Management](#task-management)
4. [Agent Workflows](#agent-workflows)
5. [Commands Reference](#commands-reference)
6. [File-Based Coordination](#file-based-coordination)

---

## Execution Model

### Autonomous Parallel Execution

The AI Development System uses **fully autonomous parallel execution** where all 10 agents start simultaneously and work independently.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                       t=0 : ALL AGENTS START                              │
├──────────┬──────────┬──────────┬──────────┬──────────┬───────────────────┤
│ Product  │ Architect│ Backend  │ Frontend │    UI    │     DevOps        │
│ Manager  │          │ Engineer │ Engineer │ Designer │    Engineer       │
├──────────┼──────────┼──────────┼──────────┼──────────┼───────────────────┤
│ Security │    QA    │ Perform- │   Code   │          │                   │
│ Engineer │ Engineer │ ance Eng │ Reviewer │          │                   │
└──────────┴──────────┴──────────┴──────────┴──────────┴───────────────────┘
                                   │
                   [All working independently in parallel]
                                   │
                                   ▼
                         ┌─────────────────┐
                         │  FINAL REPORT   │
                         └─────────────────┘
```

### Key Principles

1. **No Sequential Phases** — All agents start at t=0
2. **File-Based Coordination** — Agents communicate through repository files
3. **Exclusive Ownership** — Each agent writes only to their directories
4. **Continuous Monitoring** — Agents watch for relevant file changes
5. **Independent Completion** — Agents complete when their work is done

---

## Workflow Phases

While agents work in parallel, their activities can be logically grouped into phases:

### Phase 1: Foundation (Parallel)

| Agent | Activity | Output |
|-------|----------|--------|
| **Product Manager** | Requirements gathering | `knowledge/product.md` |
| **Architect** | System design | `docs/architecture.md` |
| **UI Designer** | Design specifications | `ui/components/`, `ui/tokens/` |

### Phase 2: Implementation (Parallel)

| Agent | Activity | Output |
|-------|----------|--------|
| **Backend Engineer** | API implementation | `services/backend/` |
| **Frontend Engineer** | UI implementation | `services/frontend/` |
| **DevOps Engineer** | Infrastructure setup | `platform/` |

### Phase 3: Quality Assurance (Parallel)

| Agent | Activity | Output |
|-------|----------|--------|
| **QA Engineer** | Test writing | `tests/` |
| **Security Engineer** | Security audit | `security/` |
| **Performance Engineer** | Performance testing | `tests/benchmarks/` |

### Phase 4: Review & Finalization

| Agent | Activity | Output |
|-------|----------|--------|
| **Code Reviewer** | Final review | `reviews/` |

### Phase Diagram

```
            ┌───────────────────────────────────────────────────────────────┐
            │                    FEATURE BUILD WORKFLOW                      │
            └───────────────────────────────────────────────────────────────┘
                                         │
          ┌──────────────────────────────┼──────────────────────────────┐
          │                              │                              │
          ▼                              ▼                              ▼
┌──────────────────┐          ┌──────────────────┐          ┌──────────────────┐
│     PRODUCT      │          │    ARCHITECT     │          │   UI DESIGNER    │
│     MANAGER      │          │                  │          │                  │
│                  │          │  System Design   │          │  Design Specs    │
│  Requirements    │          │  API Contracts   │          │  Components      │
└────────┬─────────┘          └────────┬─────────┘          └────────┬─────────┘
         │                             │                              │
         └─────────────────────────────┼──────────────────────────────┘
                                       │
    ┌──────────────────────────────────┼──────────────────────────────────┐
    │                                  │                                  │
    ▼                                  ▼                                  ▼
┌──────────────────┐          ┌──────────────────┐          ┌──────────────────┐
│     BACKEND      │          │     FRONTEND     │          │      DEVOPS      │
│    ENGINEER      │          │    ENGINEER      │          │    ENGINEER      │
│                  │          │                  │          │                  │
│   APIs, DB       │          │  Components      │          │  CI/CD, Infra    │
└────────┬─────────┘          └────────┬─────────┘          └────────┬─────────┘
         │                             │                              │
         └─────────────────────────────┼──────────────────────────────┘
                                       │
    ┌──────────────────────────────────┼──────────────────────────────────┐
    │                                  │                                  │
    ▼                                  ▼                                  ▼
┌──────────────────┐          ┌──────────────────┐          ┌──────────────────┐
│   QA ENGINEER    │          │     SECURITY     │          │   PERFORMANCE    │
│                  │          │    ENGINEER      │          │    ENGINEER      │
│   Tests          │          │   Audits         │          │   Benchmarks     │
└────────┬─────────┘          └────────┬─────────┘          └────────┬─────────┘
         │                             │                              │
         └─────────────────────────────┼──────────────────────────────┘
                                       │
                                       ▼
                          ┌──────────────────────┐
                          │    CODE REVIEWER     │
                          │                      │
                          │    Final Review      │
                          └──────────────────────┘
                                       │
                                       ▼
                          ┌──────────────────────┐
                          │    FINAL REPORT      │
                          └──────────────────────┘
```

---

## Task Management

### Task Board Structure

Tasks are managed through a Kanban-style board in `core/tasks/`:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           TASK BOARD                                     │
├─────────────────────┬─────────────────────┬─────────────────────────────┤
│       BACKLOG       │     IN-PROGRESS     │         COMPLETED           │
│   (backlog.md)      │  (in-progress.md)   │      (completed.md)         │
├─────────────────────┼─────────────────────┼─────────────────────────────┤
│ □ TASK-001          │ ◐ TASK-002          │ ✓ TASK-000                  │
│   Design API        │   Implement auth    │   Project setup             │
│   [architect]       │   [backend-eng]     │   [devops-eng]              │
│                     │                     │                             │
│ □ TASK-003          │ ◐ TASK-004          │ ✓ TASK-005                  │
│   Create UI specs   │   Write tests       │   Requirements done         │
│   [ui-designer]     │   [qa-engineer]     │   [product-mgr]             │
└─────────────────────┴─────────────────────┴─────────────────────────────┘
```

### Task Lifecycle

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   CREATED   │ ──────► │   CLAIMED   │ ──────► │  COMPLETED  │
│             │         │             │         │             │
│ backlog.md  │         │in-progress  │         │completed.md │
└─────────────┘         └─────────────┘         └─────────────┘
       │                       │                       │
       │                       │                       │
  Agent finds            Agent moves            Agent moves
  task in backlog       to in-progress         to completed
```

### Task Format

Each task in the markdown files follows this format:

```markdown
## TASK-XXX: Task Title

- **Feature:** FEAT-XXX
- **Agent:** agent-name
- **Priority:** high | medium | low
- **Status:** pending | in-progress | completed
- **Created:** 2026-03-14T10:00:00Z

### Description
Detailed description of the task.

### Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

### Dependencies
- TASK-YYY (if any)
```

### State Synchronization

Task state is also tracked in `core/state/tasks.json`:

```json
{
  "version": "1.0.0",
  "lastUpdated": "2026-03-14T12:00:00Z",
  "tasks": [
    {
      "id": "TASK-001",
      "featureId": "FEAT-001",
      "title": "Design authentication API",
      "assignedTo": "architect",
      "status": "completed",
      "priority": "high",
      "createdAt": "2026-03-14T10:00:00Z",
      "completedAt": "2026-03-14T11:30:00Z"
    }
  ]
}
```

---

## Agent Workflows

### 1. Feature Development Workflow

**Command:** `/build-feature <feature-name>`

All 10 agents start simultaneously:

| Agent | Phase | Actions |
|-------|-------|---------|
| Product Manager | Foundation | Write requirements, user stories |
| Architect | Foundation | Design architecture, API contracts |
| UI Designer | Foundation | Create component specs, design tokens |
| Backend Engineer | Implementation | Implement APIs, services, database |
| Frontend Engineer | Implementation | Build React components, pages |
| DevOps Engineer | Implementation | Configure CI/CD, infrastructure |
| QA Engineer | Quality | Write unit, integration, E2E tests |
| Security Engineer | Quality | Perform security audit, OWASP checks |
| Performance Engineer | Quality | Create benchmarks, profile performance |
| Code Reviewer | Review | Final code quality review |

**Output Example:**

```
[t=0] All 10 agents started

[product-manager]     Writing requirements to knowledge/product.md
[architect]           Designing architecture in docs/architecture.md
[ui-designer]         Creating component specs in ui/
[backend-engineer]    Implementing services in services/backend/
[frontend-engineer]   Building components in services/frontend/
[devops-engineer]     Configuring pipeline in platform/
[qa-engineer]         Writing tests in tests/
[security-engineer]   Auditing code in security/
[performance-eng]     Creating benchmarks in tests/benchmarks/
[code-reviewer]       Reviewing changes in reviews/

[t=end] All agents completed

== FINAL REPORT ==
Product:     5 user stories defined
Architecture: System designed, 2 API contracts
Backend:     8 files, 450 lines, 4 endpoints
Frontend:    12 files, 6 components
UI:          4 component specs, design tokens
DevOps:      CI pipeline configured
Security:    0 critical, 1 medium issue
QA:          42 tests written, 100% passing
Performance: API < 50ms p95
Review:      APPROVED with suggestions
```

### 2. Code Review Workflow

**Command:** `/code-review`

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

### 3. Deployment Workflow

**Command:** `/deploy-app --env <staging|production>`

```
┌─────────────────────────────────────────┐
│        PHASE 1: Preparation (Parallel)  │
├──────────────┬──────────────┬───────────┤
│    DevOps    │      QA      │  Security │
│   Build      │   Prepare    │   Audit   │
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

### 4. Bug Fix Workflow

**Command:** `/fix-bug <description>`

```
┌─────────────────────────────────────────┐
│       DIAGNOSIS (Parallel)              │
├──────────────┬──────────────────────────┤
│   Backend    │        Frontend          │
│  Investigate │       Investigate        │
└──────────────┴──────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│       FIX IMPLEMENTATION                │
│    Backend or Frontend Engineer         │
└─────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│       VERIFICATION                      │
├──────────────┬──────────────────────────┤
│      QA      │       Security           │
│   Test Fix   │       Verify Fix         │
└──────────────┴──────────────────────────┘
```

---

## Commands Reference

### `/build-feature <name>`

Build a complete feature with all 10 agents.

```bash
/build-feature user-authentication
/build-feature shopping-cart with payment integration
```

**Creates tasks for:**
- Product Manager: Define requirements
- Architect: Design system
- UI Designer: Create specs
- Backend Engineer: Implement APIs
- Frontend Engineer: Build UI
- DevOps Engineer: Configure CI/CD
- QA Engineer: Write tests
- Security Engineer: Audit code
- Performance Engineer: Benchmark
- Code Reviewer: Final review

### `/code-review`

Run multi-perspective parallel code review.

```bash
/code-review
```

**Checks:**
- Security vulnerabilities
- Code quality standards
- Performance implications
- Test coverage

### `/deploy-app --env <environment>`

Deploy application to specified environment.

```bash
/deploy-app --env staging
/deploy-app --env production
```

**Stages:**
1. Build and package
2. Run pre-deployment tests
3. Deploy to environment
4. Run smoke tests
5. Validate deployment

### `/fix-bug <description>`

Debug and fix a reported issue.

```bash
/fix-bug "Login fails with special characters"
/fix-bug "Cart total incorrect with discounts"
```

### `/write-tests`

Generate comprehensive test suite.

```bash
/write-tests
/write-tests --focus unit
/write-tests --focus e2e
```

### `/security-audit`

Run security vulnerability scan.

```bash
/security-audit
```

**Checks:**
- OWASP Top 10
- Dependency vulnerabilities
- Authentication/Authorization
- Data exposure risks

### `/optimize-performance`

Analyze and optimize performance.

```bash
/optimize-performance
```

**Analyzes:**
- API response times
- Database queries
- Frontend bundle size
- Memory usage

---

## File-Based Coordination

### How Agents Coordinate

Agents coordinate by reading and writing repository files:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          FILE-BASED COORDINATION                          │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  Product Manager                                                          │
│       │                                                                   │
│       └──writes──► knowledge/product.md                                   │
│                          │                                                │
│                    ◄─reads─┘                                              │
│                          │                                                │
│  Architect ──────────────┼──writes──► docs/architecture.md                │
│                          │                                                │
│                    ◄─reads─┘                                              │
│                          │                                                │
│  ┌───────────────────────┼───────────────────────┐                        │
│  │ Backend Engineer      │      Frontend Engineer │                       │
│  │      │                │             │          │                       │
│  │      └──writes──► services/backend/ │          │                       │
│  │                       │             │          │                       │
│  │                       │  services/frontend/ ◄──┘                       │
│  └───────────────────────┼───────────────────────┘                        │
│                          │                                                │
│                    ◄─reads─┘                                              │
│                          │                                                │
│  QA Engineer ────────────┼──writes──► tests/                              │
│                          │                                                │
│  Security Engineer ──────┼──writes──► security/                           │
│                          │                                                │
│  Performance Engineer ───┼──writes──► tests/benchmarks/                   │
│                          │                                                │
│                    ◄─reads─┘                                              │
│                          │                                                │
│  Code Reviewer ──────────┴──writes──► reviews/                            │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

### Ownership Rules

1. **Exclusive Writes** — Agents ONLY write to their owned directories
2. **Universal Reads** — All agents can READ any file
3. **No Overlap** — Directory ownership does not overlap
4. **Code Reviewer is Read-Only** — Only writes to `reviews/`

### Ownership Table

| Agent | Exclusive Write Access |
|-------|------------------------|
| Product Manager | `knowledge/product.md`, `docs/user-stories/`, `docs/acceptance/` |
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

## See Also

- [Architecture Documentation](architecture.md) — System architecture details
- [Developer Guide](developer_guide.md) — Setup and contribution guide
- [Product Documentation](product.md) — Product overview and features
