# security/

## Purpose

Security policies, audits, and compliance configurations.

## Ownership

**Security Engineer Agent** has primary ownership of this directory.

## Contents

- **policies/**: Security policies and guidelines
- **audits/**: Security audit reports
- **scans/**: Vulnerability scan configurations
- **compliance/**: Compliance documentation

## Structure

```
security/
├── policies/
│   ├── authentication.md
│   ├── authorization.md
│   ├── data-protection.md
│   └── incident-response.md
├── audits/
│   └── YYYY-MM-DD-audit.md
├── scans/
│   ├── dependency-scan.yaml
│   └── code-scan.yaml
└── compliance/
    ├── gdpr.md
    └── soc2.md
```

## Security Practices

- Regular dependency scanning
- Static code analysis
- Secret detection
- Access control reviews
- Penetration testing

## Audit Process

Security audits are performed:
- Before major releases
- After significant changes
- On regular schedule (quarterly)
