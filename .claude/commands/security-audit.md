# Security Audit Command

Perform security audit on: **$ARGUMENTS**

---

## Workflow Activation

This command activates the Security Engineer to perform a comprehensive security audit.

---

## Phase 1: Initialize Audit

```
1. Generate Audit ID: AUDIT-XXX
2. Define audit scope: "$ARGUMENTS"
3. Create audit tasks in core/tasks/backlog.md
4. Update core/state/tasks.json
5. Notify security-engineer via agents.json
```

### Audit Scope

```
ANALYZE target: "$ARGUMENTS"
SCOPE:
  - Code review for vulnerabilities
  - Dependency scanning
  - Configuration review
  - Authentication/Authorization audit
  - Data protection assessment
```

### Create Audit Tasks

| Task ID | Agent | Description |
|---------|-------|-------------|
| TASK-SEC-001 | security-engineer | Dependency vulnerability scan |
| TASK-SEC-002 | security-engineer | Code security review |
| TASK-SEC-003 | security-engineer | Auth/AuthZ audit |
| TASK-SEC-004 | security-engineer | Configuration security |
| TASK-SEC-005 | security-engineer | Generate audit report |

---

## Phase 2: Dependency Scan

**Agent:** Security Engineer

```
SECURITY ENGINEER:
1. Claim TASK-SEC-001 from backlog
2. Update agents.json: status = "working"
3. Scan dependencies:
   - npm audit (Node.js)
   - Check for known CVEs
   - Analyze transitive dependencies
4. Document findings:
   - Critical vulnerabilities
   - High vulnerabilities
   - Medium/Low vulnerabilities
5. Create remediation tasks if needed
6. Mark task complete
```

### Dependency Scan Checklist

- [ ] npm audit run
- [ ] Outdated packages identified
- [ ] Known CVEs checked
- [ ] License compliance verified
- [ ] Remediation plan created

---

## Phase 3: Code Security Review

**Agent:** Security Engineer

```
SECURITY ENGINEER:
1. Claim TASK-SEC-002 from backlog
2. Review code for vulnerabilities:
   
   OWASP Top 10 Check:
   - [ ] A01: Broken Access Control
   - [ ] A02: Cryptographic Failures
   - [ ] A03: Injection
   - [ ] A04: Insecure Design
   - [ ] A05: Security Misconfiguration
   - [ ] A06: Vulnerable Components
   - [ ] A07: Auth Failures
   - [ ] A08: Data Integrity Failures
   - [ ] A09: Logging Failures
   - [ ] A10: SSRF

3. Check for common issues:
   - SQL/NoSQL injection
   - XSS vulnerabilities
   - CSRF protection
   - Path traversal
   - Command injection
   - Insecure deserialization
   
4. Document findings in security/audits/
5. Mark task complete
```

### Code Review Locations

| Component | Path | Focus |
|-----------|------|-------|
| Backend API | services/backend/src/api/ | Input validation, injection |
| Auth | services/backend/src/auth/ | Token handling, session |
| Database | services/backend/src/models/ | Query safety |
| Frontend | services/frontend/src/ | XSS, data handling |

---

## Phase 4: Authentication & Authorization Audit

**Agent:** Security Engineer

```
SECURITY ENGINEER:
1. Claim TASK-SEC-003 from backlog
2. Review authentication:
   - Password policies
   - Token management (JWT)
   - Session handling
   - MFA implementation
   - Brute force protection
   
3. Review authorization:
   - Role-based access control
   - Permission checks
   - Resource ownership
   - API endpoint protection
   
4. Test scenarios:
   - Privilege escalation attempts
   - Horizontal access attempts
   - Token manipulation
   
5. Document findings
6. Mark task complete
```

### Auth Audit Checklist

- [ ] Strong password requirements
- [ ] Secure token storage
- [ ] Token expiration implemented
- [ ] Refresh token rotation
- [ ] Rate limiting on auth endpoints
- [ ] Account lockout mechanism
- [ ] RBAC properly implemented
- [ ] All endpoints protected

---

## Phase 5: Configuration Security

**Agent:** Security Engineer

```
SECURITY ENGINEER:
1. Claim TASK-SEC-004 from backlog
2. Review configurations:

   Environment & Secrets:
   - [ ] No hardcoded secrets
   - [ ] Env vars properly used
   - [ ] Secrets in secure storage
   - [ ] .env not in git
   
   Server Configuration:
   - [ ] HTTPS enforced
   - [ ] Security headers set
   - [ ] CORS properly configured
   - [ ] Rate limiting enabled
   
   Database Configuration:
   - [ ] Connection strings secure
   - [ ] Minimal privileges
   - [ ] Encryption at rest
   
3. Document findings
4. Mark task complete
```

### Security Headers Checklist

```
Content-Security-Policy: default-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
Referrer-Policy: strict-origin-when-cross-origin
```

---

## Phase 6: Generate Audit Report

**Agent:** Security Engineer

```
SECURITY ENGINEER:
1. Claim TASK-SEC-005 from backlog
2. Compile all findings
3. Calculate risk scores
4. Prioritize remediation
5. Write report to security/audits/AUDIT-XXX.md
6. Update security/policies/ if needed
7. Create fix tasks for critical issues
8. Mark task complete
9. Update progress.json
```

---

## Phase 7: Completion

```
1. Verify all audit tasks completed
2. Review audit report
3. Update core/state/progress.json
4. Generate summary
5. Agent returns to idle
```

---

## Audit Report Template

```markdown
# Security Audit Report: AUDIT-XXX

## Executive Summary
- **Audit Date:** YYYY-MM-DD
- **Scope:** $ARGUMENTS
- **Risk Level:** Critical/High/Medium/Low
- **Status:** Complete

## Findings Summary

| Severity | Count | Remediated |
|----------|-------|------------|
| Critical | X | X |
| High | X | X |
| Medium | X | X |
| Low | X | X |

## Detailed Findings

### Critical Vulnerabilities

#### [VULN-001] Vulnerability Title
- **Location:** path/to/file:line
- **Description:** What was found
- **Impact:** Potential impact
- **Remediation:** How to fix
- **Status:** Open/Fixed

### High Vulnerabilities
...

### Medium Vulnerabilities
...

### Low Vulnerabilities
...

## Dependency Audit

| Package | Current | Vulnerability | Severity |
|---------|---------|---------------|----------|
| package | v1.0.0 | CVE-XXXX | High |

## Compliance Status

| Check | Status |
|-------|--------|
| OWASP Top 10 | ✓/✗ |
| Input Validation | ✓/✗ |
| Authentication | ✓/✗ |
| Authorization | ✓/✗ |
| Encryption | ✓/✗ |
| Logging | ✓/✗ |

## Recommendations

1. Priority remediation items
2. Long-term improvements
3. Process improvements

## Sign-off
- **Auditor:** security-engineer
- **Date:** YYYY-MM-DD
```

---

## Execution Loop

```
WHILE audit.status != "completed":
    security_engineer.claim_tasks()
    
    # Dependency Scan
    security_engineer.scan_dependencies()
    security_engineer.document_findings()
    
    # Code Review
    security_engineer.review_code()
    security_engineer.check_owasp_top_10()
    
    # Auth Audit
    security_engineer.audit_auth()
    security_engineer.audit_authz()
    
    # Config Review
    security_engineer.review_config()
    security_engineer.check_secrets()
    
    # Report
    security_engineer.generate_report()
    security_engineer.create_remediation_tasks()
    
    security_engineer.complete_tasks()

GENERATE audit_report()
UPDATE security/audits/AUDIT-XXX.md
```
