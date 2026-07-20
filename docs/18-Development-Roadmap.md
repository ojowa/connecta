# Development Roadmap

## Connecta — 12-Month Development Timeline

**Version:** 1.0.0
**Date:** July 2026

---

## 1. Roadmap Overview

| Phase | Duration | Focus | Milestone |
|---|---|---|---|
| Phase 1 | Month 1–2 | Foundation | Auth, profiles, basic infrastructure |
| Phase 2 | Month 2–3 | Discovery | Swipe mechanics, matching |
| Phase 3 | Month 3–4 | Messaging | E2EE chat, offline sync |
| Phase 4 | Month 4–5 | Media | Photos, verification, voice notes |
| Phase 5 | Month 5–6 | Calls | WebRTC voice/video |
| Phase 6 | Month 6–7 | AI | Matchmaking engine, safety AI |
| Phase 7 | Month 7–8 | Payments | Subscriptions, wallet, IAP |
| Phase 8 | Month 8–9 | Safety & Admin | Moderation, admin panel, reporting |
| Phase 9 | Month 9–10 | Polish | Performance, testing, App Store prep |
| Phase 10 | Month 10–12 | Launch & Scale | Beta, launch, pan-African rollout |

---

## 2. Phase Details

### Phase 1: Foundation (Month 1–2)

**Sprint 1–2: Infrastructure**
- [ ] Set up monorepo (Turborepo/Nx)
- [ ] NestJS project scaffolding
- [ ] PostgreSQL + Redis setup
- [ ] Docker Compose for local dev
- [ ] GitHub Actions CI pipeline
- [ ] ESLint + Prettier config
- [ ] Database schema migrations (auth, users)

**Sprint 3–4: Authentication & Profiles**
- [ ] Phone number registration + OTP
- [ ] Email/password registration
- [ ] JWT access + refresh tokens
- [ ] User profile CRUD
- [ ] Photo upload (S3)
- [ ] Basic preference settings
- [ ] React Native project setup
- [ ] Navigation structure
- [ ] Login/register screens

**Deliverables:**
- Working registration and login
- Profile creation flow
- Basic API infrastructure

---

### Phase 2: Discovery (Month 2–3)

**Sprint 5–6: Swipe Mechanics**
- [ ] Discovery feed API
- [ ] Swipe UI with gestures (reanimated)
- [ ] Like/pass/super-like actions
- [ ] Daily like limits
- [ ] Match detection (mutual like)
- [ ] Match screen animation

**Sprint 7–8: Matching & Preferences**
- [ ] Preference filters (age, distance, education)
- [ ] "See who liked you" (premium feature)
- [ ] Profile boost mechanics
- [ ] Basic compatibility scoring
- [ ] Discovery settings screen
- [ ] Match list screen

**Deliverables:**
- Working swipe-based discovery
- Match creation and notification
- Preference-based filtering

---

### Phase 3: Messaging (Month 3–4)

**Sprint 9–10: Real-Time Chat**
- [ ] Socket.IO integration
- [ ] Conversation list
- [ ] One-to-one messaging
- [ ] Read receipts
- [ ] Typing indicators
- [ ] Message delivery status

**Sprint 11–12: Offline & Encryption**
- [ ] SQLite local database setup
- [ ] Offline message queue (outbox pattern)
- [ ] Background sync engine
- [ ] Signal Protocol integration
- [ ] End-to-end encryption
- [ ] Message reactions

**Deliverables:**
- Encrypted real-time messaging
- Offline message composition and sync
- Read receipts and typing indicators

---

### Phase 4: Media (Month 4–5)

**Sprint 13–14: Photo Management**
- [ ] Photo upload with compression
- [ ] Photo grid on profile
- [ ] Photo verification (selfie comparison)
- [ ] AI fake photo detection
- [ ] Profile completeness scoring

**Sprint 15–16: Voice Notes & Media Sharing**
- [ ] Voice note recording
- [ ] Voice note playback with waveform
- [ ] Image sharing in chat
- [ ] Media encryption
- [ ] Image viewer (full screen, zoom)

**Deliverables:**
- Photo verification system
- Voice notes in chat
- Encrypted media sharing

---

### Phase 5: Calls (Month 5–6)

**Sprint 17–18: WebRTC Foundation**
- [ ] WebRTC signalling server
- [ ] STUN/TURN setup (coturn)
- [ ] Voice calls (P2P)
- [ ] Call UI (incoming, active, ended)
- [ ] Push notification wake-up

**Sprint 19–20: Video & Quality**
- [ ] Video calls
- [ ] Call quality monitoring
- [ ] Bandwidth adaptation
- [ ] Call recovery
- [ ] Call history

**Deliverables:**
- Working voice and video calls
- Call quality adaptation
- Push-triggered incoming calls

---

### Phase 6: AI (Month 6–7)

**Sprint 21–22: Matchmaking AI**
- [ ] Compatibility scoring model
- [ ] Feature engineering pipeline
- [ ] Recommendation engine (FastAPI)
- [ ] A/B testing framework
- [ ] Diversity injection

**Sprint 23–24: Safety AI**
- [ ] Fake profile detection
- [ ] Romance scam detection
- [ ] Toxic language detection
- [ ] AI content moderation
- [ ] AI ice breakers

**Deliverables:**
- AI-powered compatibility matching
- Automated fake/scam detection
- Real-time toxicity filtering

---

### Phase 7: Payments (Month 7–8)

**Sprint 25–26: Subscription System**
- [ ] Subscription plans (Free/Premium/Gold/Platinum)
- [ ] Paystack integration
- [ ] Subscription management (upgrade/downgrade/cancel)
- [ ] Receipt generation

**Sprint 27–28: In-App Purchases**
- [ ] Super Like packs
- [ ] Profile boosts
- [ ] Wallet system
- [ ] Transaction history
- [ ] Refund processing

**Deliverables:**
- Complete payment system
- Subscription management
- In-app purchase flow

---

### Phase 8: Safety & Admin (Month 8–9)

**Sprint 29–30: User Safety**
- [ ] Report system
- [ ] Block user
- [ ] Safety tips
- [ ] Verification badges
- [ ] Account pause/resume

**Sprint 31–32: Admin Panel**
- [ ] Admin authentication (2FA)
- [ ] Dashboard with KPIs
- [ ] User management
- [ ] Report review queue
- [ ] Content moderation queue
- [ ] Analytics dashboard
- [ ] Push notification broadcast
- [ ] Audit logging

**Deliverables:**
- Complete safety system
- Full-featured admin web panel
- Moderation workflow

---

### Phase 9: Polish (Month 9–10)

**Sprint 33–34: Performance**
- [ ] Load testing (1000+ concurrent)
- [ ] Database optimization
- [ ] API response time < 200ms
- [ ] App cold start < 3 seconds
- [ ] Memory leak detection

**Sprint 35–36: QA & Store Prep**
- [ ] Full regression testing
- [ ] Accessibility audit (WCAG AA)
- [ ] App Store screenshots
- [ ] App Store descriptions
- [ ] Privacy policy
- [ ] Terms of service

**Deliverables:**
- Performance benchmarks met
- App Store submission ready
- All critical bugs resolved

---

### Phase 10: Launch & Scale (Month 10–12)

**Month 10: Beta Launch**
- [ ] Closed beta (1,000 users)
- [ ] Bug fixes and feedback
- [ ] App Store review submission
- [ ] Marketing site launch

**Month 11: Public Launch**
- [ ] App Store approval
- [ ] Google Play approval
- [ ] Public launch in Nigeria
- [ ] Launch marketing campaign
- [ ] University partnerships

**Month 12: Scale**
- [ ] Performance monitoring
- [ ] User feedback collection
- [ ] Feature iteration
- [ ] Pan-African expansion planning
- [ ] Group dating feature (future)

**Deliverables:**
- Public app launch
- 10,000+ registered users
- Production stability

---

## 3. Team Roles & Assignments

| Role | Responsibility | Phase Involvement |
|---|---|---|
| Tech Lead | Architecture, code review, decisions | All phases |
| Backend Engineer 1 | Auth, users, matching | Phases 1–4 |
| Backend Engineer 2 | Chat, calls, payments | Phases 3–8 |
| Mobile Engineer 1 | Core UI, navigation, offline | Phases 1–5 |
| Mobile Engineer 2 | Calls, camera, advanced UI | Phases 4–9 |
| AI/ML Engineer | Matchmaking, safety AI | Phases 6–8 |
| DevOps Engineer | CI/CD, infrastructure | All phases |
| UI/UX Designer | Design system, screens | Phases 1–9 |
| QA Engineer | Testing, automation | Phases 3–9 |
| Product Manager | Roadmap, priorities, stakeholders | All phases |

---

## 4. Sprint cadence

| Parameter | Value |
|---|---|
| Sprint length | 2 weeks |
| Sprints per phase | 2 |
| Total sprints | 20 |
| Sprint planning | Monday (first day) |
| Sprint review | Friday (last day) |
| Daily standup | 9:00 AM, 15 min |
| Retrospective | Friday (last day) |

---

## 5. Milestones & Deliverables

| Milestone | Target Date | Deliverable |
|---|---|---|
| M1: Infrastructure Ready | Month 1 | Dev environment, CI/CD, database |
| M2: Auth + Profiles | Month 2 | Registration, login, profile creation |
| M3: Discovery Working | Month 3 | Swipe, match, preferences |
| M4: Chat Working | Month 4 | E2EE messaging, offline sync |
| M5: Calls Working | Month 6 | Voice/video calls |
| M6: AI Integration | Month 7 | Matchmaking, safety AI |
| M7: Payments Working | Month 8 | Subscriptions, IAP |
| M8: Admin Panel | Month 9 | Full admin dashboard |
| M9: App Store Ready | Month 10 | Beta release |
| M10: Public Launch | Month 11 | Live on App Store + Play Store |

---

*This document is part of the Connecta Software Design Document (SDD) package.*
