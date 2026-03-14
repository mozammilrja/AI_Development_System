# Optimize Performance Command

Optimize performance for: **$ARGUMENTS**

---

## Workflow Activation

This command activates the Performance Engineer to analyze and optimize system performance.

---

## Phase 1: Initialize Optimization

```
1. Generate Optimization ID: PERF-XXX
2. Define optimization scope: "$ARGUMENTS"
3. Create tasks in core/tasks/backlog.md
4. Update core/state/tasks.json
5. Notify performance-engineer via agents.json
```

### Optimization Scope

```
ANALYZE target: "$ARGUMENTS"
SCOPE:
  - Backend API performance
  - Frontend load time
  - Database query optimization
  - Bundle size reduction
  - Memory usage
  - Caching strategies
```

### Create Performance Tasks

| Task ID | Agent | Description |
|---------|-------|-------------|
| TASK-PERF-001 | performance-engineer | Benchmark current performance |
| TASK-PERF-002 | performance-engineer | API optimization |
| TASK-PERF-003 | performance-engineer | Database optimization |
| TASK-PERF-004 | performance-engineer | Frontend optimization |
| TASK-PERF-005 | performance-engineer | Generate performance report |

---

## Phase 2: Baseline Benchmarking

**Agent:** Performance Engineer

```
PERFORMANCE ENGINEER:
1. Claim TASK-PERF-001 from backlog
2. Update agents.json: status = "working"
3. Establish baseline metrics:

   Backend Metrics:
   - API response times (p50, p95, p99)
   - Throughput (requests/second)
   - Error rates
   - Memory usage
   - CPU usage
   
   Frontend Metrics:
   - First Contentful Paint (FCP)
   - Largest Contentful Paint (LCP)
   - Time to Interactive (TTI)
   - Cumulative Layout Shift (CLS)
   - Bundle size
   
   Database Metrics:
   - Query execution times
   - Connection pool usage
   - Index efficiency
   
4. Write baseline to performance/benchmarks/
5. Mark task complete
```

### Benchmark Script

```typescript
// tests/benchmarks/baseline.bench.ts

import { bench, describe } from 'vitest';
import request from 'supertest';
import { app } from '../../services/backend/src/app';

describe('API Performance Baseline', () => {
  bench('GET /api/resource', async () => {
    await request(app).get('/api/resource');
  });

  bench('POST /api/resource', async () => {
    await request(app)
      .post('/api/resource')
      .send({ data: 'test' });
  });
});
```

---

## Phase 3: API Optimization

**Agent:** Performance Engineer

```
PERFORMANCE ENGINEER:
1. Claim TASK-PERF-002 from backlog
2. Analyze API bottlenecks:

   Optimization Targets:
   - [ ] Slow endpoints (>200ms p95)
   - [ ] N+1 query patterns
   - [ ] Missing caching
   - [ ] Synchronous operations
   - [ ] Large payloads
   
3. Implement optimizations:
   - Add caching (Redis/in-memory)
   - Implement pagination
   - Add compression (gzip)
   - Optimize serialization
   - Add connection pooling
   
4. Benchmark after changes
5. Document improvements
6. Mark task complete
```

### API Optimization Checklist

- [ ] Response caching implemented
- [ ] Query optimization applied
- [ ] Pagination added to list endpoints
- [ ] Gzip compression enabled
- [ ] Keep-alive connections
- [ ] Rate limiting configured
- [ ] Async operations where possible

---

## Phase 4: Database Optimization

**Agent:** Performance Engineer

```
PERFORMANCE ENGINEER:
1. Claim TASK-PERF-003 from backlog
2. Analyze database performance:

   Analysis:
   - Slow query log review
   - Index usage analysis
   - Query plan examination
   - Connection pool efficiency
   
3. Implement optimizations:
   - Add missing indexes
   - Optimize slow queries
   - Implement query caching
   - Adjust connection pool
   - Add read replicas (if needed)
   
4. Benchmark queries before/after
5. Document improvements
6. Mark task complete
```

### Database Optimization Checklist

- [ ] Indexes on frequently queried columns
- [ ] Composite indexes for common queries
- [ ] Query plans reviewed
- [ ] N+1 queries eliminated
- [ ] Connection pool sized correctly
- [ ] Query caching implemented
- [ ] Slow query logging enabled

---

## Phase 5: Frontend Optimization

**Agent:** Performance Engineer

```
PERFORMANCE ENGINEER:
1. Claim TASK-PERF-004 from backlog
2. Analyze frontend performance:

   Analysis:
   - Lighthouse audit
   - Bundle size analysis
   - Network waterfall
   - Render performance
   
3. Implement optimizations:

   Bundle Optimization:
   - [ ] Code splitting
   - [ ] Tree shaking
   - [ ] Dynamic imports
   - [ ] Minification
   
   Asset Optimization:
   - [ ] Image compression
   - [ ] Lazy loading
   - [ ] CDN usage
   - [ ] Preloading critical assets
   
   Render Optimization:
   - [ ] Virtualization for lists
   - [ ] Memoization (useMemo, useCallback)
   - [ ] Debouncing/throttling
   - [ ] Web Workers for heavy tasks
   
4. Run Lighthouse after changes
5. Document improvements
6. Mark task complete
```

### Frontend Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| FCP | < 1.8s | ? |
| LCP | < 2.5s | ? |
| TTI | < 3.8s | ? |
| CLS | < 0.1 | ? |
| Bundle Size | < 250KB | ? |

---

## Phase 6: Generate Performance Report

**Agent:** Performance Engineer

```
PERFORMANCE ENGINEER:
1. Claim TASK-PERF-005 from backlog
2. Compile all metrics
3. Calculate improvements
4. Write report to performance/reports/PERF-XXX.md
5. Update performance/benchmarks/
6. Create follow-up tasks if needed
7. Mark task complete
8. Update progress.json
```

---

## Phase 7: Completion

```
1. Verify all performance tasks completed
2. Review performance report
3. Update core/state/progress.json
4. Archive benchmark data
5. Agent returns to idle
```

---

## Performance Report Template

```markdown
# Performance Optimization Report: PERF-XXX

## Executive Summary
- **Optimization Date:** YYYY-MM-DD
- **Scope:** $ARGUMENTS
- **Overall Improvement:** X%

## Metrics Comparison

### Backend Performance

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| p50 latency | Xms | Xms | -X% |
| p95 latency | Xms | Xms | -X% |
| p99 latency | Xms | Xms | -X% |
| Throughput | X rps | X rps | +X% |
| Memory | X MB | X MB | -X% |

### Frontend Performance

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| FCP | X.Xs | X.Xs | <1.8s |
| LCP | X.Xs | X.Xs | <2.5s |
| TTI | X.Xs | X.Xs | <3.8s |
| CLS | X.XX | X.XX | <0.1 |
| Bundle | X KB | X KB | <250KB |

### Database Performance

| Query | Before | After | Improvement |
|-------|--------|-------|-------------|
| Query A | Xms | Xms | -X% |
| Query B | Xms | Xms | -X% |

## Optimizations Applied

### Backend
1. Added Redis caching for GET endpoints
2. Implemented connection pooling
3. Added gzip compression

### Database
1. Added index on `users.email`
2. Optimized slow query in `getOrders()`
3. Implemented query result caching

### Frontend
1. Implemented code splitting
2. Added lazy loading for images
3. Memoized expensive components

## Recommendations

1. Continue monitoring p99 latency
2. Consider CDN for static assets
3. Evaluate read replicas for scaling

## Benchmark Files
- performance/benchmarks/api.bench.ts
- performance/benchmarks/frontend.bench.ts
- performance/benchmarks/database.bench.ts

## Sign-off
- **Engineer:** performance-engineer
- **Date:** YYYY-MM-DD
```

---

## Execution Loop

```
WHILE optimization.status != "completed":
    performance_engineer.claim_tasks()
    
    # Baseline
    performance_engineer.benchmark_baseline()
    performance_engineer.document_metrics()
    
    # API Optimization
    performance_engineer.analyze_api()
    performance_engineer.optimize_api()
    performance_engineer.benchmark_api()
    
    # Database Optimization
    performance_engineer.analyze_database()
    performance_engineer.optimize_queries()
    performance_engineer.add_indexes()
    performance_engineer.benchmark_database()
    
    # Frontend Optimization
    performance_engineer.run_lighthouse()
    performance_engineer.optimize_bundle()
    performance_engineer.optimize_rendering()
    performance_engineer.benchmark_frontend()
    
    # Report
    performance_engineer.generate_report()
    
    performance_engineer.complete_tasks()

GENERATE performance_report()
UPDATE performance/reports/PERF-XXX.md
```
