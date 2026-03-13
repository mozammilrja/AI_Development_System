# Deploy App Command

Deploy the application: **$ARGUMENTS**

---

## Deployment Team

Spawn these agents for deployment:

| # | Agent | Role | Owns |
|---|-------|------|------|
| 1 | **DevOps Engineer** | Execute deployment | `platform/`, `.github/` |
| 2 | **QA Engineer** | Validate deployment | `tests/e2e/` |
| 3 | **Security Engineer** | Security validation | `security/` |

---

## Deployment Process

### Phase 1: Pre-Deployment (Parallel)

```
┌──────────────────┬──────────────────┬──────────────────┐
│  DevOps          │  QA              │  Security        │
│  - Build         │  - Prepare tests │  - Final audit   │
│  - Package       │  - Setup env     │  - Scan deps     │
└────────┬─────────┴────────┬─────────┴────────┬─────────┘
         │                  │                   │
         └──────────────────┴───────────────────┘
                            │
                      [All ready?]
                            │
                            ▼
```

### Phase 2: Deploy

```
┌─────────────────────────────────────────┐
│            DevOps Engineer               │
│  1. Deploy to target environment         │
│  2. Wait for health checks               │
│  3. Signal QA for validation             │
└─────────────────────────────────────────┘
```

### Phase 3: Validation (Parallel)

```
┌──────────────────┬──────────────────┐
│  QA Engineer     │  Security        │
│  - Smoke tests   │  - Pen test      │
│  - E2E tests     │  - Config audit  │
│  - Health checks │  - TLS check     │
└────────┬─────────┴────────┬─────────┘
         │                  │
         └──────────────────┘
                 │
           [Validation]
                 │
         ┌───────┴───────┐
         │               │
       PASS            FAIL
         │               │
         ▼               ▼
    [Complete]      [Rollback]
```

---

## Environment Options

```
/deploy-app --env staging     # Deploy to staging (default)
/deploy-app --env production  # Deploy to production
```

---

## Rollback

If validation fails:
1. DevOps Engineer triggers immediate rollback
2. Previous version is restored
3. Failure report is generated

---

## Success Criteria

- All health endpoints return 200
- Smoke tests pass
- E2E critical paths work
- No security vulnerabilities detected
- Response times within targets

---

## Output

Deployment report:

```markdown
# Deployment Report

## Environment: [staging/production]
## Status: [SUCCESS/FAILED/ROLLED_BACK]

## Pre-Deployment
- Build: ✓/✗
- Security scan: ✓/✗

## Deployment
- Version: x.y.z
- Started: [timestamp]
- Completed: [timestamp]

## Validation
- Health checks: ✓/✗
- Smoke tests: ✓/✗ (passed/total)
- E2E tests: ✓/✗ (passed/total)
- Security: ✓/✗

## Issues
[List any issues encountered]
```
