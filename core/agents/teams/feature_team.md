# Feature Development Team Template

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

**File ownership:** `docs/architecture.md`, `knowledge/architecture.md`
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
