# DevOps & CI/CD

## Connecta — Infrastructure, Deployment & Operations

**Version:** 1.0.0
**Date:** July 2026

---

## 1. Infrastructure Overview

### 1.1 Cloud Provider

| Component | Provider | Region |
|---|---|---|
| Compute (K8s) | AWS EKS / Azure AKS | Africa (Cape Town) |
| Database | AWS RDS / Azure PostgreSQL | Africa (Cape Town) |
| Object Storage | AWS S3 / Cloudflare R2 | Africa + Global CDN |
| CDN | Cloudflare | Global |
| DNS | Cloudflare | Global |
| Monitoring | AWS CloudWatch / Grafana | — |
| CI/CD | GitHub Actions | — |

### 1.2 Environment Strategy

| Environment | Purpose | Cluster Size | Cost |
|---|---|---|---|
| Development | Local dev with Docker Compose | Single machine | $0 |
| Staging | Pre-production testing | 3-node K8s | ~$300/mo |
| Production | Live platform | 6+ node K8s | ~$2,000+/mo |

---

## 2. Docker Configuration

### 2.1 Multi-Stage Dockerfile (NestJS)

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json
USER nestjs
EXPOSE 3000
CMD ["node", "dist/main"]
```

### 2.2 Docker Compose (Development)

```yaml
# docker-compose.yml
version: '3.8'

services:
  api-gateway:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://connecta:password@postgres:5432/connecta_db
      - REDIS_URL=redis://redis:6379
      - NATS_URL=nats://nats:4222
    depends_on:
      - postgres
      - redis
      - nats

  auth-service:
    build: .
    ports:
      - "3001:3000"
    environment:
      - DATABASE_URL=postgresql://connecta:password@postgres:5432/connecta_db
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  chat-service:
    build: .
    ports:
      - "3002:3000"
    environment:
      - DATABASE_URL=postgresql://connecta:password@postgres:5432/connecta_db
      - REDIS_URL=redis://redis:6379
      - NATS_URL=nats://nats:4222
    depends_on:
      - postgres
      - redis
      - nats

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: connecta_db
      POSTGRES_USER: connecta
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data

  nats:
    image: nats:2-alpine
    ports:
      - "4222:4222"
      - "8222:8222"

  elasticsearch:
    image: elasticsearch:8.10.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    volumes:
      - esdata:/usr/share/elasticsearch/data

volumes:
  pgdata:
  redisdata:
  esdata:
```

---

## 3. Kubernetes Deployment

### 3.1 Namespace & Deployment (Production)

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: connecta
  labels:
    app.kubernetes.io/part-of: connecta

---
# k8s/api-gateway-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
  namespace: connecta
  labels:
    app: api-gateway
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      containers:
        - name: api-gateway
          image: connecta/api-gateway:latest
          ports:
            - containerPort: 3000
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: db-secret
                  key: url
            - name: REDIS_URL
              valueFrom:
                secretKeyRef:
                  name: redis-secret
                  key: url
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health/ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
```

### 3.2 HPA (Horizontal Pod Autoscaler)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-gateway-hpa
  namespace: connecta
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-gateway
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

---

## 4. GitHub Actions CI/CD

### 4.1 CI Pipeline

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    needs: lint
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: connecta_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432
      redis:
        image: redis:7
        ports:
          - 6379:6379
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run test:e2e

  build:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v5
        with:
          push: true
          tags: ghcr.io/${{ github.repository }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### 4.2 CD Pipeline (Production)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Kubernetes
        uses: azure/k8s-deploy@v4
        with:
          manifests: |
            k8s/namespace.yaml
            k8s/api-gateway-deployment.yaml
            k8s/api-gateway-service.yaml
          images: |
            ghcr.io/${{ github.repository }}:${{ github.sha }}
          pull-secret: ghcr-secret

      - name: Verify Deployment
        run: |
          kubectl rollout status deployment/api-gateway -n connecta --timeout=300s

      - name: Notify Slack
        if: success()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {"text": "Production deployment successful: ${{ github.sha }}"}
```

---

## 5. Monitoring & Observability

### 5.1 Monitoring Stack

```mermaid
graph LR
    A[Services] --> B[Prometheus<br/>Metrics]
    A --> C[Loki<br/>Logs]
    A --> D[Tempo<br/>Traces]
    B --> E[Grafana<br/>Dashboards]
    C --> E
    D --> E
    A --> F[Sentry<br/>Errors]
    E --> G[PagerDuty<br/>Alerts]
```

### 5.2 Key Dashboards

| Dashboard | Metrics |
|---|---|
| API Performance | Request rate, latency, error rate, p50/p95/p99 |
| Database | Connection pool, query latency, slow queries |
| Redis | Memory, hits/misses, connected clients |
| WebSocket | Active connections, message throughput |
| Kubernetes | Pod count, CPU/memory usage, restarts |
| Business | DAU, matches, messages, revenue |
| Infrastructure | Node health, disk usage, network I/O |

### 5.3 Alert Rules

```yaml
# prometheus/alerts.yml
groups:
  - name: connecta-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"

      - alert: HighLatency
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 0.5
        for: 5m
        labels:
          severity: warning

      - alert: DatabaseConnectionPoolHigh
        expr: pg_stat_activity_count > pg_settings_max_connections * 0.8
        for: 2m
        labels:
          severity: critical
```

---

## 6. Logging Strategy

### 6.1 Structured Logging

```typescript
// libs/logger/src/logger.service.ts
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  base: {
    service: process.env.SERVICE_NAME,
    version: process.env.APP_VERSION,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

// Usage
logger.info({ userId, action: 'message.sent', conversationId }, 'Message sent successfully');
logger.error({ err, userId }, 'Failed to send message');
```

### 6.2 Log Levels

| Level | Usage |
|---|---|
| ERROR | System errors, unhandled exceptions |
| WARN | Degraded performance, retryable errors |
| INFO | Business events, user actions |
| DEBUG | Debugging information (dev only) |
| TRACE | Detailed tracing (dev only) |

---

## 7. Backup & Disaster Recovery

### 7.1 Backup Strategy

| Component | Frequency | Retention | Method |
|---|---|---|---|
| PostgreSQL | Hourly incremental | 30 days | pg_dump + WAL archiving |
| PostgreSQL | Daily full | 90 days | pg_dump to S3 |
| Redis | Every 6 hours | 7 days | RDB snapshots |
| Elasticsearch | Daily | 30 days | Snapshot to S3 |
| S3/R2 | Versioning | Indefinite | Versioning + replication |
| K8s configs | On change | Indefinite | Git repository |

### 7.2 Recovery Procedures

| Scenario | RTO | RPO | Procedure |
|---|---|---|---|
| Single pod failure | < 1 min | 0 | Auto-restart by K8s |
| Database failure | < 15 min | < 5 min | Failover to read replica |
| Full region outage | < 1 hour | < 5 min | Cross-region failover |
| Data corruption | < 4 hours | < 1 hour | Point-in-time recovery |

---

## 8. Scaling Strategy

### 8.1 Horizontal Scaling

| Service | Min Replicas | Max Replicas | Trigger |
|---|---|---|---|
| API Gateway | 3 | 20 | CPU > 70% |
| Auth Service | 2 | 10 | CPU > 70% |
| Chat Service | 3 | 30 | Connection count |
| Matching Service | 2 | 10 | CPU > 70% |
| Notification Service | 2 | 10 | Queue depth |

### 8.2 Database Scaling

- **Read replicas** — Route read queries to replicas
- **Connection pooling** — PgBouncer with 100 connections
- **Partitioning** — Monthly partitions for analytics data
- **Caching** — Redis for hot data (profiles, sessions)

---

*This document is part of the Connecta Software Design Document (SDD) package.*
