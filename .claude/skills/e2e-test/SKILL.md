# E2E Test Skill

## Description
End-to-end testing skill that enables agents to write, run, and analyze E2E tests.
Covers full user flows from frontend through backend to database.

## Capabilities
- Generate E2E test scenarios from user stories
- Write Playwright/Cypress test scripts
- Execute tests against staging environments
- Capture test artifacts (screenshots, videos, traces)
- Analyze test failures and suggest fixes
- Generate test coverage reports
- Handle flaky test detection and retry logic

## Workflow
1. Parse user story or feature requirements
2. Generate test scenarios and edge cases
3. Write test scripts using chosen framework
4. Execute tests in isolated environment
5. Collect results and artifacts
6. Report findings with actionable insights

## Tools Required
- Browser automation tools
- Test execution runtime
- Screenshot/video capture
- DOM extraction for assertions

## Configuration
- Framework: Playwright (default)
- Parallel workers: 4
- Retry count: 2
- Screenshot on failure: enabled
- Video recording: on-failure
