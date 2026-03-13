# Build Feature Command

Create an agent team to build the feature: $ARGUMENTS

Spawn 5 teammates with these roles:

1. **Architect** — Analyze requirements and design the component architecture. Write the design to `docs/architecture.md` and create an ADR if needed. Require plan approval before the implementation teammates begin.
   - Owns: `docs/architecture.md`, `knowledge/architecture.md`
   - Model: Claude Sonnet

2. **Frontend Developer** — After the architect's plan is approved, implement the frontend components, pages, and styles.
   - Owns: `services/frontend/`, `ui/`
   - Do NOT edit files in `services/backend/` or `tests/`

3. **Backend Developer** — After the architect's plan is approved, implement APIs, services, and database models.
   - Owns: `services/backend/`, `services/database/`
   - Do NOT edit files in `services/frontend/` or `tests/`

4. **Tester** — After frontend and backend teammates finish, write unit tests, integration tests, and E2E tests for the new code.
   - Owns: `tests/unit/`, `tests/integration/`, `tests/e2e/`
   - Run `pytest` to validate all tests pass

5. **Reviewer** — After tester finishes, review all changes for security issues, performance problems, and code quality. Report findings to the lead.
   - Read-only: do NOT edit source files
   - Check: security vulnerabilities, error handling, test coverage gaps

Task dependencies:
- Architect must complete and get plan approved FIRST
- Frontend and Backend work in PARALLEL after architect approval
- Tester starts after BOTH frontend and backend complete
- Reviewer starts after tester completes

Wait for all teammates to complete their tasks before synthesizing the final summary.

Refer to `core/agents/teams/feature_team.md` for the full team template.
