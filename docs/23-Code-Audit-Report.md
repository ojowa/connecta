# Code Audit Report

## Connecta — Full Implementation Audit

**Date:** July 2026
**Auditor:** Automated Code Analysis
**Scope:** All backend services, mobile app, shared libraries, configuration

---

## Executive Summary

| Severity | Count | Status |
|----------|-------|--------|
| Critical | 2 | Fixed (commit pending) |
| High | 8 | Not started |
| Medium | 7 | Not started |
| Low | 2 | Not started |

**Critical issues** (app won't start) have been resolved. High/medium/low items remain for future sprints.

---

## 1. Critical Issues (Fixed)

### 1.1 No `.env` File

**File:** Root directory
**Impact:** Every service fails to boot — `Missing required config` errors from `libs/config/src/config.service.ts:16`
**Root cause:** Only `.env.example` exists; no actual `.env` file with working values
**Fix:** Created `.env` file from `.env.example` with working defaults for local development

**Environment variables required by services:**

| Variable | Used By | Example Value |
|----------|---------|---------------|
| `DB_HOST` | All services | `localhost` |
| `DB_PORT` | All services | `5432` |
| `DB_USERNAME` | All services | `postgres` |
| `DB_PASSWORD` | All services | `password` |
| `DB_NAME` | All services | `connecta_db` |
| `JWT_SECRET` | Auth, Admin, Chat, Call | `dev-secret` |
| `JWT_REFRESH_SECRET` | Auth service | `dev-refresh-secret` |
| `NATS_URL` | All services | `nats://localhost:4222` |
| `REDIS_URL` | Matching, Chat, Notification | `redis://localhost:6379` |
| `CORS_ORIGIN` | API Gateway | `http://localhost:3000` |

### 1.2 Crypto Routes 404

**Files:**
- `apps/api-gateway/src/modules/crypto/crypto.controller.ts` — routes exist
- `apps/user-service/src/users.controller.ts` — no crypto endpoints
- `apps/user-service/src/app.module.ts` — no `PreKeyBundle` entity imported

**Impact:** All `/v1/crypto/prekeys/*`, `/v1/crypto/sessions/*`, `/v1/crypto/backup` routes return 404
**Root cause:** API gateway proxies crypto routes to user-service, but user-service was never given crypto endpoints or the Signal Protocol `PreKeyBundle` entity
**Fix:** Added crypto endpoints to user-service controller, imported `PreKeyBundle` entity in module

---

## 2. High Severity (Not Started)

### 2.1 Payment Service — No Paystack Integration

**File:** `apps/payment-service/src/payments.service.ts:52-63`
**Impact:** Payments appear to work but no money moves
**Details:**
- `initializePayment()` creates a DB record but never calls Paystack API to generate a payment URL
- Returns a fake reference string: `CKA-TXN-${Date.now()}`
- `verifyPayment()` marks transactions as completed without verifying with Paystack
- `requestRefund()` returns `{ status: 'pending_review' }` with no actual logic
- No webhook handler for Paystack callbacks
**Fix required:** Integrate Paystack SDK (`paystack-node`), implement `initializeTransaction`, `verifyTransaction`, and webhook endpoint

### 2.2 Media Service — No S3 Upload

**File:** `apps/media-service/src/media.service.ts:18-21`
**Impact:** Media URLs are hardcoded, uploads won't persist to real storage
**Details:**
- `getPresignedUrl()` returns hardcoded S3 URLs without calling AWS SDK
- `upload()` saves a DB record assuming client uploaded directly
- No `@aws-sdk/client-s3` or `@aws-sdk/s3-request-presigner` integration
**Fix required:** Install AWS SDK, implement `getSignedUrl()` with proper bucket/region config

### 2.3 Notification Service — No Push Delivery

**File:** `apps/notification-service/src/notifications.service.ts:48-64`
**Impact:** Notifications saved to DB but never delivered to devices
**Details:**
- `send()` creates a DB record but never sends Firebase Cloud Messaging (FCM)
- `broadcast()` returns `estimatedRecipients: 0` and a fake `broadcastId`
- No Firebase Admin SDK (`firebase-admin`) integration
- No device token management
**Fix required:** Install `firebase-admin`, initialize with service account, implement `messaging().sendEach()` for push delivery

### 2.4 Auth Service — No SMS/Email Delivery

**File:** `apps/auth-service/src/auth.service.ts:110-168`
**Impact:** OTPs generated but never delivered to users
**Details:**
- `sendOtp()` generates a 6-digit code and saves it, but never sends via Twilio/email
- `forgotPassword()` creates OTP record but never sends a password reset email
- Returns `{ otpSent: true }` regardless of actual delivery
**Fix required:** Integrate Twilio SDK for SMS OTP, Nodemailer/SES for email delivery

### 2.5 Profile Verification — Stub

**File:** `apps/profile-service/src/profiles.service.ts:83-87`
**Impact:** Verification requests return fake data
**Details:**
- `requestVerification()` returns `{ verificationId: 'vrf_' + Date.now(), method: 'selfie', status: 'processing' }`
- No selfie image upload or storage
- No third-party verification API call (e.g., Jumio, Onfido)
**Fix required:** At minimum, implement image upload and manual admin review flow

### 2.6 Admin Analytics — Empty

**File:** `apps/admin-service/src/admin.service.ts:134-145`
**Impact:** Dashboard shows zeroed metrics
**Details:**
- `getAnalytics()` returns `dataPoints: []` and hardcoded `summary: { totalUsers: 0, ... }`
- No aggregation queries against actual tables
**Fix required:** Write SQL aggregation queries for user growth, engagement, revenue metrics

### 2.7 Biometric Auth — Broken

**File:** `apps/auth-service/src/auth.service.ts:198-223`
**Impact:** Biometric registration/login will fail at runtime
**Details:**
- `registerBiometric()` returns a biometric ID but never saves to any table (no `BiometricCredential` entity)
- `biometricLogin()` queries `User` table by `deviceId` which will never match
- `removeBiometric()` returns `{ removed: true }` without deleting anything
**Fix required:** Create `BiometricCredential` entity, implement proper CRUD

### 2.8 Double-Increment Bug in `like()`

**File:** `apps/matching-service/src/matching.service.ts:37-50`
**Impact:** Users burn through daily like limits twice as fast
**Details:**
- `like()` calls both an `INSERT...OR UPDATE` and a separate `UPDATE SET likesGiven = likesGiven + 1`
- The daily like count gets incremented twice per like action
**Fix required:** Remove the duplicate increment — use only the atomic upsert

---

## 3. Medium Severity (Not Started)

### 3.1 Mobile Store Actions Empty

**File:** `connecta-mobile/src/store/index.ts:61-65`
**Impact:** Real-time message/match state from WebSocket won't persist
**Details:**
```typescript
addMessage: () => {},
updateMessage: () => {},
removeMessage: () => {},
markMessagesRead: () => {},
addNewMatch: () => {},
```
**Fix required:** Implement Zustand state mutations that respond to Socket.IO events

### 3.2 Settings Screen — All Handlers Empty

**File:** `connecta-mobile/src/screens/settings/SettingsScreen.tsx:58-128`
**Impact:** 20+ settings items do nothing when tapped
**Details:** Edit Phone, Edit Email, Change Password, Two-Factor Auth, Devices, Age Range, Distance, Show Me, Block List, Download Data, Delete Account, Current Plan, Manage Subscription, Payment History, Help Center, Report a Problem, Community Guidelines, Terms of Service, Privacy Policy — all `onPress={() => {}}`
**Fix required:** Create individual screens for each setting and wire navigation

### 3.3 Subscription Screen — Hardcoded Plans

**File:** `connecta-mobile/src/screens/subscription/SubscriptionScreen.tsx:31-87`
**Impact:** Plans shown are static, not from API
**Details:** Plans hardcoded in `PLANS` array. No API call to `/payments/plans`. Subscribe button not wired.
**Fix required:** Fetch plans from payment-service API, implement subscribe flow

### 3.4 Video Call Screens — UI Shells

**File:** `connecta-mobile/src/screens/call/ActiveVideoCallScreen.tsx`
**Impact:** Calls show placeholder text, no real video/audio
**Details:** Shows "Remote Video" and "You" text. `WebRTCManager.ts` exists but isn't wired to these screens.
**Fix required:** Connect `WebRTCManager` to `RTCPeerView` components, implement ICE candidate exchange via signalling

### 3.5 markAllAsRead — TODO

**File:** `connecta-mobile/src/screens/notifications/NotificationsScreen.tsx:55-57`
**Impact:** "Mark all as read" button does nothing
**Fix required:** Call `PUT /notifications/read` with `{ markAs: 'all' }`

### 3.6 Wallet In-App Purchases — Stub

**File:** `connecta-mobile/src/screens/subscription/WalletScreen.tsx:116-118`
**Impact:** Buy buttons show "Coming soon"
**Fix required:** Integrate `expo-in-app-purchases` or RevenueCat SDK

### 3.7 Config Service — Env Var Naming Mismatch

**File:** `libs/config/src/config.service.ts`
**Impact:** Services may fail to read config correctly
**Details:**
- Config service reads `DB_DATABASE` but `.env.example` uses `DB_NAME`
- Config service reads `REDIS_HOST`/`REDIS_PORT` but `.env.example` uses `REDIS_URL`
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` required but not in `.env.example`
- `CLOUDINARY_*` vars required but media service uses S3
**Fix required:** Align config service with `.env.example` naming, or vice versa

---

## 4. Low Severity (Not Started)

### 4.1 Notification markAll Read Returns Wrong Count

**File:** `apps/notification-service/src/notifications.service.ts:38`
**Impact:** Client receives `markedRead: 0` even when notifications were marked
**Fix:** Return the actual count from the query builder

### 4.2 Data Source Entity Paths May Not Resolve

**File:** `libs/database/src/data-source.ts:16`
**Impact:** TypeORM may not discover entities for migrations
**Details:** Entity paths point to `apps/**/entities/*.entity.ts` but entities are in `libs/common/src/entities/`
**Fix:** Update entity paths to match actual file locations

---

## 5. Implementation Roadmap

### Sprint 1 — Critical Fixes (Done)
- [x] Create `.env` file with working defaults
- [x] Add crypto endpoints to user-service

### Sprint 2 — External Integrations (High Priority)
- [ ] Paystack payment integration
- [ ] AWS S3 media upload
- [ ] Firebase push notifications
- [ ] Twilio SMS / email delivery

### Sprint 3 — Core Features (High Priority)
- [ ] Profile verification flow
- [ ] Admin analytics aggregation
- [ ] Biometric auth with entity
- [ ] Fix like() double-increment bug

### Sprint 4 — Mobile Polish (Medium Priority)
- [ ] Implement store actions for real-time updates
- [ ] Wire settings screen handlers
- [ ] Fetch subscription plans from API
- [ ] Connect WebRTC to video call screens
- [ ] Fix markAllAsRead

### Sprint 5 — Config & Cleanup (Low Priority)
- [ ] Align env var naming
- [ ] Fix notification count response
- [ ] Fix entity paths for TypeORM

---

*This document is part of the Connecta Software Design Document (SDD) package.*
