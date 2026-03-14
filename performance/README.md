# performance/

## Purpose

Performance benchmarks, profiling, and optimization tracking.

## Ownership

**Performance Engineer Agent** has primary ownership of this directory.

## Contents

- **benchmarks/**: Performance benchmark definitions
- **profiles/**: Profiling data and analysis
- **reports/**: Performance reports
- **configs/**: Performance testing configurations

## Structure

```
performance/
├── benchmarks/
│   ├── api/           # API benchmarks
│   ├── frontend/      # Frontend benchmarks
│   └── database/      # Database benchmarks
├── profiles/
│   └── YYYY-MM-DD/    # Dated profiles
├── reports/
│   └── YYYY-MM-DD-report.md
└── configs/
    ├── k6.config.js
    └── lighthouse.json
```

## Metrics

Key performance indicators tracked:
- API response times (p50, p95, p99)
- Frontend load time (FCP, LCP, TTI)
- Database query performance
- Memory usage
- CPU utilization

## Tooling

- **k6**: Load testing
- **Lighthouse**: Frontend audits
- **Custom benchmarks**: Jest-based
