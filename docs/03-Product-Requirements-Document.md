# Product Requirements Document (PRD)

## OJChat — Dating & Matchmaking Platform

**Version:** 1.0.0
**Date:** July 2026
**Status:** Draft

---

## 1. Document Purpose

This PRD defines the functional and non-functional requirements for the OJChat platform. It serves as the single source of truth for product, design, and engineering teams during development.

---

## 2. Product Overview

| Field | Value |
|---|---|
| Product Name | OJChat |
| Platform | iOS, Android, Web (Admin Panel) |
| Type | Dating & Matchmaking Platform |
| Target Market | Nigeria (launch), Pan-Africa (expansion) |
| Launch Date | Q2 2027 (target) |
| Business Model | Freemium + In-App Purchases |

---

## 3. User Roles

| Role | Description |
|---|---|
| **Guest** | Unregistered visitor (landing page only) |
| **Free User** | Registered user with basic features |
| **Premium User** | Paid subscriber with enhanced features |
| **Gold User** | Higher-tier subscriber with AI features |
| **Platinum User** | Top-tier subscriber with all features |
| **Moderator** | Support staff with limited admin access |
| **Super Admin** | Full platform management access |

---

## 4. Functional Requirements

### 4.1 Authentication & Onboarding

| ID | Requirement | Priority | Phase |
|---|---|---|---|
| AUTH-01 | Phone number registration with OTP verification | P0 | 1 |
| AUTH-02 | Email + password registration | P0 | 1 |
| AUTH-03 | Social login (Google, Apple, Facebook) | P1 | 2 |
| AUTH-04 | Biometric login (Face ID / Fingerprint) | P1 | 3 |
| AUTH-05 | Refresh token rotation | P0 | 1 |
| AUTH-06 | Device management (view/revoke sessions) | P1 | 3 |
| AUTH-07 | Account deletion (right to be forgotten) | P0 | 1 |

### 4.2 User Profiles

| ID | Requirement | Priority | Phase |
|---|---|---|---|
| PROF-01 | Profile creation with photos (min 1, max 9) | P0 | 1 |
| PROF-02 | Photo verification (selfie comparison) | P1 | 2 |
| PROF-03 | AI-powered fake photo detection | P1 | 4 |
| PROF-04 | Bio/description field (max 500 chars) | P0 | 1 |
| PROF-05 | Basic info (age, gender, location, education, job) | P0 | 1 |
| PROF-06 | Interest tags (select from predefined list) | P0 | 1 |
| PROF-07 | Relationship goals (casual, serious, friendship) | P0 | 1 |
| PROF-08 | Lifestyle preferences (smoking, drinking, exercise) | P1 | 2 |
| PROF-09 | Profile completeness indicator | P1 | 2 |
| PROF-10 | Profile editing | P0 | 1 |
| PROF-11 | Profile visibility toggle (pause account) | P1 | 3 |

### 4.3 Discovery & Matching

| ID | Requirement | Priority | Phase |
|---|---|---|---|
| MATCH-01 | Swipe-based profile discovery (like/pass/super-like) | P0 | 2 |
| MATCH-02 | Preference filters (age range, distance, education) | P0 | 2 |
| MATCH-03 | AI-powered compatibility scoring | P1 | 6 |
| MATCH-04 | Daily like limit (free: 50, paid: unlimited) | P0 | 2 |
| MATCH-05 | Super like mechanic (limited free, purchasable) | P1 | 2 |
| MATCH-06 | Mutual like = match notification | P0 | 2 |
| MATCH-07 | "See who liked you" (premium feature) | P1 | 2 |
| MATCH-08 | Profile boost (increased visibility for 30 min) | P1 | 3 |
| MATCH-09 | Incognito mode (premium feature) | P2 | 5 |
| MATCH-10 | Match undo (undo last swipe) | P2 | 4 |

### 4.4 Messaging

| ID | Requirement | Priority | Phase |
|---|---|---|---|
| MSG-01 | One-to-one encrypted text messaging | P0 | 3 |
| MSG-02 | Read receipts | P0 | 3 |
| MSG-03 | Typing indicators | P0 | 3 |
| MSG-04 | Message delivery status (sent, delivered, read) | P0 | 3 |
| MSG-05 | Voice note recording and playback | P1 | 4 |
| MSG-06 | Image sharing (in-chat) | P0 | 3 |
| MSG-07 | Video sharing (in-chat) | P2 | 5 |
| MSG-08 | Message reactions (emoji) | P1 | 4 |
| MSG-09 | Message deletion (delete for me, delete for everyone) | P1 | 3 |
| MSG-10 | Block user (stops all communication) | P0 | 3 |
| MSG-11 | End-to-end encryption (all messages) | P0 | 3 |
| MSG-12 | Offline message queue (sent when online) | P0 | 3 |
| MSG-13 | Message search | P2 | 5 |

### 4.5 Voice & Video Calls

| ID | Requirement | Priority | Phase |
|---|---|---|---|
| CALL-01 | Voice calls (WebRTC) | P0 | 5 |
| CALL-02 | Video calls (WebRTC) | P1 | 5 |
| CALL-03 | Push notification for incoming calls | P0 | 5 |
| CALL-04 | Call quality adaptation (bandwidth-aware) | P1 | 5 |
| CALL-05 | Call recovery after network interruption | P1 | 5 |
| CALL-06 | Call history (last 50 calls) | P1 | 5 |
| CALL-07 | Screen sharing (future) | P3 | 9 |

### 4.6 Safety & Moderation

| ID | Requirement | Priority | Phase |
|---|---|---|---|
| SAFE-01 | Report user (with reason selection) | P0 | 3 |
| SAFE-02 | Block user | P0 | 3 |
| SAFE-03 | AI fake profile detection | P1 | 6 |
| SAFE-04 | AI romance scam detection | P1 | 6 |
| SAFE-05 | Real-time toxic message detection | P1 | 6 |
| SAFE-06 | Photo moderation (explicit content filter) | P1 | 6 |
| SAFE-07 | User verification badge system | P2 | 4 |
| SAFE-08 | In-app safety tips and education | P2 | 4 |

### 4.7 Payments & Subscriptions

| ID | Requirement | Priority | Phase |
|---|---|---|---|
| PAY-01 | Subscription plans (Free, Premium, Gold, Platinum) | P0 | 7 |
| PAY-02 | In-app purchases (Super Likes, Boosts) | P0 | 7 |
| PAY-03 | Mobile money payments (OPay, PalmPay, MTN) | P0 | 7 |
| PAY-04 | Card payments (Visa, Mastercard) | P0 | 7 |
| PAY-05 | Bank transfer payments | P1 | 7 |
| PAY-06 | Subscription management (upgrade, downgrade, cancel) | P0 | 7 |
| PAY-07 | Receipt generation | P0 | 7 |
| PAY-08 | Refund processing | P1 | 7 |

### 4.8 Notifications

| ID | Requirement | Priority | Phase |
|---|---|---|---|
| NOTIF-01 | Push notifications (match, message, like) | P0 | 3 |
| NOTIF-02 | In-app notification center | P0 | 3 |
| NOTIF-03 | Email notifications (account, subscription) | P1 | 4 |
| NOTIF-04 | Notification preferences (per type) | P1 | 4 |
| NOTIF-05 | Quiet hours (do not disturb) | P2 | 5 |

### 4.9 Admin Web Panel

| ID | Requirement | Priority | Phase |
|---|---|---|---|
| ADMIN-01 | Admin authentication with 2FA | P0 | 8 |
| ADMIN-02 | Dashboard with real-time KPIs | P0 | 8 |
| ADMIN-03 | User management (search, view, suspend, ban) | P0 | 8 |
| ADMIN-04 | Report review and action | P0 | 8 |
| ADMIN-05 | Content moderation queue | P0 | 8 |
| ADMIN-06 | Fake profile review queue | P1 | 8 |
| ADMIN-07 | Analytics dashboard | P0 | 8 |
| ADMIN-08 | Subscription management | P0 | 8 |
| ADMIN-09 | Payment transaction history | P0 | 8 |
| ADMIN-10 | Push notification broadcast | P1 | 8 |
| ADMIN-11 | System settings and feature flags | P1 | 8 |
| ADMIN-12 | Admin audit log | P0 | 8 |
| ADMIN-13 | Role-based access control (Super Admin, Moderator) | P0 | 8 |
| ADMIN-14 | Content management (onboarding, FAQs) | P2 | 9 |

---

## 5. Non-Functional Requirements

### 5.1 Performance

| ID | Requirement | Target |
|---|---|---|
| NFR-01 | API response time (p95) | < 200ms |
| NFR-02 | App cold start time | < 3 seconds |
| NFR-03 | Swipe animation frame rate | 60fps |
| NFR-04 | Message delivery latency | < 500ms |
| NFR-05 | Image upload time (5MB, 4G) | < 5 seconds |
| NFR-06 | WebRTC call setup time | < 3 seconds |
| NFR-07 | Admin panel initial load | < 2 seconds |

### 5.2 Scalability

| ID | Requirement | Target |
|---|---|---|
| NFR-08 | Concurrent users | 100,000+ |
| NFR-09 | Messages per second | 50,000+ |
| NFR-10 | Database rows (users) | 10M+ |
| NFR-11 | Horizontal scaling | Stateless services, DB read replicas |

### 5.3 Reliability

| ID | Requirement | Target |
|---|---|---|
| NFR-12 | Uptime | 99.9% |
| NFR-13 | Data durability | 99.999999999% (11 nines) |
| NFR-14 | Recovery time objective (RTO) | < 1 hour |
| NFR-15 | Recovery point objective (RPO) | < 5 minutes |
| NFR-16 | Crash rate | < 1% |

### 5.4 Security

| ID | Requirement | Target |
|---|---|---|
| NFR-17 | End-to-end encryption | All messages, calls |
| NFR-18 | Data at rest encryption | AES-256 |
| NFR-19 | TLS in transit | TLS 1.3 |
| NFR-20 | OWASP Top 10 compliance | All categories |
| NFR-21 | NDPA compliance | Full |
| NFR-22 | GDPR compliance | Full (for EU users) |
| NFR-23 | Penetration testing | Quarterly |
| NFR-24 | Vulnerability scanning | Weekly (automated) |

### 5.5 Usability

| ID | Requirement | Target |
|---|---|---|
| NFR-25 | Accessibility (WCAG) | Level AA |
| NFR-26 | Language support | English (Phase 1), French, Yoruba, Igbo, Hausa (Phase 2) |
| NFR-27 | Screen reader support | iOS VoiceOver, Android TalkBack |
| NFR-28 | Offline functionality | Optimized for low-bandwidth networks |

---

## 6. User Stories

### 6.1 Registration & Onboarding

```
As a new user,
I want to register with my phone number quickly,
So that I can start using the app without a lengthy signup process.

Acceptance Criteria:
- OTP sent within 5 seconds
- OTP valid for 5 minutes
- Max 3 OTP resend attempts
- Profile setup after verification
```

```
As a new user,
I want to upload at least 3 photos during onboarding,
So that my profile is attractive to potential matches.

Acceptance Criteria:
- Photo upload with crop and resize
- AI checks for inappropriate content
- Photos stored with encrypted backups
- Minimum 1 photo required to activate profile
```

### 6.2 Discovery

```
As a user,
I want to see profiles matching my preferences,
So that I can find compatible people.

Acceptance Criteria:
- Profiles match age, distance, gender preferences
- AI ranks by compatibility score
- New profiles get initial exposure boost
- No duplicate profiles shown within 24 hours
```

```
As a premium user,
I want to see who liked my profile,
So that I can decide whether to like them back.

Acceptance Criteria:
- List of users who liked me
- Sorted by compatibility score
- Paginated (20 per page)
- Real-time updates as new likes come in
```

### 6.3 Messaging

```
As a matched user,
I want to send text messages to my match,
So that we can get to know each other.

Acceptance Criteria:
- Messages delivered within 500ms (online)
- Read receipts shown after delivery
- Typing indicator while composing
- Offline: messages queued and sent when online
- All messages end-to-end encrypted
```

```
As a user,
I want to send voice notes in chat,
So that I can express myself more naturally.

Acceptance Criteria:
- Record up to 2 minutes
- Playback with progress indicator
- Waveform visualization
- Offline recording with sync when online
```

### 6.4 Safety

```
As a user,
I want to block someone who makes me uncomfortable,
So that they can no longer contact me.

Acceptance Criteria:
- Block from profile or chat
- Blocked user cannot see my profile
- Previous messages hidden (not deleted)
- Unblock option in settings
```

```
As a user,
I want to report inappropriate behavior,
So that the platform stays safe.

Acceptance Criteria:
- Report from profile or specific message
- Select reason (fake profile, inappropriate content, scam, harassment)
- Optional text description
- Confirmation that report was received
- AI-assisted priority scoring
```

### 6.5 Admin

```
As a moderator,
I want to review reported users quickly,
So that I can take appropriate action.

Acceptance Criteria:
- Queue sorted by priority (AI-scored)
- View user profile, photos, and conversation history
- Actions: dismiss, warn, suspend, ban
- All actions logged in audit trail
- User notified of action taken
```

```
As a super admin,
I want to see real-time platform metrics,
So that I can make informed business decisions.

Acceptance Criteria:
- Dashboard loads in < 2 seconds
- DAU, MAU, new signups, matches, messages
- Revenue metrics (MRR, ARPU, churn)
- Interactive charts with date range filters
- Export to CSV
```

---

## 7. Subscription Plans

| Feature | Free | Premium (₦4,999/mo) | Gold (₦9,999/mo) | Platinum (₦19,999/mo) |
|---|---|---|---|---|
| Daily Likes | 50 | Unlimited | Unlimited | Unlimited |
| Basic Filters | ✓ | ✓ | ✓ | ✓ |
| Advanced Filters | — | ✓ | ✓ | ✓ |
| See Who Liked You | — | ✓ | ✓ | ✓ |
| Read Receipts | — | ✓ | ✓ | ✓ |
| Profile Boost | — | 1/month | 3/month | 5/month |
| Super Likes | 5/day | 10/day | 25/day | 50/day |
| AI Match Insights | — | — | ✓ | ✓ |
| Voice Calls | — | — | ✓ | ✓ |
| Video Calls | — | — | — | ✓ |
| Incognito Mode | — | — | — | ✓ |
| Priority Support | — | — | ✓ | ✓ |
| Ad-Free | — | ✓ | ✓ | ✓ |

---

## 8. Data Requirements

### 8.1 Data Storage

| Data Type | Location | Retention |
|---|---|---|
| User profiles | PostgreSQL (Nigeria region) | Until account deletion |
| Messages | Encrypted SQLite (device) + encrypted blob (S3) | 2 years (cloud), indefinite (device) |
| Photos | S3 / R2 (encrypted) | Until account deletion |
| Payment records | PostgreSQL (encrypted columns) | 7 years (legal requirement) |
| Audit logs | PostgreSQL (append-only) | 2 years |
| Analytics events | ClickHouse / BigQuery | 3 years |
| Admin sessions | Redis | 8 hours max |

### 8.2 Data Residency

- All user data stored in Nigeria region (AWS Africa / Azure South Africa)
- Encrypted backups in secondary region for disaster recovery
- No user data transferred outside approved regions without consent

---

## 9. Acceptance Criteria Summary

### Definition of Done (Feature)

- [ ] Code complete and peer-reviewed
- [ ] Unit tests written (>80% coverage)
- [ ] Integration tests passing
- [ ] API documentation updated
- [ ] Mobile UI matches design spec
- [ ] Accessibility verified
- [ ] Performance benchmarks met
- [ ] Security review completed
- [ ] Product owner sign-off

### Definition of Done (Release)

- [ ] All P0 and P1 features complete
- [ ] All critical and high bugs resolved
- [ ] Load testing passed (target concurrent users)
- [ ] Security penetration test passed
- [ ] App Store submission approved
- [ ] Monitoring and alerting configured
- [ ] Rollback plan documented
- [ ] Release notes prepared

---

## 10. Assumptions & Dependencies

### Assumptions
- Target users have smartphones with iOS 14+ or Android 8+
- Internet connectivity is intermittent but improving
- Users are willing to verify phone numbers
- Payment gateway supports Nigerian mobile money and cards

### Dependencies
- Third-party: Twilio/SendGrid (OTP), Paystack/Flutterwave (payments), Firebase (push notifications)
- Infrastructure: AWS/Azure account with Nigeria region access
- Legal: NDPA compliance review, App Store guidelines compliance
- Team: Minimum 5 engineers available for 10-month development

---

*This document is part of the OJChat Software Design Document (SDD) package.*
