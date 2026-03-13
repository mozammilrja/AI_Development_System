# Deploy App Command

Deploy the application: $ARGUMENTS

Create an agent team with 2 teammates to handle deployment and validation in parallel.

Spawn these teammates:

1. **Deployer** — Execute the deployment pipeline:
   - Run pre-deployment checks (lint, type-check, dependency audit)
   - Build and package the application
   - Deploy to the target environment (default: staging)
   - Owns: `infrastructure/`, deployment configs
   - If any step fails, message the Validator immediately and halt
   - After successful deploy, message Validator to begin smoke tests

2. **Validator** — Monitor and validate the deployment:
   - Wait for Deployer to signal deployment is complete
   - Run smoke tests against the deployed environment
   - Check health endpoints and response times
   - Verify critical user flows work end-to-end
   - If validation fails, message Deployer to trigger ROLLBACK
   - Owns: `tests/e2e/`, monitoring checks

Rollback procedure:
- If Validator reports failures, Deployer must rollback immediately
- After rollback, both teammates report what went wrong
- Lead synthesizes a deployment failure report

Default environment: staging. Default strategy: rolling.

Refer to `core/agents/teams/release_team.md` for the full team template.
