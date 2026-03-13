# Build Feature Command

Build the feature: **$ARGUMENTS**

---

## Autonomous Parallel Execution

This command spawns agents that work **independently and in parallel**. All agents start immediately—no sequential phases.

---

## Agent Team

All agents spawn **simultaneously** at t=0:

| Agent | Owns | Does |
|-------|------|------|
| **Architect** | `docs/architecture.md`, `docs/adr/`, `docs/api-contracts/` | Design system, define APIs |
| **Backend Engineer** | `app/backend/`, `tests/unit/backend/` | Build APIs, services, models |
| **Frontend Engineer** | `app/frontend/`, `tests/unit/frontend/` | Build React components, pages |
| **Tester (QA)** | `tests/` | Write and run tests |
| **Code Reviewer** | `reviews/` | Review code quality |

---

## Execution Model

### Autonomous Parallel Execution

All agents operate **immediately and independently**:

1. **Immediate Start** — All agents begin work at t=0
2. **No Dependencies** — Agents don't wait for each other
3. **Async Collaboration** — Agents coordinate through repository file updates
4. **Independent Progress** — Each agent monitors repo and adapts as needed

### File Ownership Rules

```
CRITICAL: Agents must ONLY write to their owned directories.
Agents may READ any file but must NOT modify files owned by other agents.
```

### Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                 AUTONOMOUS PARALLEL EXECUTION                    │
│                 (All agents start at t=0)                        │
├─────────┬─────────┬─────────┬─────────┬─────────────────────────┤
│Architect│ Backend │ Frontend│  Tester │       Reviewer          │
│         │ Engineer│ Engineer│  (QA)   │                         │
├─────────┼─────────┼─────────┼─────────┼─────────────────────────┤
│    ↓    │    ↓    │    ↓    │    ↓    │           ↓             │
│  [work] │  [work] │  [work] │  [work] │        [work]           │
│    ↓    │    ↓    │    ↓    │    ↓    │           ↓             │
└─────────┴─────────┴─────────┴─────────┴─────────────────────────┘
                              │
              [Async collaboration via repo]
                              │
                              ▼
                    ┌─────────────────┐
                    │  FINAL REPORT   │
                    └─────────────────┘
```

---

## Agent Instructions

### Architect
```
START IMMEDIATELY. Do NOT wait for other agents.

1. Analyze the feature request: "$ARGUMENTS"
2. Design the system architecture
3. Write architecture docs to docs/architecture.md
4. Define API contracts in docs/api-contracts/
5. Create ADR for significant decisions
6. Monitor repo for implementation updates
```

### Backend Engineer
```
START IMMEDIATELY. Do NOT wait for other agents.

1. Read available architecture docs (if any) or design as needed
2. Implement APIs, services, and database models in app/backend/
3. Write unit tests in tests/unit/backend/
4. Write integration tests in tests/integration/
5. Document APIs in docs/api/
```

### Frontend Engineer
```
START IMMEDIATELY. Do NOT wait for other agents.

1. Read available UI designs and architecture (if any)
2. Build React components and pages in app/frontend/
3. Write unit tests in tests/unit/frontend/
4. Write E2E tests in tests/e2e/
5. Monitor for API contracts and integrate as they appear
```

### UI Designer
```
START IMMEDIATELY. Do NOT wait for other agents.

1. Analyze feature requirements
2. Create component specifications in ui/components/
3. Define design tokens in ui/tokens/
4. Document user flows in ui/flows/
5. Update docs/design/ with decisions
```

### DevOps Engineer
```
START IMMEDIATELY. Do NOT wait for other agents.

1. Set up CI/CD pipelines in .github/workflows/
2. Create/update Dockerfiles
3. Configure infrastructure in platform/
4. Document deployment in docs/infrastructure/
```

### Security Engineer
```
START IMMEDIATELY. Do NOT wait for other agents.

1. Monitor app/backend/ and app/frontend/ for new code
2. Audit for OWASP Top 10 vulnerabilities
3. Document findings in security/
4. Create security tests in tests/security/
```

### QA Engineer
```
START IMMEDIATELY. Do NOT wait for other agents.

1. Read requirements from docs/product.md (or feature request)
2. Write test plan in docs/testing/
3. Write unit tests for backend and frontend
4. Write integration and E2E tests
5. Run tests and report results
```

### Performance Engineer
```
START IMMEDIATELY. Do NOT wait for other agents.

1. Monitor services/ for new code
2. Create benchmarks in tests/benchmarks/benchmarks/
3. Create load tests in tests/benchmarks/load-tests/
4. Document performance findings in docs/tests/benchmarks/
```

### Code Reviewer
```
START IMMEDIATELY. Do NOT wait for other agents.

1. Monitor all code directories for changes
2. Review code for quality, security, and best practices
3. Write review reports in reviews/
4. Create final summary in reviews/summary.md
```

---

## Status Tracking

Each agent updates its status in `.agent-status/<agent-name>.json`:

```json
{
  "agent": "backend-engineer",
  "status": "active",
  "currentTask": "Implementing user authentication API",
  "progress": 0.6,
  "lastUpdate": "2025-03-14T12:00:00Z",
  "filesChanged": ["app/backend/src/auth.ts"],
  "findings": [],
  "blockers": []
}
```

---

## Completion

When all agents complete their work:

1. Generate final report summarizing:
   - Features implemented
   - Tests written and results
   - Security findings
   - Performance metrics
   - Code review summary
   
2. Report format:
   ```
   ## Feature Build Complete: $ARGUMENTS
   
   ### Product
   - Requirements defined: ✓/✗
   - User stories: N stories
   - Acceptance criteria: N criteria
   
   ### Implementation
   - Backend: N files, N lines
   - Frontend: N files, N components
   
   ### Quality
   - Tests: N total (N passed, N failed)
   - Coverage: N%
   - Security issues: N (N critical, N high, N medium, N low)
   - Performance: [targets met/not met]
   
   ### Code Review
   - Issues found: N
   - Status: Approved / Changes Requested
   ```

---

## Reference

See agent definitions in `.agents/*.yaml` for detailed specifications.

