# 18. DevOps & CI/CD

## 1. Overview

This document defines the automated build, test, and deployment pipeline for the OJChat platform. The pipeline ensures code quality, security, and reliability across the NestJS monorepo (13 microservices), React Native (Expo) mobile app, and Next.js admin panel.

## 2. Git Strategy

- **Branch Model**: Git Flow — `feature/*`, `develop`, `staging`, `main`
- **Flow**: Feature branches → PR into `develop` → PR into `staging` → PR into `main`
- **PR Reviews**: Minimum 1 approval required, CI must pass, no merge conflicts
- **Conventional Commits**: `feat(auth): add OTP verification`, `fix(matching): resolve distance filter bug`
- **Protected Branches**: `develop`, `staging`, `main` — force push disabled, status checks required

## 3. CI Pipeline (GitHub Actions)

Triggered on every push and pull request:

| Stage              | Tool / Command                          | Gate |
|--------------------|-----------------------------------------|------|
| Lint               | `npm run lint` (ESLint)                 | Fail |
| Type-check         | `npm run typecheck` (TypeScript)        | Fail |
| Unit Tests         | `npm run test` (Jest)                   | Fail |
| Build              | `npm run build` (all services)          | Fail |
| Integration Tests  | `npm run test:e2e` (Docker Compose env) | Fail |
| Security Scan      | Snyk / Dependabot                       | Warn |

## 4. CD Pipeline

| Environment | Trigger                | Approval    | Rollback    |
|-------------|------------------------|-------------|-------------|
| Staging     | Auto on `develop` merge| None        | Auto-revert |
| Production  | Manual on `main` merge | Required    | Manual      |

- Staging deploys automatically after CI passes on `develop` merge
- Production requires manual approval via GitHub Environments
- Deployment creates a Git tag for traceability

## 5. Infrastructure

| Component | V1 (Launch)          | V2 (Growth)        | V3 (Scale)       |
|-----------|----------------------|--------------------|--------------------|
| Local Dev | Docker Compose       | Docker Compose     | Docker Compose     |
| Staging   | Single VM + Docker   | Kubernetes (EKS)   | Kubernetes (EKS)   |
| Production| Single VM + Docker   | Kubernetes (EKS)   | Multi-region EKS   |

- Each microservice runs as an isolated Docker container
- `docker-compose.yml` orchestrates all 13 services locally
- Kubernetes manifests managed with Helm charts (V2)

## 6. Environment Management

- **`.env.example`** files committed for each service (no secrets)
- **Secrets**: GitHub Actions Secrets → AWS Secrets Manager / HashiCorp Vault
- **Promotion Flow**: `dev` → `staging` → `prod` — values promoted via CI/CD variables
- **Per-Environment Config**: Separate `.env.staging`, `.env.production` managed per deployment target

## 7. Database Migrations

- **Tool**: TypeORM Migrations
- **Versioning**: Timestamped migration files committed to repo
- **Forward-Only**: Migrations run forward on deploy; no automatic rollback
- **Rollback Strategy**: Manual rollback migration file required before merge if migration is destructive
- **Zero-Downtime**: Migrations designed to be backward-compatible (add column → deploy code → remove old column)

## 8. Monitoring & Alerting

| Tool          | Purpose                        | Alert Channel     |
|---------------|--------------------------------|---------------------|
| Sentry        | Error tracking (all services)  | Slack / Discord     |
| Uptime Robot  | HTTP health checks             | Slack / Discord     |
| Prometheus    | Metrics collection             | Grafana dashboards  |
| CloudWatch    | AWS infrastructure metrics     | PagerDuty           |

- Critical errors trigger immediate Slack/Discord alerts
- Uptime checks every 60 seconds on all public endpoints

## 9. Rollback Strategy

- **Blue-Green Deployments**: Production runs two identical environments; traffic switches atomically
- **Database Rollback**: Destructive migrations require a paired rollback migration; reviewed before merge
- **Feature Flags**: LaunchDarkly / custom feature flags allow disabling features without deployment
- **Emergency Rollback**: Revert to previous Docker image tag, restore DB from last backup if needed

## 10. Implementation Status

| Phase | Scope | Status |
|-------|-------|--------|
| V1    | Docker Compose local dev + GitHub Actions CI | Planned |
| V2    | Kubernetes (EKS) for staging & production | Planned |
| V3    | Multi-region deployment, canary releases | Planned |

> **Note**: The `docker/` and `k8s/` directories are currently empty and will be populated as implementation progresses.
