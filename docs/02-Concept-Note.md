# Concept Note

## Connecta — Matchmaking & Relationship Platform

**Version:** 1.0.0
**Date:** July 2026

---

## 1. Introduction

Connecta is a mobile-first dating and relationship platform built for the modern African user. It combines intelligent matchmaking, privacy-focused messaging, and real-time communication features into a single, cohesive experience.

The platform addresses the core failures of existing dating apps — fake profiles, shallow matching, privacy violations, and poor offline experiences — by leveraging artificial intelligence, end-to-end encryption, and an offline-first architecture.

---

## 2. Background

### 2.1 The Dating App Landscape

The global online dating market is valued at over $10 billion (2025) and is projected to reach $15 billion by 2030. Africa represents one of the fastest-growing digital markets, with over 600 million internet users by 2026.

Despite this growth, existing platforms have significant limitations:

- **Tinder** — Swipe-based matching with minimal profile depth. Limited in low-bandwidth environments.
- **Bumble** — Women-first messaging concept, but same shallow matching model.
- **Hinge** — "Designed to be deleted" philosophy, but limited African market presence.
- **Badoo** — Strong in some African markets, but outdated UX and weak privacy controls.

### 2.2 The African Opportunity

Africa's dating app market is underserved by local solutions. Most platforms are built for Western markets and fail to account for:

- Intermittent internet connectivity
- Low-storage devices
- Cultural nuances in dating and relationships
- Local payment methods (mobile money, bank transfers)
- Language diversity
- Safety concerns (romance scams, catfishing)

### 2.3 The Connecta Solution

Connecta is purpose-built for this market. It prioritizes:

- **Connectivity resilience** — Works offline, syncs when online
- **Privacy by default** — End-to-end encryption for all messages
- **Intelligent matching** — AI that learns from user behavior, not just profile tags
- **Safety first** — AI-powered fake profile detection and scam prevention
- **Cultural relevance** — Designed for African dating norms and preferences

---

## 3. Core Concepts

### 3.1 Offline-First Architecture

Most dating apps require constant internet connectivity. Connecta uses a local-first approach:

```
User Action → Encrypted Local SQLite → Background Sync → Cloud (Encrypted Ciphertext)
```

- Messages are written to an encrypted SQLite database on-device immediately
- The app is fully functional without internet (viewing profiles, composing messages, browsing matches)
- When connectivity is available, encrypted data is synchronized to cloud storage
- The server never has access to plaintext message content

**Benefits:**
- Instant perceived performance
- Full functionality in low/no bandwidth environments
- Reduced server load (batch sync instead of real-time)
- User data persists even if the server is unavailable

### 3.2 End-to-End Encryption (E2EE)

Connecta implements Signal Protocol-based encryption:

- Each device generates a key pair during registration
- Keys are exchanged during the handshake phase of messaging
- Messages are encrypted on-device before leaving the phone
- Decryption occurs only on recipient devices
- The server stores encrypted ciphertext only — it cannot read messages

**Key Management:**
- Identity keys (long-term)
- Signed pre-keys (medium-term, rotated periodically)
- One-time pre-keys (consumed during session establishment)
- Session keys (per-conversation, ratcheted forward)

### 3.3 AI Matchmaking Engine

Unlike simple tag-based matching, Connecta's AI engine uses multiple signals:

**Input Signals:**
- User preferences (age, location, interests, education, lifestyle)
- Behavioral data (who they like, who they skip, time spent on profiles)
- Conversation patterns (response times, message length, engagement)
- Mutual connections and social graph analysis
- Profile completeness and verification status
- Activity patterns (when they're online, usage frequency)

**Matching Algorithm:**
1. **Candidate Generation** — Filter by basic preferences (age, location, gender)
2. **Feature Extraction** — Encode user profiles into dense vectors
3. **Compatibility Scoring** — Compute similarity scores using learned embeddings
4. **Ranking** — Sort candidates by predicted compatibility
5. **Diversity Injection** — Ensure variety in presented matches
6. **Feedback Loop** — Update model based on match outcomes (likes, conversations, dates)

### 3.4 Safety & Trust

**Fake Profile Detection:**
- AI analyzes uploaded photos for signs of stock images, AI generation, or face-swapping
- Profile completeness scoring (incomplete profiles flagged)
- Behavioral analysis (bot-like patterns, mass messaging)
- Reverse image search integration
- User-initiated verification badges

**Romance Scam Detection:**
- Conversation pattern analysis (requests for money, rapid escalation, sob stories)
- Financial transaction monitoring
- Cross-referencing against known scam databases
- User education and in-app warnings

**Content Moderation:**
- Real-time toxicity detection on messages (on-device + server-side)
- Image classification for explicit content
- Automated flagging with human review queue
- User reporting system with priority escalation

### 3.5 Real-Time Communication

**Text Messaging:**
- One-to-one encrypted chat
- Read receipts and typing indicators
- Voice note recording and playback
- Image, video, and file sharing
- Message reactions

**Voice & Video Calls:**
- WebRTC peer-to-peer calls (with SFU fallback for group calls)
- STUN/TURN infrastructure for NAT traversal
- Push notification wake-up for incoming calls
- Call quality adaptation (bandwidth-aware)
- Call recovery after network interruption

---

## 4. User Experience Philosophy

### 4.1 Design Principles

1. **Simplicity** — Minimal cognitive load. Every screen has one primary action.
2. **Delight** — Micro-interactions, smooth animations, and satisfying feedback.
3. **Safety** — Users should always feel safe. Easy reporting, blocking, and privacy controls.
4. **Inclusivity** — Accessible design for diverse users, abilities, and contexts.
5. **Performance** — 60fps animations, instant taps, zero perceived lag.

### 4.2 Core User Flows

**Discovery Flow:**
```
Open App → View Profile Card → Swipe Right (Like) / Left (Pass) / Up (Super Like)
→ Match Found → Start Conversation
```

**Messaging Flow:**
```
Match List → Select Match → View Conversation → Type/Send Message
→ Receive Reply → Continue Conversation → (Optional) Start Call
```

**Profile Creation Flow:**
```
Register → Verify Phone (OTP) → Add Photos → Write Bio
→ Set Preferences → AI Verification → Profile Goes Live
```

**Safety Flow:**
```
Encounter Issue → Long-press Message/Profile → Report/Block
→ Select Reason → Submit → AI Review → Action Taken
```

### 4.3 Admin Web Panel (Management Console)

Connecta includes a web-based administration panel for platform management. This is a **React (Next.js)** application served separately from the mobile app, accessible to authorized administrators and support staff.

**Purpose:**
Management, moderation, analytics, and operational control of the Connecta platform — without requiring direct database access or server CLI.

**Access:**
- Web-based (browser) — accessible at `admin.connecta.app`
- Role-based access control (RBAC) with two roles:
  - **Super Admin** — Full access to all features
  - **Moderator** — Limited access (reports, user management, content review)

**Authentication:**
- Email + password login
- Two-factor authentication (TOTP) required for all admin accounts
- Session management with automatic timeout
- IP allowlisting (optional, for production hardening)

**Core Modules:**

| Module | Description |
|---|---|
| **Dashboard** | Real-time KPIs: DAU, MAU, new signups, matches, messages, revenue |
| **User Management** | Search, view, suspend, ban, verify, impersonate (view-as) users |
| **Report Center** | Review reported users/messages, take action (warn, suspend, ban) |
| **Content Moderation** | AI-flagged content queue, approve/reject images, review toxic messages |
| **Fake Profile Queue** | AI-flagged suspicious profiles, manual review, verification workflow |
| **Analytics** | User growth, engagement metrics, retention cohorts, revenue reports |
| **Subscription Management** | View/manage subscriptions, issue refunds, promotional credits |
| **Payment Transactions** | Transaction history, dispute resolution, refund processing |
| **Push Notifications** | Send targeted push notifications to user segments |
| **System Settings** | Feature flags, app configuration, matching algorithm parameters |
| **Admin Audit Log** | Track all admin actions for accountability |
| **Content Management** | Manage onboarding screens, promotional banners, FAQs |

**Tech Stack for Admin Panel:**
- **Frontend:** Next.js 14+ (App Router), React 18, TypeScript
- **UI Library:** shadcn/ui + Tailwind CSS
- **State Management:** TanStack Query (React Query)
- **Charts:** Recharts or Chart.js
- **Tables:** TanStack Table with server-side pagination
- **Auth:** JWT-based, shared with backend auth service

**Admin Flows:**

```
Login → 2FA Verification → Dashboard Overview
→ Navigate to Module → Perform Action → Confirm → Audit Log Recorded
```

```
Report Received → Notification → Review Details → AI Confidence Score
→ Decision (Dismiss / Warn / Suspend / Ban) → User Notified → Audit Log
```

```
Suspicious Profile Detected → AI Flag → Queue Entry
→ Manual Review → Verify / Reject / Ban → Badge Updated → Audit Log
```

---

## 5. Platform Requirements

### 5.1 Mobile Requirements

| Requirement | Minimum | Recommended |
|---|---|---|
| iOS | 14.0+ | 16.0+ |
| Android | 8.0 (API 26)+ | 12.0 (API 31)+ |
| RAM | 2 GB | 4 GB+ |
| Storage | 200 MB | 500 MB+ |
| Network | 2G (degraded) | 3G/4G/WiFi |

### 5.2 Backend Requirements

| Requirement | Specification |
|---|---|
| API Response Time | < 200ms (p95) |
| Availability | 99.9% uptime |
| Concurrent Users | 100,000+ (initial) |
| Data Residency | Nigeria (primary), configurable by region |
| Backup Frequency | Hourly incremental, daily full |

### 5.3 Admin Web Panel Requirements

| Requirement | Specification |
|---|---|
| Browser Support | Chrome 90+, Firefox 90+, Safari 15+, Edge 90+ |
| Screen Resolution | 1280×720 minimum, 1920×1080 recommended |
| Load Time | < 2 seconds (initial), < 500ms (navigation) |
| Session Timeout | 30 minutes inactivity, 8 hours maximum |
| Concurrent Admin Users | 50+ (initial) |
| Audit Log Retention | 2 years minimum |
| 2FA | Required for all admin accounts |

---

## 6. Monetization Strategy

### 6.1 Freemium Model

Free users get core functionality. Premium features drive conversion.

| Feature | Free | Premium | Gold | Platinum |
|---|---|---|---|---|
| Daily Likes | 50 | Unlimited | Unlimited | Unlimited |
| Advanced Filters | Basic | Full | Full | Full |
| See Who Liked You | No | Yes | Yes | Yes |
| Read Receipts | No | Yes | Yes | Yes |
| Profile Boost | No | 1/month | 3/month | 5/month |
| AI Match Insights | No | No | Yes | Yes |
| Video Calls | No | No | No | Yes |
| Incognito Mode | No | No | No | Yes |

### 6.2 In-App Purchases

- **Super Likes** — Pack of 5/10/25
- **Profile Boosts** — 30-minute visibility increase
- **Virtual Gifts** — Digital items to send to matches
- **Read Receipts** — Pay-per-reveal for free users

---

## 7. Competitive Advantages

| Advantage | Description |
|---|---|
| Offline-First | Only dating app that works fully without internet |
| E2EE by Default | Privacy is not optional — it's the default |
| African-First Design | Built for African connectivity, payment methods, and culture |
| AI Safety | Proactive scam and fake profile detection |
| Local Payments | Mobile money, bank transfer, USSD payments |
| Low Storage | Optimized for devices with limited storage |
| Voice-First | Voice notes and calls optimized for low bandwidth |

---

## 8. Success Criteria

### 8.1 Launch Success (Month 3)

- 10,000 registered users
- 2,000 daily active users
- 4.0+ app store rating
- < 1% crash rate
- 95%+ message delivery rate

### 8.2 Growth Success (Month 6)

- 100,000 registered users
- 20,000 daily active users
- 3% premium conversion
- 40%+ D7 retention
- < 0.1% fake profile rate (post-detection)

### 8.3 Scale Success (Month 12)

- 500,000 registered users
- 100,000 daily active users
- 5%+ premium conversion
- Pan-African presence
- Revenue-positive unit economics

---

*This document is part of the Connecta Software Design Document (SDD) package.*
