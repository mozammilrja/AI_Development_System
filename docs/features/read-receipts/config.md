# DevOps Configuration: Read Receipts

**Feature:** Chat Read Receipts  
**Owner:** DevOps Engineer Agent  
**Date:** 2026-03-14  

---

## Infrastructure Requirements

### Database Indexes

Apply the following migration to MongoDB:

```javascript
// migrations/2026-03-14-read-receipts-indexes.js
db.read_receipts.createIndex(
  { messageId: 1, userId: 1 },
  { unique: true, name: 'idx_message_user_unique' }
);

db.read_receipts.createIndex(
  { conversationId: 1, userId: 1, readAt: 1 },
  { name: 'idx_conversation_user_readat' }
);

db.read_receipts.createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 7776000, name: 'idx_ttl_90days' }
);
```

### Redis Keys

```yaml
# New Redis key patterns for read receipts
patterns:
  - "unread:{conversationId}:{userId}" # Unread count cache
  - "receipts:{messageId}"              # Recent receipts cache
  
ttl:
  unread_count: 300      # 5 minutes
  recent_receipts: 3600  # 1 hour
```

---

## Environment Variables

Add to `.env`:

```bash
# Read Receipts Configuration
READ_RECEIPT_TTL_DAYS=90
READ_RECEIPT_BATCH_SIZE=100
READ_RECEIPT_CACHE_TTL=300
READ_RECEIPT_RATE_LIMIT_MARK=100
READ_RECEIPT_RATE_LIMIT_BULK=30
```

---

## Docker Updates

No changes required to Dockerfile. Existing Node.js image supports the feature.

---

## Kubernetes ConfigMap

```yaml
# k8s/configmaps/read-receipts-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: read-receipts-config
  namespace: chathub
data:
  READ_RECEIPT_TTL_DAYS: "90"
  READ_RECEIPT_BATCH_SIZE: "100"
  READ_RECEIPT_CACHE_TTL: "300"
```

---

## Monitoring & Alerting

### Prometheus Metrics

```yaml
# Additional metrics to collect
- name: chathub_read_receipts_created_total
  type: counter
  help: Total read receipts created

- name: chathub_read_receipts_latency_seconds
  type: histogram
  help: Read receipt creation latency
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1]

- name: chathub_read_receipts_socket_delivery_seconds
  type: histogram
  help: Socket.IO delivery latency for read receipts
```

### Grafana Dashboard

```json
{
  "title": "Read Receipts",
  "panels": [
    {
      "title": "Receipts/sec",
      "type": "graph",
      "targets": [
        {
          "expr": "rate(chathub_read_receipts_created_total[5m])"
        }
      ]
    },
    {
      "title": "Latency p95",
      "type": "stat",
      "targets": [
        {
          "expr": "histogram_quantile(0.95, rate(chathub_read_receipts_latency_seconds_bucket[5m]))"
        }
      ]
    }
  ]
}
```

### PagerDuty Alerts

```yaml
# alerts/read-receipts-alerts.yaml
groups:
  - name: read-receipts
    rules:
      - alert: HighReadReceiptLatency
        expr: histogram_quantile(0.95, rate(chathub_read_receipts_latency_seconds_bucket[5m])) > 0.2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Read receipt latency is high (p95 > 200ms)"
          
      - alert: ReadReceiptErrorRate
        expr: rate(chathub_read_receipts_errors_total[5m]) / rate(chathub_read_receipts_created_total[5m]) > 0.01
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Read receipt error rate > 1%"
```

---

## CI/CD Pipeline

### GitHub Actions Additions

```yaml
# .github/workflows/test.yml additions
  test-read-receipts:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:6
        ports:
          - 27017:27017
      redis:
        image: redis:7
        ports:
          - 6379:6379
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:unit -- --grep "read-receipt"
      - run: npm run test:integration -- --grep "read-receipt"
```

---

## Database Migration Plan

### Pre-Deployment

1. Create indexes in background mode
2. Monitor index build progress
3. Verify index completion before deployment

```bash
# Monitor index build
db.currentOp().inprog.filter(op => op.msg && op.msg.includes('Index'))
```

### Rollback Plan

1. Feature flag to disable read receipts
2. No schema migration required (additive only)
3. Indexes can remain (no impact if unused)

```bash
# Rollback: Disable via environment
export FEATURE_READ_RECEIPTS_ENABLED=false
```

---

## Load Testing

### k6 Script

```javascript
// load-tests/read-receipts.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import ws from 'k6/ws';

export const options = {
  stages: [
    { duration: '30s', target: 100 },
    { duration: '1m', target: 500 },
    { duration: '30s', target: 0 },
  ],
};

export default function () {
  // Mark message as read
  const res = http.post(
    `${__ENV.API_URL}/api/v1/messages/${__ENV.MESSAGE_ID}/read`,
    {},
    {
      headers: {
        Authorization: `Bearer ${__ENV.TOKEN}`,
      },
    }
  );
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
```

---

## Deployment Checklist

- [ ] Database indexes created
- [ ] Environment variables configured
- [ ] Feature flag enabled in staging
- [ ] Load test passed
- [ ] Monitoring dashboard deployed
- [ ] Alerts configured
- [ ] Runbook updated
- [ ] On-call notified
