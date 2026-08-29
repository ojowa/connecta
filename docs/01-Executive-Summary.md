# Executive Summary

## OJChat — Modern Matchmaking & Relationship Platform

**Version:** 1.0.0
**Date:** July 2026
**Codename:** OJChat
**Classification:** Confidential — Internal Use Only

---

## 1. Overview

OJChat is a production-grade, privacy-first dating and relationship platform designed for the modern mobile user. It combines AI-powered matchmaking, encrypted messaging, and real-time voice/video communication into a seamless experience.

Unlike legacy dating platforms that treat user data as a monetization asset, OJChat is built on the principle that **privacy is a feature, not a trade-off**. Messages are encrypted in transit, passwords are securely hashed, and user data is handled with strict privacy controls.

---

## 2. Vision

To become the most trusted matchmaking platform in Africa and beyond — where technology fosters genuine human connection while protecting user privacy and safety.

## 3. Mission

To build a dating platform that:

- Uses AI to create meaningful compatibility matches, not just surface-level swipes
- Provides enterprise-grade security for personal conversations
- Works reliably offline and on low-bandwidth networks
- Detects and removes fake profiles, romance scams, and toxic behavior proactively
- Operates a sustainable business model without exploiting user data

---

## 4. Problem Statement

The online dating industry faces several critical problems:

| Problem | Impact | OJChat Solution |
|---|---|---|
| Fake profiles and catfishing | User distrust, safety risks | AI face verification + profile scoring |
| Romance scams | Financial and emotional harm | AI scam detection + behavioral analysis |
| Shallow matching algorithms | Poor match quality, app fatigue | Multi-factor AI compatibility engine |
| No offline functionality | Unusable in low-connectivity areas | Optimized for low-bandwidth networks |
| Privacy violations | Data breaches, surveillance | Server-side encryption, bcrypt passwords, strict access controls |
| Toxic messaging | Harassment, user attrition | Real-time AI toxicity detection |
| One-size-fits-all experience | Poor UX for diverse audiences | Preference-driven personalization |

---

## 5. Target Market

### Primary Market
- **Region:** Nigeria (launch market), then West Africa, East Africa, and pan-Africa
- **Age:** 22–40 years old
- **Demographics:** Urban professionals, university students, diaspora users
- **Income:** Middle-income to upper-middle-income smartphone users

### Secondary Market
- **Region:** Global (diaspora communities, international dating)
- **Age:** 18–50 years old
- **Language:** English (primary), French, Swahili, Yoruba, Igbo, Hausa (future)

---

## 6. Key Differentiators

1. **AI Matchmaking Engine** — Goes beyond swipes. Uses behavioral signals, conversation patterns, shared interests, and compatibility scoring.

2. **Fake Profile & Scam Detection** — AI analyzes photo authenticity, profile completeness, behavioral patterns, and messaging red flags.

3. **Real-Time Toxic Language Moderation** — Server-side AI detects harassment before it reaches the recipient.

4. **Voice & Video Calls (WebRTC)** — In-app calls with STUN/TURN infrastructure, push wake-up, and call recovery.

5. **Admin Web Panel** — Full-featured management console for user management, content moderation, analytics, and platform operations.

6. **Nigerian Data Protection Act (NDPA) Compliance** — Built from day one with Nigerian and GDPR privacy regulations in mind.

---

## 7. Technology Summary

| Layer | Technology |
|---|---|
| Mobile | React Native (Expo managed workflow) |
| Admin Panel | Next.js 14+ (App Router), React 18, TypeScript, shadcn/ui |
| Backend | NestJS (TypeScript) microservices |
| Database | PostgreSQL (primary), Redis (cache), SQLite (offline) |
| Real-time | Socket.IO (WebSocket) |
| Voice/Video | WebRTC (STUN/TURN) |
| Encryption | AES-256-GCM, bcrypt (passwords) |
| AI/ML | TypeScript (NestJS) AI services, OpenAI API |
| Object Storage | AWS S3 / Cloudflare R2 |
| Search | Elasticsearch / Meilisearch |
| Infrastructure | Docker, Kubernetes, GitHub Actions |
| Monitoring | Grafana, Prometheus, Sentry |

---

## 8. Business Model

| Tier | Price (₦/month) | Features |
|---|---|---|
| Free | 0 | Basic swiping, limited likes, text chat |
| Premium | 4,999 | Unlimited likes, advanced filters, read receipts |
| Gold | 9,999 | Premium + AI insights, profile boost, priority support |
| Platinum | 19,999 | Gold + video calls, incognito mode, AI date planner |

### Additional Revenue Streams
- **Profile Boosts** (pay-per-use)
- **Super Likes** (limited free, purchasable)
- **Virtual Gifts**
- **Sponsored Profiles** (advertising)
- **Affiliate Partnerships** (date venues, experiences)

---

## 9. Development Timeline

| Phase | Duration | Deliverables |
|---|---|---|
| Phase 1: Foundation | Month 1–2 | Auth, profiles, basic UI |
| Phase 2: Discovery | Month 2–3 | Swipe mechanics, matching algorithm |
| Phase 3: Messaging | Month 3–4 | Encrypted chat, message delivery |
| Phase 4: Media | Month 4–5 | Photo verification, voice notes |
| Phase 5: Calls | Month 5–6 | WebRTC voice/video calls |
| Phase 6: AI | Month 6–7 | Matchmaking engine, scam detection |
| Phase 7: Payments | Month 7–8 | Subscriptions, wallet, in-app purchases |
| Phase 8: Safety | Month 8–9 | Moderation, reporting, admin panel |
| Phase 9: Launch | Month 9–10 | Beta testing, App Store submission |
| Phase 10: Scale | Month 10–12 | Performance optimization, pan-African rollout |

**Total estimated timeline:** 10–12 months to production launch.

---

## 10. Team Requirements

| Role | Count | Responsibility |
|---|---|---|
| Tech Lead / Architect | 1 | System design, code review, architecture decisions |
| Senior Backend Engineer | 2 | NestJS microservices, database, API design |
| Senior Mobile Engineer | 2 | React Native, offline sync, WebRTC |
| AI/ML Engineer | 1 | Matchmaking engine, scam detection, moderation |
| DevOps Engineer | 1 | CI/CD, infrastructure, monitoring |
| UI/UX Designer | 1 | Design system, screens, user flows |
| QA Engineer | 1 | Testing strategy, automation, performance |
| Product Manager | 1 | Roadmap, priorities, stakeholder management |

**Minimum viable team:** 5–6 engineers + 1 designer + 1 PM

---

## 11. Cost Estimate Summary

| Category | Monthly (USD) | Annual (USD) |
|---|---|---|
| Cloud Infrastructure | $2,000–$5,000 | $24,000–$60,000 |
| Third-party Services | $500–$1,500 | $6,000–$18,000 |
| Development Team (outsourced) | $15,000–$25,000 | $180,000–$300,000 |
| Design & QA Tools | $200–$500 | $2,400–$6,000 |
| App Store Fees | $125 | $125 |
| Legal & Compliance | $1,000–$3,000 | $12,000–$36,000 |
| **Total (Year 1)** | — | **$224,525–$420,125** |

---

## 12. Success Metrics

| Metric | Target (6 months post-launch) | Target (12 months) |
|---|---|---|
| Registered Users | 100,000 | 500,000 |
| Daily Active Users (DAU) | 20,000 | 100,000 |
| DAU/MAU Ratio | 25%+ | 30%+ |
| Matches per User | 5+/week | 8+/week |
| Message Response Rate | 60%+ | 70%+ |
| Premium Conversion | 3–5% | 5–8% |
| User Retention (D7) | 40%+ | 50%+ |
| User Retention (D30) | 20%+ | 30%+ |
| App Store Rating | 4.2+ | 4.5+ |
| Fake Profile Detection Rate | 85%+ | 95%+ |

---

## 13. Risk Summary

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Low user adoption | Medium | High | Aggressive marketing, referral incentives, university partnerships |
| High infrastructure costs | Medium | Medium | Auto-scaling, cost monitoring, CDN optimization |
| Regulatory compliance (NDPA) | Low | High | Legal review from Day 1, data residency in Nigeria |
| Fake profiles at scale | High | High | Multi-layered AI detection, manual review queue |
| WebRTC reliability | Medium | Medium | Multiple STUN/TURN providers, call recovery, fallback to audio |
| Encryption key loss | Low | High | Secure backup system, key rotation, recovery flows |
| Team scaling | Medium | Medium | Modular architecture, clear documentation, code standards |

---

## 14. Next Steps

1. **Finalize documentation package** (this document set)
2. **Design database schema** with ER diagrams
3. **Define API contracts** (OpenAPI/Swagger)
4. **Create UI/UX wireframes** for all screens
5. **Set up monorepo** with Turborepo + shared packages
6. **Begin Phase 1 development** (auth + profiles)
7. **Recruit development team** or engage development partner
8. **Establish cloud infrastructure** (AWS/Azure account setup)
9. **Legal review** for NDPA compliance and App Store requirements
10. **Pitch deck** for investor outreach (if applicable)

---

*This document is part of the OJChat Software Design Document (SDD) package. See the full document index in the root `docs/` directory.*
