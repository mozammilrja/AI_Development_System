# Run Tests Command

Run the test suite: $ARGUMENTS

Create an agent team with 3 teammates to run different test layers in parallel.

Spawn these teammates:

1. **Unit Test Runner** — Execute all unit tests:
   - Run `pytest tests/unit/ -v --tb=short --cov`
   - Analyze failures and identify broken modules
   - Report coverage percentage per module
   - Suggest missing unit tests for uncovered code paths
   - Owns: `tests/unit/`

2. **Integration Test Runner** — Execute all integration tests:
   - Run `pytest tests/integration/ -v --tb=short`
   - Check component interaction boundaries
   - Report any integration contract violations
   - Suggest missing integration tests for untested interactions
   - Owns: `tests/integration/`

3. **E2E Test Runner** — Execute end-to-end tests:
   - Run `pytest tests/e2e/ -v --tb=short`
   - Use Playwright for browser-based E2E tests if applicable
   - Report user flow coverage gaps
   - Suggest missing E2E scenarios
   - Owns: `tests/e2e/`

All test runners work in PARALLEL — no dependencies between them.

After all complete, synthesize:
- Total pass/fail counts across all layers
- Coverage summary
- Prioritized list of recommended new tests
- Any flaky test patterns detected
