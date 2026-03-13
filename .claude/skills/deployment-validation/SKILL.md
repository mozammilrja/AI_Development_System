# Deployment Validation Skill

## Description
Pre and post-deployment validation skill ensuring safe, reliable deployments.

## Capabilities
- Pre-deployment health checks
- Configuration validation
- Database migration verification
- Smoke test execution
- Performance baseline comparison
- Rollback readiness assessment
- Security scan of deployment artifacts
- SSL/TLS certificate validation

## Validation Pipeline
1. **Pre-Deploy Checks**: Verify build artifacts, configs, dependencies
2. **Infrastructure Validation**: Check target environment readiness
3. **Deployment Execution**: Monitor deployment progress
4. **Post-Deploy Smoke Tests**: Verify critical paths work
5. **Performance Validation**: Compare against baseline metrics
6. **Security Scan**: Run vulnerability checks on deployed service
7. **Rollback Test**: Verify rollback procedure works

## Health Check Endpoints
- `/health` — Basic health
- `/health/ready` — Readiness probe
- `/health/live` — Liveness probe
- `/health/dependencies` — Dependency status

## Metrics Monitored
- Response time (p50, p95, p99)
- Error rate
- CPU/Memory utilization
- Request throughput
- Database connection pool
