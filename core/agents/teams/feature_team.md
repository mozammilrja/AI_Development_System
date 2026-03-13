# Feature Development Team Template

## Team Goal

Design, implement, test, and review a complete feature across the full stack. The Architect produces an approved design, Frontend and Backend agents implement in parallel with no file conflicts, the Tester validates both sides, and the Reviewer performs a final quality gate — all without human intervention.

## Team Members

| # | Agent | Role on Team |
|---|-------|--------------|
| 1 | Architect | Lead designer — produces the plan that all others follow |
| 2 | Frontend Developer | Implements UI components and client-side logic |
| 3 | Backend Developer | Implements API endpoints, services, and database changes |
| 4 | Tester | Writes and runs unit, integration, and E2E tests |
| 5 | Reviewer | Read-only code quality and security review |

## Responsibilities

| Agent | Must Do | Must NOT Do |
|-------|---------|-------------|
| Architect | Design component architecture, write ADR, define API contracts | Modify source code |
| Frontend | Build React/TypeScript components, write component tests | Edit files outside `apps/frontend/` or `saas-app/frontend/` |
| Backend | Build API endpoints, services, DB models/migrations | Edit files outside `apps/backend/`, `apps/database/`, `saas-app/backend/` |
| Tester | Write tests, run test suites, report coverage gaps | Edit application source code |
| Reviewer | Report security, performance, and quality findings | Edit any files (read-only) |

## File Ownership

| Agent | Writable Paths |
|-------|----------------|
| Architect | `docs/architecture.md`, `docs/knowledge/architecture.md` |
| Frontend | `apps/frontend/`, `saas-app/frontend/` |
| Backend | `apps/backend/`, `apps/database/`, `saas-app/backend/` |
| Tester | `tests/` |
| Reviewer | None (read-only) |

No two agents share write access to the same path. All agents may read all files.

## Communication Rules

1. **Architect → Lead**: Architect submits design for plan approval. No implementation begins until approved.
2. **Lead → Frontend, Backend**: After approval, lead spawns both agents simultaneously with the approved design.
3. **Frontend ↔ Backend**: No direct messaging. They share the Architect's API contracts as their interface.
4. **Frontend, Backend → Tester**: Implementation artifacts are available once both complete.
5. **Tester → Reviewer**: Test results and coverage report accompany the code for review.
6. **Reviewer → Lead**: Final report aggregated by lead. No file edits by Reviewer.

## Task Flow

```
1. Architect designs  ──(plan approval)──▶
2. Frontend builds UI  ──┐
                         ├──(both complete)──▶
3. Backend builds API ──┘
4. Tester validates   ──(tests pass)──▶
5. Reviewer audits    ──(report)──▶ Done
```

## Team Structure
- **Team size**: 5 teammates
- **Pattern**: Sequential with parallel middle layer
- **Estimated tasks per teammate**: 3-5

## Dependency Graph
```
Architect (plan approval required)
    ├── Frontend Developer (parallel)
    └── Backend Developer  (parallel)
            └── Tester
                  └── Reviewer
```

## Teammate Definitions

### 1. Architect
**Spawn prompt:**
> Analyze the feature requirements: {{FEATURE_DESCRIPTION}}. Design the component architecture
> including API contracts, data models, component boundaries, and integration points. Write your
> design to `docs/architecture.md`. Create an ADR if this involves a significant technical decision.
> Do NOT modify any source code — design only.

**File ownership:** `docs/architecture.md`, `docs/knowledge/architecture.md`
**Model:** Claude Sonnet (high capability needed for design)
**Plan approval:** REQUIRED — lead must approve before implementation begins

### 2. Frontend Developer
**Spawn prompt:**
> Implement the frontend for: {{FEATURE_DESCRIPTION}}. Follow the architect's approved design.
> Create React/TypeScript components in `apps/frontend/`. Follow the conventions in
> `apps/frontend/CLAUDE.md`. Write component-level tests alongside implementation.
> Do NOT edit files outside `apps/frontend/`.

**File ownership:** `apps/frontend/`
**Depends on:** Architect plan approved

### 3. Backend Developer
**Spawn prompt:**
> Implement the backend for: {{FEATURE_DESCRIPTION}}. Follow the architect's approved design.
> Create FastAPI endpoints and services in `apps/backend/`. Create database models in
> `apps/database/`. Follow the conventions in `apps/backend/CLAUDE.md`.
> Do NOT edit files outside `apps/backend/` and `apps/database/`.

**File ownership:** `apps/backend/`, `apps/database/`
**Depends on:** Architect plan approved

### 4. Tester
**Spawn prompt:**
> Write comprehensive tests for the feature: {{FEATURE_DESCRIPTION}}. Cover all new code from
> the frontend and backend teammates. Create unit tests in `tests/unit/`, integration tests in
> `tests/integration/`, and E2E tests in `tests/e2e/`. Follow the conventions in `tests/CLAUDE.md`.
> Run all tests and ensure they pass. Report coverage gaps.

**File ownership:** `tests/`
**Depends on:** Frontend Developer AND Backend Developer complete

### 5. Reviewer
**Spawn prompt:**
> Review all changes for: {{FEATURE_DESCRIPTION}}. Check for security vulnerabilities, performance
> issues, error handling gaps, and code quality problems. Do NOT edit any source files — report
> findings only. Rate each issue by severity (Critical/High/Medium/Low).

**File ownership:** None (read-only)
**Depends on:** Tester complete

## Placeholders
- `{{FEATURE_DESCRIPTION}}` — Natural language description of the feature to build

## Best Practices
- Frontend and Backend teammates work in parallel — ensure no file overlap
- Architect's plan must be approved before implementation begins
- Tester should verify both frontend and backend code
- Reviewer is read-only to avoid conflicts
- Target 5-6 tasks per teammate
