# Cost Estimation

## Connecta — Budget & Financial Projections

**Version:** 1.0.0
**Date:** July 2026

---

## 1. Development Costs (Year 1)

### 1.1 Team Costs (Outsourced / In-House)

| Role | Count | Monthly (USD) | Annual (USD) |
|---|---|---|---|
| Tech Lead / Architect | 1 | $4,000–$6,000 | $48,000–$72,000 |
| Senior Backend Engineer | 2 | $3,000–$5,000 | $72,000–$120,000 |
| Senior Mobile Engineer | 2 | $3,000–$5,000 | $72,000–$120,000 |
| AI/ML Engineer | 1 | $3,500–$5,500 | $42,000–$66,000 |
| DevOps Engineer | 1 | $3,000–$4,500 | $36,000–$54,000 |
| UI/UX Designer | 1 | $2,500–$4,000 | $30,000–$48,000 |
| QA Engineer | 1 | $2,000–$3,500 | $24,000–$42,000 |
| Product Manager | 1 | $3,000–$4,500 | $36,000–$54,000 |
| **Total (Team)** | **10** | **$24,000–$38,000** | **$288,000–$456,000** |

### 1.2 Reduced Team (Lean Startup)

| Role | Count | Monthly (USD) | Annual (USD) |
|---|---|---|---|
| Tech Lead (full-stack) | 1 | $4,000–$6,000 | $48,000–$72,000 |
| Backend Engineer | 2 | $3,000–$5,000 | $72,000–$120,000 |
| Mobile Engineer | 1 | $3,000–$5,000 | $36,000–$60,000 |
| Designer (part-time) | 1 | $1,500–$2,500 | $18,000–$30,000 |
| **Total (Lean)** | **5** | **$11,500–$18,500** | **$174,000–$282,000** |

---

## 2. Infrastructure Costs

### 2.1 Monthly Costs (Production)

| Service | Specification | Monthly (USD) |
|---|---|---|
| **Compute (EKS)** | 3× t3.medium nodes | $150–$200 |
| **Database (RDS)** | db.t3.medium, 100GB, Multi-AZ | $200–$300 |
| **Redis (ElastiCache)** | cache.t3.medium | $100–$150 |
| **S3/R2 Storage** | 500GB photos + media | $25–$50 |
| **CloudFront/Cloudflare** | CDN + DDoS | $50–$100 |
| **Domain + DNS** | connecta.app | $2 |
| **SSL Certificates** | Let's Encrypt | $0 |
| **TURN Server** | coturn on EC2 t3.small | $30–$50 |
| **Monitoring** | Grafana Cloud free tier | $0–$50 |
| **Sentry** | Error tracking (team plan) | $26 |
| **GitHub** | Team plan | $4/user |
| **Total (Production)** | — | **$583–$932** |

### 2.2 Scaling Costs (10K+ Users)

| Service | Specification | Monthly (USD) |
|---|---|---|
| Compute | 6× t3.large nodes | $400–$600 |
| Database | db.r6g.large, 500GB | $400–$600 |
| Redis | cache.r6g.large, cluster | $300–$400 |
| Storage | 2TB photos + media | $50–$100 |
| CDN | Higher bandwidth | $100–$200 |
| Search | OpenSearch t3.medium | $100–$150 |
| **Total (10K Users)** | — | **$1,350–$2,050** |

### 2.3 Scale Costs (100K+ Users)

| Service | Specification | Monthly (USD) |
|---|---|---|
| Compute | 10× t3.xlarge nodes | $1,200–$1,800 |
| Database | db.r6g.xlarge, 1TB, read replicas | $1,000–$1,500 |
| Redis | cache.r6g.xlarge, cluster | $600–$800 |
| Storage | 10TB photos + media | $250–$500 |
| CDN | High bandwidth | $300–$600 |
| Search | OpenSearch 3-node cluster | $300–$500 |
| Monitoring | Full observability stack | $200–$400 |
| **Total (100K Users)** | — | **$3,850–$6,100** |

---

## 3. Third-Party Services

### 3.1 Monthly Costs

| Service | Provider | Monthly (USD) |
|---|---|---|
| SMS (OTP) | Twilio | $50–$200 |
| Email | SendGrid | $20–$50 |
| Push Notifications | Firebase | $0 (free tier) |
| Payment Gateway | Paystack | 1.5% per transaction |
| OpenAI API | AI features | $100–$500 |
| Image CDN | Cloudinary | $0–$89 |
| Analytics | Mixpanel/Amplitude | $0–$250 |
| Crash Reporting | Sentry | $26 |
| **Total (Third-Party)** | — | **$196–$1,115** |

---

## 4. One-Time Costs

| Item | Cost (USD) |
|---|---|
| Apple Developer Account | $99/year |
| Google Play Developer Account | $25 (one-time) |
| Domain Name | $10–$15/year |
| SSL Certificates | $0 (Let's Encrypt) |
| Legal (Privacy Policy, Terms) | $500–$2,000 |
| NDPA Compliance Review | $1,000–$3,000 |
| Branding & Logo Design | $500–$2,000 |
| App Store Assets | $200–$500 |
| **Total (One-Time)** | **$2,334–$7,639** |

---

## 5. Total Budget Summary

### 5.1 Year 1 (Development + Launch)

| Category | Low Estimate | High Estimate |
|---|---|---|
| Team (10 engineers) | $288,000 | $456,000 |
| Infrastructure (12 months) | $7,000 | $11,200 |
| Third-Party Services (12 months) | $2,350 | $13,400 |
| One-Time Costs | $2,334 | $7,639 |
| Contingency (15%) | $45,550 | $72,550 |
| **Total Year 1** | **$345,234** | **$560,789** |

### 5.2 Lean Year 1 (5 engineers)

| Category | Low Estimate | High Estimate |
|---|---|---|
| Team (5 engineers) | $174,000 | $282,000 |
| Infrastructure (12 months) | $7,000 | $11,200 |
| Third-Party Services (12 months) | $2,350 | $13,400 |
| One-Time Costs | $2,334 | $7,639 |
| Contingency (15%) | $27,850 | $46,210 |
| **Total Lean Year 1** | **$213,534** | **$360,449** |

---

## 6. Revenue Projections

### 6.1 User Growth Model

| Month | Registered Users | DAU | Premium Users | Revenue (₦) |
|---|---|---|---|---|
| Month 1 | 5,000 | 1,000 | 50 | ₦250,000 |
| Month 3 | 25,000 | 5,000 | 375 | ₦1,875,000 |
| Month 6 | 100,000 | 20,000 | 3,000 | ₦15,000,000 |
| Month 9 | 250,000 | 50,000 | 10,000 | ₦50,000,000 |
| Month 12 | 500,000 | 100,000 | 25,000 | ₦125,000,000 |

### 6.2 Revenue Streams

| Stream | Month 6 | Month 12 | Year 2 |
|---|---|---|---|
| Subscriptions | ₦10M | ₦100M | ₦500M |
| Super Likes (IAP) | ₦2M | ₦15M | ₦60M |
| Boosts (IAP) | ₦1.5M | ₦8M | ₦30M |
| Virtual Gifts | ₦1M | ₦5M | ₦20M |
| Sponsored Profiles | ₦0.5M | ₦2M | ₦10M |
| **Total** | **₦15M** | **₦130M** | **₦620M** |

### 6.3 Break-Even Analysis

| Metric | Value |
|---|---|
| Monthly burn rate (lean) | $17,800 |
| Monthly burn rate (full) | $30,400 |
| Break-even premium users (lean) | ~2,500 |
| Break-even premium users (full) | ~4,300 |
| Target break-even month | Month 8–10 |

---

## 7. Cost Optimization Strategies

1. **Start lean** — 5 engineers, not 10
2. **Use serverless where possible** — AWS Lambda for background jobs
3. **Cloudflare R2** — No egress fees (vs S3)
4. **Spot instances** — For non-critical workloads
5. **Reserved instances** — 1-year commitment for 30% savings
6. **Free tiers** — Firebase, Sentry, Cloudflare, Vercel
7. **Open source** — Prefer OSS tools over paid alternatives

---

*This document is part of the Connecta Software Design Document (SDD) package.*
