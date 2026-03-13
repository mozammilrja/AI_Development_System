# Release Coordination Team Template

## Team Goal

Safely build, deploy, and validate a release to a target environment. The Deployer runs pre-flight checks, builds, and deploys; the Validator independently verifies the deployment. If validation fails, the Deployer executes an automatic rollback — ensuring no broken release stays live.

## Team Members

| # | Agent | Role on Team |
|---|-------|--------------|
| 1 | Deployer | Builds, packages, and deploys the application; executes rollback on failure |
| 2 | Validator | Independently verifies the deployment via smoke tests and health checks |

## Responsibilities

| Agent | Must Do | Must NOT Do |
|-------|---------|-------------|
| Deployer | Run lint/type-check/audit, run tests, build, deploy, rollback on failure | Approve its own deployment |
| Validator | Run smoke tests, check health endpoints, verify critical user flows | Deploy or modify infrastructure |

## File Ownership

| Agent | Writable Paths |
|-------|----------------|
| Deployer | `platform/infrastructure/`, deployment configs, build artifacts |
| Validator | `tests/e2e/`, monitoring/validation scripts |

No overlap — Deployer owns infrastructure, Validator owns validation tests.

## Communication Rules

1. **Deployer → Validator**: Message when deployment is complete and ready for validation.
2. **Deployer → Validator**: Message immediately if any pre-deploy step fails (halt pipeline).
3. **Validator → Deployer**: Message with SUCCESS if all checks pass.
4. **Validator → Deployer**: Message with FAILURE + details if any check fails (triggers rollback).
5. **Deployer → Lead**: Report final status (success or rollback-complete) after pipeline ends.
6. **No self-approval**: Deployer never validates its own deployment.

## Task Flow

```
1. Deployer: pre-flight checks (lint, types, audit)
2. Deployer: run full test suite
3. Deployer: build and package
4. Deployer: deploy to target env ──(message)──▶
5. Validator: smoke tests + health checks + user flows
         │
    ┌─ PASS ──▶ 6a. Validator reports SUCCESS → Done
    └─ FAIL ──▶ 6b. Validator messages Deployer
                7. Deployer executes ROLLBACK
                8. Validator re-checks rolled-back version
                9. Lead produces failure report
```

## Team Structure
- **Team size**: 2 teammates
- **Pattern**: Sequential with communication-based handoff
- **Estimated tasks per teammate**: 4-5

## Dependency Graph
```
Deployer ── signals ready ──→ Validator
Validator ── signals failure ──→ Deployer (rollback)
```

## Teammate Definitions

### 1. Deployer
**Spawn prompt:**
> Execute the deployment pipeline for environment: {{TARGET_ENV}} using strategy: {{STRATEGY}}.
> Steps:
> 1. Run pre-deployment checks: lint, type-check, dependency audit
> 2. Run the full test suite (`pytest tests/ -v`)
> 3. Build and package the application
> 4. Deploy to {{TARGET_ENV}}
> 5. Message the Validator teammate when deployment is complete
> If any step fails, message the Validator immediately and halt.
> If the Validator reports validation failures, execute ROLLBACK immediately.
> After rollback, report what went wrong.
> Owns: `platform/infrastructure/`, deployment configs, build artifacts.

**File ownership:** `platform/infrastructure/`, deployment configs

### 2. Validator
**Spawn prompt:**
> Validate the deployment to {{TARGET_ENV}} after the Deployer signals completion.
> Steps:
> 1. Wait for Deployer to message that deployment is ready
> 2. Run smoke tests against the deployed environment
> 3. Check health endpoints and verify response times
> 4. Verify critical user flows work end-to-end
> 5. If all checks pass, report SUCCESS to the lead
> 6. If any check fails, message the Deployer to trigger ROLLBACK
> Owns: `tests/e2e/`, monitoring and validation checks.

**File ownership:** `tests/e2e/`

## Rollback Protocol
1. Validator detects failure → messages Deployer with failure details
2. Deployer executes rollback to previous version
3. Validator re-runs health checks against rolled-back version
4. Both report status to lead
5. Lead produces deployment failure report

## Placeholders
- `{{TARGET_ENV}}` — Target environment: `staging` or `production` (default: staging)
- `{{STRATEGY}}` — Deployment strategy: `rolling`, `blue-green`, or `canary` (default: rolling)

## Best Practices
- Always deploy to staging first, validate, then production
- Deployer and Validator communicate via direct messages for handoff
- Validator should never approve a deployment it hasn't independently verified
- Keep rollback path always available — never delete the previous version before validation
