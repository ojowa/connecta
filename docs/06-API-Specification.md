# API Specification

## Connecta — RESTful & WebSocket API Reference

**Version:** 1.0.0
**Date:** July 2026

---

## Table of Contents

1. [API Overview](#1-api-overview)
2. [Authentication](#2-authentication)
3. [Common Conventions](#3-common-conventions)
4. [Auth Service](#4-auth-service)
5. [User Service](#5-user-service)
6. [Profile Service](#6-profile-service)
7. [Matching Service](#7-matching-service)
8. [Chat Service](#8-chat-service)
9. [Call Service](#9-call-service)
10. [Media Service](#10-media-service)
11. [Payment Service](#11-payment-service)
12. [Notification Service](#12-notification-service)
13. [Search Service](#13-search-service)
14. [Admin Service](#14-admin-service)
15. [WebSocket Events](#15-websocket-events)
16. [Error Codes Reference](#16-error-codes-reference)

---

## 1. API Overview

### 1.1 Base URLs

| Environment | Base URL |
|---|---|
| Production | `https://api.connecta.app/v1` |
| Staging | `https://api.staging.connecta.app/v1` |
| Local | `http://localhost:3000/v1` |

### 1.2 Content Types

All requests and responses use `application/json` unless otherwise specified. File uploads use `multipart/form-data`.

### 1.3 Rate Limits

| Tier | Requests / Minute | Burst |
|---|---|---|
| Anonymous | 30 | 5 |
| Authenticated (Free) | 120 | 20 |
| Authenticated (Premium) | 300 | 50 |
| Admin | 600 | 100 |

Rate limit headers are included in every response:

```
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 118
X-RateLimit-Reset: 1689876543
```

### 1.4 API Versioning

The API is versioned via URL path (`/v1/`). Breaking changes will increment the version. Non-breaking additions (new fields, new endpoints) do not require versioning.

---

## 2. Authentication

### 2.1 JWT Authentication

Most endpoints require a valid JWT Bearer token in the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

Tokens are issued by the Auth Service upon login and contain:

| Claim | Description |
|---|---|
| `sub` | User ID (UUID) |
| `email` | User email |
| `role` | `user` or `admin` |
| `iat` | Issued at (Unix timestamp) |
| `exp` | Expiration (Unix timestamp, 15 minutes) |
| `jti` | Unique token ID |

### 2.2 Refresh Tokens

Access tokens expire after **15 minutes**. Use the refresh token to obtain a new access token. Refresh tokens are single-use and rotate on each refresh.

| Token Type | Lifetime | Storage |
|---|---|---|
| Access Token | 15 minutes | Memory (client) |
| Refresh Token | 30 days | Secure storage (device) |
| Biometric Token | Until password change | Secure enclave |

### 2.3 Admin Authentication

Admin endpoints use a separate JWT with additional claims:

```json
{
  "sub": "admin-uuid",
  "role": "admin",
  "permissions": ["users.read", "users.write", "reports.read"],
  "mfa_verified": true
}
```

### 2.4 API Keys

For server-to-server integrations, use the `X-API-Key` header:

```
X-API-Key: cka_live_xxxxxxxxxxxxxxxx
```

---

## 3. Common Conventions

### 3.1 Request/Response Envelope

All successful responses follow a consistent envelope:

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "has_more": true
  }
}
```

### 3.2 Pagination

| Parameter | Default | Description |
|---|---|---|
| `page` | `1` | Page number (1-indexed) |
| `limit` | `20` | Items per page (max 100) |

Cursor-based pagination is available for some endpoints using `cursor` and `next_cursor`.

### 3.3 Filtering & Sorting

```
GET /v1/users?age_min=22&age_max=30&sort_by=created_at&sort_order=desc
```

### 3.4 Standard HTTP Methods

| Method | Idempotent | Description |
|---|---|---|
| `GET` | Yes | Read resource(s) |
| `POST` | No | Create resource |
| `PUT` | Yes | Full update |
| `PATCH` | No | Partial update |
| `DELETE` | Yes | Delete resource |

### 3.5 Standard Status Codes

| Code | Meaning |
|---|---|
| `200` | OK — Success |
| `201` | Created — Resource created |
| `204` | No Content — Success, no body |
| `400` | Bad Request — Invalid input |
| `401` | Unauthorized — Missing or invalid token |
| `403` | Forbidden — Insufficient permissions |
| `404` | Not Found — Resource doesn't exist |
| `409` | Conflict — Resource already exists |
| `422` | Unprocessable Entity — Validation failed |
| `429` | Too Many Requests — Rate limit exceeded |
| `500` | Internal Server Error |
| `503` | Service Unavailable |

---

## 4. Auth Service

### 4.1 Register

Creates a new user account.

```
POST /v1/auth/register
```

**Auth Required:** No

**Request Body:**

```json
{
  "email": "user@example.com",
  "phone": "+2348012345678",
  "password": "SecureP@ss123",
  "full_name": "Adebayo Johnson",
  "date_of_birth": "1995-06-15",
  "gender": "male",
  "referral_code": "ABCD1234",
  "accept_terms": true,
  "device_info": {
    "device_id": "device-uuid-123",
    "platform": "ios",
    "os_version": "17.5",
    "app_version": "1.0.0",
    "push_token": "fcm-token-or-apns-token"
  }
}
```

**Field Constraints:**

| Field | Type | Required | Validation |
|---|---|---|---|
| `email` | string | Yes | Valid email, lowercase |
| `phone` | string | No | E.164 format |
| `password` | string | Yes | Min 8 chars, 1 upper, 1 lower, 1 number, 1 special |
| `full_name` | string | Yes | 2-100 characters |
| `date_of_birth` | string | Yes | ISO 8601 date, must be 18+ |
| `gender` | string | Yes | `male`, `female`, `non_binary`, `other` |
| `referral_code` | string | No | Existing user's referral code |
| `accept_terms` | boolean | Yes | Must be `true` |
| `device_info` | object | Yes | Device registration details |

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_a1b2c3d4e5f6",
      "email": "user@example.com",
      "phone": "+2348012345678",
      "full_name": "Adebayo Johnson",
      "date_of_birth": "1995-06-15",
      "gender": "male",
      "email_verified": false,
      "phone_verified": false,
      "profile_completed": false,
      "created_at": "2026-07-19T10:00:00Z"
    },
    "tokens": {
      "access_token": "eyJhbGciOiJSUzI1NiIs...",
      "refresh_token": "rt_x1y2z3...",
      "expires_in": 900
    },
    "requires_email_verification": true,
    "requires_profile_setup": true
  }
}
```

**Error Responses:**

| Status | Code | Scenario |
|---|---|---|
| 400 | `AUTH_001` | Invalid email format |
| 400 | `AUTH_002` | Password does not meet requirements |
| 400 | `AUTH_003` | Must be at least 18 years old |
| 409 | `AUTH_004` | Email already registered |
| 409 | `AUTH_005` | Phone number already registered |
| 422 | `AUTH_006` | Terms must be accepted |

**Curl Example:**

```bash
curl -X POST https://api.connecta.app/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "phone": "+2348012345678",
    "password": "SecureP@ss123",
    "full_name": "Adebayo Johnson",
    "date_of_birth": "1995-06-15",
    "gender": "male",
    "accept_terms": true,
    "device_info": {
      "device_id": "device-uuid-123",
      "platform": "ios",
      "os_version": "17.5",
      "app_version": "1.0.0"
    }
  }'
```

---

### 4.2 Login

Authenticates a user with email/phone and password.

```
POST /v1/auth/login
```

**Auth Required:** No

**Request Body:**

```json
{
  "identifier": "user@example.com",
  "password": "SecureP@ss123",
  "device_info": {
    "device_id": "device-uuid-123",
    "platform": "ios",
    "os_version": "17.5",
    "app_version": "1.0.0",
    "push_token": "fcm-token"
  }
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_a1b2c3d4e5f6",
      "email": "user@example.com",
      "full_name": "Adebayo Johnson",
      "role": "user",
      "email_verified": true,
      "phone_verified": true,
      "profile_completed": true,
      "avatar_url": "https://cdn.connecta.app/avatars/usr_a1b2c3d4e5f6.jpg"
    },
    "tokens": {
      "access_token": "eyJhbGciOiJSUzI1NiIs...",
      "refresh_token": "rt_newtoken...",
      "expires_in": 900
    },
    "requires_2fa": false
  }
}
```

**If 2FA is required:**

```json
{
  "success": true,
  "data": {
    "requires_2fa": true,
    "temp_token": "tmp_x1y2z3...",
    "methods": ["totp", "sms"]
  }
}
```

**Error Responses:**

| Status | Code | Scenario |
|---|---|---|
| 400 | `AUTH_010` | Invalid credentials format |
| 401 | `AUTH_011` | Invalid email or password |
| 401 | `AUTH_012` | Account is locked (too many attempts) |
| 401 | `AUTH_013` | Account is suspended |
| 401 | `AUTH_014` | Email not verified |

**Curl Example:**

```bash
curl -X POST https://api.connecta.app/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "user@example.com",
    "password": "SecureP@ss123",
    "device_info": {
      "device_id": "device-uuid-123",
      "platform": "ios",
      "os_version": "17.5",
      "app_version": "1.0.0"
    }
  }'
```

---

### 4.3 Send OTP

Sends a one-time password for verification (email or phone).

```
POST /v1/auth/otp/send
```

**Auth Required:** No

**Request Body:**

```json
{
  "channel": "email",
  "purpose": "registration",
  "identifier": "user@example.com"
}
```

**Field Constraints:**

| Field | Type | Values |
|---|---|---|
| `channel` | string | `email`, `sms`, `whatsapp` |
| `purpose` | string | `registration`, `login`, `reset_password`, `phone_verify`, `2fa` |
| `identifier` | string | Email or phone depending on channel |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "otp_sent": true,
    "channel": "email",
    "expires_in": 300,
    "masked_identifier": "u***r@example.com"
  }
}
```

**Error Responses:**

| Status | Code | Scenario |
|---|---|---|
| 400 | `AUTH_020` | Invalid channel or purpose |
| 400 | `AUTH_021` | Invalid identifier format |
| 429 | `AUTH_022` | Too many OTP requests (wait 60s) |
| 404 | `AUTH_023` | No account found for identifier |

**Curl Example:**

```bash
curl -X POST https://api.connecta.app/v1/auth/otp/send \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "email",
    "purpose": "registration",
    "identifier": "user@example.com"
  }'
```

---

### 4.4 Verify OTP

Verifies the OTP code sent to the user.

```
POST /v1/auth/otp/verify
```

**Auth Required:** No

**Request Body:**

```json
{
  "identifier": "user@example.com",
  "code": "482917",
  "purpose": "registration"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "verified": true,
    "purpose": "registration",
    "user_id": "usr_a1b2c3d4e5f6",
    "tokens": {
      "access_token": "eyJhbGciOiJSUzI1NiIs...",
      "refresh_token": "rt_verified...",
      "expires_in": 900
    }
  }
}
```

**Error Responses:**

| Status | Code | Scenario |
|---|---|---|
| 400 | `AUTH_030` | Invalid OTP code |
| 400 | `AUTH_031` | OTP expired |
| 400 | `AUTH_032` | Too many failed attempts |
| 404 | `AUTH_033` | No pending OTP for this identifier |

**Curl Example:**

```bash
curl -X POST https://api.connecta.app/v1/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "user@example.com",
    "code": "482917",
    "purpose": "registration"
  }'
```

---

### 4.5 Refresh Token

Rotates the refresh token and issues a new access token.

```
POST /v1/auth/refresh
```

**Auth Required:** No (requires valid refresh token)

**Request Body:**

```json
{
  "refresh_token": "rt_x1y2z3..."
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "tokens": {
      "access_token": "eyJhbGciOiJSUzI1NiIs...",
      "refresh_token": "rt_newrotated...",
      "expires_in": 900
    }
  }
}
```

**Error Responses:**

| Status | Code | Scenario |
|---|---|---|
| 401 | `AUTH_040` | Invalid or expired refresh token |
| 401 | `AUTH_041` | Refresh token already used (replay attack) |
| 401 | `AUTH_042` | Refresh token revoked |

**Curl Example:**

```bash
curl -X POST https://api.connecta.app/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "rt_x1y2z3..."}'
```

---

### 4.6 Logout

Revokes the current session and optionally all sessions.

```
POST /v1/auth/logout
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Request Body:**

```json
{
  "all_devices": false
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "logged_out": true,
    "sessions_revoked": 1
  }
}
```

**Curl Example:**

```bash
curl -X POST https://api.connecta.app/v1/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{"all_devices": false}'
```

---

### 4.7 List Devices

Returns all devices registered to the authenticated user.

```
GET /v1/auth/devices
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "devices": [
      {
        "device_id": "dev_abc123",
        "platform": "ios",
        "os_version": "17.5",
        "app_version": "1.0.0",
        "device_name": "iPhone 15 Pro",
        "is_current": true,
        "last_active_at": "2026-07-19T10:30:00Z",
        "created_at": "2026-07-01T08:00:00Z"
      },
      {
        "device_id": "dev_def456",
        "platform": "android",
        "os_version": "14",
        "app_version": "1.0.0",
        "device_name": "Samsung Galaxy S24",
        "is_current": false,
        "last_active_at": "2026-07-18T15:00:00Z",
        "created_at": "2026-06-15T12:00:00Z"
      }
    ]
  }
}
```

**Curl Example:**

```bash
curl -X GET https://api.connecta.app/v1/auth/devices \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."
```

---

### 4.8 Revoke Device

Removes a specific device session.

```
DELETE /v1/auth/devices/:device_id
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "revoked": true,
    "device_id": "dev_def456"
  }
}
```

**Error Responses:**

| Status | Code | Scenario |
|---|---|---|
| 404 | `AUTH_050` | Device not found |
| 400 | `AUTH_051` | Cannot revoke current device |

**Curl Example:**

```bash
curl -X DELETE https://api.connecta.app/v1/auth/devices/dev_def456 \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."
```

---

### 4.9 Enable Biometric Auth

Registers a biometric key for the authenticated user's device.

```
POST /v1/auth/biometric/register
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Request Body:**

```json
{
  "device_id": "dev_abc123",
  "biometric_type": "face_id",
  "public_key": "base64-encoded-public-key",
  "credential_id": "base64-credential-id"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "biometric_id": "bio_xyz789",
    "biometric_type": "face_id",
    "enabled": true,
    "created_at": "2026-07-19T10:00:00Z"
  }
}
```

**Curl Example:**

```bash
curl -X POST https://api.connecta.app/v1/auth/biometric/register \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "dev_abc123",
    "biometric_type": "face_id",
    "public_key": "base64-encoded-public-key",
    "credential_id": "base64-credential-id"
  }'
```

---

### 4.10 Biometric Login

Authenticates using a biometric signature.

```
POST /v1/auth/biometric/login
```

**Auth Required:** No

**Request Body:**

```json
{
  "device_id": "dev_abc123",
  "credential_id": "base64-credential-id",
  "signature": "base64-signature",
  "challenge": "server-challenge-nonce"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_a1b2c3d4e5f6",
      "email": "user@example.com",
      "full_name": "Adebayo Johnson"
    },
    "tokens": {
      "access_token": "eyJhbGciOiJSUzI1NiIs...",
      "refresh_token": "rt_bio...",
      "expires_in": 900
    }
  }
}
```

**Error Responses:**

| Status | Code | Scenario |
|---|---|---|
| 401 | `AUTH_060` | Invalid biometric signature |
| 401 | `AUTH_061` | Biometric not registered for this device |
| 401 | `AUTH_062` | Challenge expired |

**Curl Example:**

```bash
curl -X POST https://api.connecta.app/v1/auth/biometric/login \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "dev_abc123",
    "credential_id": "base64-credential-id",
    "signature": "base64-signature",
    "challenge": "server-challenge-nonce"
  }'
```

---

### 4.11 Remove Biometric Auth

Disables biometric authentication for a device.

```
DELETE /v1/auth/biometric/:biometric_id
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "removed": true,
    "biometric_id": "bio_xyz789"
  }
}
```

**Curl Example:**

```bash
curl -X DELETE https://api.connecta.app/v1/auth/biometric/bio_xyz789 \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."
```

---

### 4.12 Forgot Password

Sends a password reset link to the user's email.

```
POST /v1/auth/password/forgot
```

**Auth Required:** No

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message": "If an account exists with this email, a reset link has been sent.",
    "email_sent": true
  }
}
```

> **Note:** Always returns 200 to prevent email enumeration.

**Curl Example:**

```bash
curl -X POST https://api.connecta.app/v1/auth/password/forgot \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

---

### 4.13 Reset Password

Resets the user's password using a valid reset token.

```
POST /v1/auth/password/reset
```

**Auth Required:** No

**Request Body:**

```json
{
  "token": "reset-token-from-email",
  "new_password": "NewSecureP@ss456"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "password_reset": true,
    "sessions_revoked": 3,
    "message": "Password updated. All sessions have been revoked."
  }
}
```

**Error Responses:**

| Status | Code | Scenario |
|---|---|---|
| 400 | `AUTH_070` | Invalid or expired reset token |
| 400 | `AUTH_071` | New password does not meet requirements |

**Curl Example:**

```bash
curl -X POST https://api.connecta.app/v1/auth/password/reset \
  -H "Content-Type: application/json" \
  -d '{
    "token": "reset-token-from-email",
    "new_password": "NewSecureP@ss456"
  }'
```

---

## 5. User Service

### 5.1 Get Current User Profile

Returns the authenticated user's full profile.

```
GET /v1/users/me
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "usr_a1b2c3d4e5f6",
    "email": "user@example.com",
    "phone": "+2348012345678",
    "full_name": "Adebayo Johnson",
    "date_of_birth": "1995-06-15",
    "gender": "male",
    "bio": "Tech enthusiast, coffee lover, and adventure seeker.",
    "location": {
      "latitude": 6.5244,
      "longitude": 3.3792,
      "city": "Lagos",
      "country": "Nigeria"
    },
    "profile_completed": true,
    "verified": true,
    "online": true,
    "last_seen_at": "2026-07-19T10:30:00Z",
    "created_at": "2026-06-01T08:00:00Z"
  }
}
```

**Curl Example:**

```bash
curl -X GET https://api.connecta.app/v1/users/me \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."
```

---

### 5.2 Update Profile

Updates the authenticated user's profile fields.

```
PATCH /v1/users/me
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Request Body (all fields optional):**

```json
{
  "full_name": "Adebayo Johnson",
  "bio": "Updated bio text here.",
  "date_of_birth": "1995-06-15",
  "gender": "male",
  "location": {
    "latitude": 6.5244,
    "longitude": 3.3792,
    "city": "Lagos",
    "country": "Nigeria"
  },
  "job_title": "Senior Engineer",
  "company": "TechCorp",
  "education": "University of Lagos",
  "height_cm": 180,
  "looking_for": "relationship",
  "relationship_goal": "long_term"
}
```

**Field Constraints:**

| Field | Type | Validation |
|---|---|---|
| `full_name` | string | 2-100 characters |
| `bio` | string | Max 500 characters |
| `gender` | string | `male`, `female`, `non_binary`, `other` |
| `looking_for` | string | `men`, `women`, `everyone` |
| `relationship_goal` | string | `casual`, `short_term`, `long_term`, `marriage`, `unsure` |
| `height_cm` | integer | 100-250 |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "updated_fields": ["bio", "job_title", "company"],
    "profile_completed": true
  }
}
```

**Error Responses:**

| Status | Code | Scenario |
|---|---|---|
| 400 | `USR_001` | Invalid field value |
| 400 | `USR_002` | Bio exceeds 500 characters |
| 422 | `USR_003` | Date of birth implies under 18 |

**Curl Example:**

```bash
curl -X PATCH https://api.connecta.app/v1/users/me \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Updated bio text here.",
    "job_title": "Senior Engineer"
  }'
```

---

### 5.3 Get User Public Profile

Returns another user's public profile (for viewing profiles in the feed or matched users).

```
GET /v1/users/:user_id
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "usr_x9y8z7w6",
    "full_name": "Chidinma Okafor",
    "age": 27,
    "gender": "female",
    "bio": "Passionate about art and travel.",
    "job_title": "UX Designer",
    "company": "DesignHub",
    "education": "University of Nigeria",
    "height_cm": 165,
    "verified": true,
    "online": false,
    "last_seen_at": "2026-07-19T08:00:00Z",
    "compatibility_score": 87,
    "mutual_interests": ["travel", "art", "photography"],
    "photos": [
      {
        "id": "photo_abc123",
        "url": "https://cdn.connecta.app/photos/usr_x9y8z7w6/1.jpg",
        "order": 1,
        "is_primary": true
      }
    ],
    "distance_km": 5.2
  }
}
```

**Error Responses:**

| Status | Code | Scenario |
|---|---|---|
| 404 | `USR_010` | User not found |
| 403 | `USR_011` | User has blocked you |
| 403 | `USR_012` | Profile not visible |

**Curl Example:**

```bash
curl -X GET https://api.connecta.app/v1/users/usr_x9y8z7w6 \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."
```

---

### 5.4 Update Preferences

Updates matching preferences for the authenticated user.

```
PUT /v1/users/me/preferences
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Request Body:**

```json
{
  "age_range": {
    "min": 22,
    "max": 35
  },
  "max_distance_km": 50,
  "preferred_gender": "women",
  "relationship_goal": "long_term",
  "dealbreakers": ["smoking", "has_children"],
  "interests_importance": "high",
  "education_importance": "medium"
}
```

**Field Constraints:**

| Field | Type | Validation |
|---|---|---|
| `age_range.min` | integer | 18-100 |
| `age_range.max` | integer | 18-100, must be >= min |
| `max_distance_km` | integer | 1-500 |
| `preferred_gender` | string | `men`, `women`, `everyone` |
| `relationship_goal` | string | `casual`, `short_term`, `long_term`, `marriage`, `unsure` |
| `dealbreakers` | array | Max 10 items |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "preferences": {
      "age_range": { "min": 22, "max": 35 },
      "max_distance_km": 50,
      "preferred_gender": "women",
      "relationship_goal": "long_term",
      "dealbreakers": ["smoking", "has_children"],
      "interests_importance": "high",
      "education_importance": "medium"
    },
    "updated_at": "2026-07-19T10:00:00Z"
  }
}
```

**Curl Example:**

```bash
curl -X PUT https://api.connecta.app/v1/users/me/preferences \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "age_range": {"min": 22, "max": 35},
    "max_distance_km": 50,
    "preferred_gender": "women",
    "relationship_goal": "long_term"
  }'
```

---

### 5.5 Get Preferences

Returns the authenticated user's current matching preferences.

```
GET /v1/users/me/preferences
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "age_range": { "min": 22, "max": 35 },
    "max_distance_km": 50,
    "preferred_gender": "women",
    "relationship_goal": "long_term",
    "dealbreakers": ["smoking", "has_children"],
    "interests_importance": "high",
    "education_importance": "medium",
    "updated_at": "2026-07-19T10:00:00Z"
  }
}
```

**Curl Example:**

```bash
curl -X GET https://api.connecta.app/v1/users/me/preferences \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."
```

---

### 5.6 Block User

Blocks a user, preventing them from seeing your profile or contacting you.

```
POST /v1/users/:user_id/block
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Request Body:**

```json
{
  "reason": "harassment"
}
```

| Field | Values |
|---|---|
| `reason` | `harassment`, `spam`, `fake_profile`, `inappropriate_content`, `other` |

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "blocked": true,
    "blocked_user_id": "usr_x9y8z7w6",
    "mutual_match_removed": true,
    "conversation_archived": true
  }
}
```

**Curl Example:**

```bash
curl -X POST https://api.connecta.app/v1/users/usr_x9y8z7w6/block \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{"reason": "harassment"}'
```

---

### 5.7 Unblock User

Removes a previously blocked user.

```
DELETE /v1/users/:user_id/block
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "unblocked": true,
    "blocked_user_id": "usr_x9y8z7w6"
  }
}
```

**Curl Example:**

```bash
curl -X DELETE https://api.connecta.app/v1/users/usr_x9y8z7w6/block \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."
```

---

### 5.8 List Blocked Users

Returns a list of all users blocked by the authenticated user.

```
GET /v1/users/me/blocks
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Query Parameters:**

| Parameter | Default | Description |
|---|---|---|
| `page` | `1` | Page number |
| `limit` | `20` | Items per page |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "blocked_users": [
      {
        "blocked_user_id": "usr_x9y8z7w6",
        "full_name": "Chidinma Okafor",
        "reason": "harassment",
        "blocked_at": "2026-07-19T10:00:00Z"
      }
    ],
    "meta": { "page": 1, "limit": 20, "total": 1, "has_more": false }
  }
}
```

**Curl Example:**

```bash
curl -X GET "https://api.connecta.app/v1/users/me/blocks?page=1&limit=20" \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."
```

---

### 5.9 Report User

Reports a user for violating community guidelines.

```
POST /v1/users/:user_id/report
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Request Body:**

```json
{
  "reason": "fake_profile",
  "description": "This profile is using stolen photos from Instagram.",
  "evidence_urls": [
    "https://cdn.connecta.app/reports/evidence1.jpg"
  ],
  "message_ids": ["msg_abc123", "msg_def456"]
}
```

| Field | Values |
|---|---|
| `reason` | `fake_profile`, `harassment`, `spam`, `inappropriate_content`, `underage`, `scam`, `impersonation`, `other` |

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "report_id": "rpt_xyz789",
    "status": "pending_review",
    "message": "Thank you for your report. Our team will review it within 24 hours."
  }
}
```

**Curl Example:**

```bash
curl -X POST https://api.connecta.app/v1/users/usr_x9y8z7w6/report \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "fake_profile",
    "description": "This profile is using stolen photos from Instagram."
  }'
```

---

### 5.10 Delete Account

Permanently deletes the authenticated user's account.

```
DELETE /v1/users/me
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Request Body:**

```json
{
  "password": "SecureP@ss123",
  "reason": "no_longer_using",
  "feedback": "Found a partner, thanks Connecta!"
}
```

| Field | Values |
|---|---|
| `reason` | `no_longer_using`, `found_partner`, `privacy_concerns`, `bad_experience`, `other` |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "deletion_scheduled": true,
    "grace_period_days": 30,
    "message": "Your account will be permanently deleted in 30 days. You can cancel within this period."
  }
}
```

**Curl Example:**

```bash
curl -X DELETE https://api.connecta.app/v1/users/me \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "password": "SecureP@ss123",
    "reason": "no_longer_using"
  }'
```

---

## 6. Profile Service

### 6.1 Get Photos

Returns all photos for the authenticated user.

```
GET /v1/profile/photos
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "photos": [
      {
        "id": "photo_abc123",
        "url": "https://cdn.connecta.app/photos/usr_a1b2c3d4e5f6/1.jpg",
        "thumbnail_url": "https://cdn.connecta.app/photos/usr_a1b2c3d4e5f6/1_thumb.jpg",
        "order": 1,
        "is_primary": true,
        "status": "approved",
        "uploaded_at": "2026-07-01T08:00:00Z"
      },
      {
        "id": "photo_def456",
        "url": "https://cdn.connecta.app/photos/usr_a1b2c3d4e5f6/2.jpg",
        "thumbnail_url": "https://cdn.connecta.app/photos/usr_a1b2c3d4e5f6/2_thumb.jpg",
        "order": 2,
        "is_primary": false,
        "status": "approved",
        "uploaded_at": "2026-07-01T08:01:00Z"
      }
    ],
    "total": 2,
    "max_photos": 9
  }
}
```

**Curl Example:**

```bash
curl -X GET https://api.connecta.app/v1/profile/photos \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."
```

---

### 6.2 Upload Photo

Uploads a new profile photo.

```
POST /v1/profile/photos
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Auth Required:** Yes

**Request Body (form-data):**

| Field | Type | Required | Description |
|---|---|---|---|
| `photo` | file | Yes | JPEG, PNG, or WebP, max 10MB |
| `is_primary` | boolean | No | Set as primary photo (default: false) |
| `order` | integer | No | Display order (1-indexed) |

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "photo": {
      "id": "photo_ghi789",
      "url": "https://cdn.connecta.app/photos/usr_a1b2c3d4e5f6/3.jpg",
      "thumbnail_url": "https://cdn.connecta.app/photos/usr_a1b2c3d4e5f6/3_thumb.jpg",
      "order": 3,
      "is_primary": false,
      "status": "pending_review",
      "uploaded_at": "2026-07-19T10:00:00Z"
    }
  }
}
```

**Error Responses:**

| Status | Code | Scenario |
|---|---|---|
| 400 | `PRF_001` | Invalid file type |
| 400 | `PRF_002` | File exceeds 10MB limit |
| 400 | `PRF_003` | Maximum 9 photos allowed |
| 422 | `PRF_004` | Image does not contain a face |

**Curl Example:**

```bash
curl -X POST https://api.connecta.app/v1/profile/photos \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..." \
  -F "photo=@/path/to/photo.jpg" \
  -F "is_primary=true"
```

---

### 6.3 Delete Photo

Removes a photo from the user's profile.

```
DELETE /v1/profile/photos/:photo_id
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "deleted": true,
    "photo_id": "photo_abc123",
    "reordered": true
  }
}
```

**Curl Example:**

```bash
curl -X DELETE https://api.connecta.app/v1/profile/photos/photo_abc123 \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."
```

---

### 6.4 Reorder Photos

Updates the display order of photos.

```
PUT /v1/profile/photos/order
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Request Body:**

```json
{
  "photo_ids": ["photo_def456", "photo_abc123", "photo_ghi789"]
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "reordered": true,
    "photo_ids": ["photo_def456", "photo_abc123", "photo_ghi789"]
  }
}
```

**Curl Example:**

```bash
curl -X PUT https://api.connecta.app/v1/profile/photos/order \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{"photo_ids": ["photo_def456", "photo_abc123", "photo_ghi789"]}'
```

---

### 6.5 Set Primary Photo

Sets a photo as the primary (display) photo.

```
PUT /v1/profile/photos/:photo_id/primary
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "photo_id": "photo_abc123",
    "is_primary": true
  }
}
```

**Curl Example:**

```bash
curl -X PUT https://api.connecta.app/v1/profile/photos/photo_abc123/primary \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."
```

---

### 6.6 Request Verification

Initiates identity verification via selfie comparison.

```
POST /v1/profile/verification/request
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Auth Required:** Yes

**Request Body (form-data):**

| Field | Type | Required | Description |
|---|---|---|---|
| `selfie` | file | Yes | Live selfie photo |
| `method` | string | No | `selfie` (default), `id_document`, `video` |

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "verification_id": "vrf_xyz789",
    "method": "selfie",
    "status": "processing",
    "estimated_completion": "2026-07-19T10:05:00Z"
  }
}
```

**Curl Example:**

```bash
curl -X POST https://api.connecta.app/v1/profile/verification/request \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..." \
  -F "selfie=@/path/to/selfie.jpg" \
  -F "method=selfie"
```

---

### 6.7 Get Verification Status

Returns the current verification status.

```
GET /v1/profile/verification
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "verification_id": "vrf_xyz789",
    "status": "approved",
    "method": "selfie",
    "verified_at": "2026-07-19T10:02:00Z",
    "badge_url": "https://cdn.connecta.app/badges/verified.png",
    "expires_at": "2027-07-19T10:02:00Z"
  }
}
```

| Status | Description |
|---|---|
| `not_requested` | No verification attempt |
| `processing` | Under review |
| `approved` | Verified |
| `rejected` | Verification failed |
| `expired` | Verification expired, needs renewal |

**Curl Example:**

```bash
curl -X GET https://api.connecta.app/v1/profile/verification \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."
```

---

## 7. Matching Service

### 7.1 Get Discovery Feed

Returns a paginated list of profiles to swipe on.

```
GET /v1/matching/feed
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Query Parameters:**

| Parameter | Default | Description |
|---|---|---|
| `page` | `1` | Page number |
| `limit` | `20` | Profiles per page (max 50) |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "profiles": [
      {
        "user_id": "usr_x9y8z7w6",
        "full_name": "Chidinma Okafor",
        "age": 27,
        "gender": "female",
        "bio": "Passionate about art and travel.",
        "job_title": "UX Designer",
        "compatibility_score": 87,
        "distance_km": 5.2,
        "mutual_interests": ["travel", "art", "photography"],
        "photos": [
          {
            "url": "https://cdn.connecta.app/photos/usr_x9y8z7w6/1.jpg",
            "is_primary": true
          }
        ],
        "verified": true,
        "is_online": false
      }
    ],
    "meta": { "page": 1, "limit": 20, "total": 45, "has_more": true }
  }
}
```

**Curl Example:**

```bash
curl -X GET "https://api.connecta.app/v1/matching/feed?page=1&limit=20" \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."
```

---

### 7.2 Like User

Likes a user. If they like you back, a match is created.

```
POST /v1/matching/like/:user_id
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Request Body:**

```json
{
  "like_type": "normal"
}
```

| `like_type` | Description |
|---|---|
| `normal` | Standard like (free, limited daily) |
| `super` | Super-like (premium, notifies the user immediately) |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "liked_user_id": "usr_x9y8z7w6",
    "like_type": "normal",
    "is_mutual": false,
    "remaining_likes": 47
  }
}
```

**If mutual (match created):**

```json
{
  "success": true,
  "data": {
    "liked_user_id": "usr_x9y8z7w6",
    "like_type": "normal",
    "is_mutual": true,
    "match": {
      "match_id": "mtch_abc123",
      "matched_user": {
        "user_id": "usr_x9y8z7w6",
        "full_name": "Chidinma Okafor",
        "photos": []
      },
      "matched_at": "2026-07-19T10:30:00Z",
      "conversation_id": "conv_xyz789"
    }
  }
}
```

**Error Responses:**

| Status | Code | Scenario |
|---|---|---|
| 400 | `MCH_001` | Cannot like yourself |
| 400 | `MCH_002` | Daily like limit reached |
| 409 | `MCH_003` | Already liked this user |
| 404 | `MCH_004` | User not found |

**Curl Example:**

```bash
curl -X POST https://api.connecta.app/v1/matching/like/usr_x9y8z7w6 \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{"like_type": "normal"}'
```

---

### 7.3 Pass User

Passes on a user (no match will be created).

```
POST /v1/matching/pass/:user_id
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "passed_user_id": "usr_x9y8z7w6",
    "passed_at": "2026-07-19T10:30:00Z"
  }
}
```

**Curl Example:**

```bash
curl -X POST https://api.connecta.app/v1/matching/pass/usr_x9y8z7w6 \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."
```

---

### 7.4 Super Like User

Sends a super-like to a user, giving them immediate notification.

```
POST /v1/matching/superlike/:user_id
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "liked_user_id": "usr_x9y8z7w6",
    "like_type": "super",
    "is_mutual": false,
    "remaining_super_likes": 2
  }
}
```

**Error Responses:**

| Status | Code | Scenario |
|---|---|---|
| 400 | `MCH_010` | Super-like limit reached |
| 403 | `MCH_011` | Super-likes require premium subscription |

**Curl Example:**

```bash
curl -X POST https://api.connecta.app/v1/matching/superlike/usr_x9y8z7w6 \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."
```

---

### 7.5 Undo Last Action

Undoes the last swipe action (like, pass, or super-like).

```
POST /v1/matching/undo
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "undone": true,
    "previous_action": "like",
    "restored_user": {
      "user_id": "usr_x9y8z7w6",
      "full_name": "Chidinma Okafor"
    },
    "remaining_undos": 2
  }
}
```

**Error Responses:**

| Status | Code | Scenario |
|---|---|---|
| 400 | `MCH_020` | Nothing to undo |
| 403 | `MCH_021` | Undo requires premium subscription |

**Curl Example:**

```bash
curl -X POST https://api.connecta.app/v1/matching/undo \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."
```

---

### 7.6 Get Matches

Returns all matches for the authenticated user.

```
GET /v1/matching/matches
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Query Parameters:**

| Parameter | Default | Description |
|---|---|---|
| `page` | `1` | Page number |
| `limit` | `20` | Matches per page |
| `sort_by` | `matched_at` | `matched_at`, `last_message_at` |
| `sort_order` | `desc` | `asc`, `desc` |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "matches": [
      {
        "match_id": "mtch_abc123",
        "matched_user": {
          "user_id": "usr_x9y8z7w6",
          "full_name": "Chidinma Okafor",
          "avatar_url": "https://cdn.connecta.app/photos/usr_x9y8z7w6/1.jpg",
          "is_online": true,
          "last_seen_at": "2026-07-19T10:30:00Z"
        },
        "matched_at": "2026-07-19T10:30:00Z",
        "conversation_id": "conv_xyz789",
        "has_unread_messages": true,
        "last_message": {
          "content": "Hey! How are you?",
          "sender_id": "usr_x9y8z7w6",
          "sent_at": "2026-07-19T10:35:00Z"
        }
      }
    ],
    "meta": { "page": 1, "limit": 20, "total": 12, "has_more": false }
  }
}
```

**Curl Example:**

```bash
curl -X GET "https://api.connecta.app/v1/matching/matches?page=1&limit=20" \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."
```

---

### 7.7 Unmatch

Removes a match and archives the associated conversation.

```
DELETE /v1/matching/matches/:match_id
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "unmatched": true,
    "match_id": "mtch_abc123",
    "conversation_archived": true
  }
}
```

**Curl Example:**

```bash
curl -X DELETE https://api.connecta.app/v1/matching/matches/mtch_abc123 \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."
```

---

### 7.8 Liked You

Returns a list of users who have liked the authenticated user.

```
GET /v1/matching/liked-you
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Query Parameters:**

| Parameter | Default | Description |
|---|---|---|
| `page` | `1` | Page number |
| `limit` | `20` | Items per page |

> **Note:** Free users see blurred photos. Premium users see full profiles.

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "likes": [
      {
        "like_id": "like_def789",
        "from_user": {
          "user_id": "usr_m3n4o5p6",
          "full_name": "Amina Bello",
          "avatar_blurred_url": "https://cdn.connecta.app/blurred/usr_m3n4o5p6/1.jpg",
          "avatar_url": "https://cdn.connecta.app/photos/usr_m3n4o5p6/1.jpg",
          "age": 25,
          "verified": true
        },
        "like_type": "normal",
        "liked_at": "2026-07-19T09:00:00Z"
      }
    ],
    "total_likes": 15,
    "meta": { "page": 1, "limit": 20, "total": 15, "has_more": false }
  }
}
```

**Curl Example:**

```bash
curl -X GET "https://api.connecta.app/v1/matching/liked-you?page=1&limit=20" \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."
```

---

### 7.9 Get Compatibility Score

Returns a detailed compatibility breakdown with another user.

```
GET /v1/matching/compatibility/:user_id
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "user_id": "usr_x9y8z7w6",
    "overall_score": 87,
    "breakdown": {
      "interests": 92,
      "values": 85,
      "lifestyle": 80,
      "communication_style": 90,
      "goals": 88
    },
    "shared_interests": ["travel", "art", "photography", "coffee"],
    "compatibility_insights": [
      "You both value long-term relationships",
      "High compatibility in communication styles",
      "Shared love for travel and adventure"
    ]
  }
}
```

**Curl Example:**

```bash
curl -X GET https://api.connecta.app/v1/matching/compatibility/usr_x9y8z7w6 \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."
```

---

## 8. Chat Service

### 8.1 List Conversations

Returns all conversations for the authenticated user.

```
GET /v1/chat/conversations
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Query Parameters:**

| Parameter | Default | Description |
|---|---|---|
| `page` | `1` | Page number |
| `limit` | `20` | Conversations per page |
| `filter` | `all` | `all`, `unread`, `archived` |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "conversation_id": "conv_xyz789",
        "type": "direct",
        "participant": {
          "user_id": "usr_x9y8z7w6",
          "full_name": "Chidinma Okafor",
          "avatar_url": "https://cdn.connecta.app/photos/usr_x9y8z7w6/1.jpg",
          "is_online": true,
          "last_seen_at": "2026-07-19T10:30:00Z"
        },
        "last_message": {
          "message_id": "msg_abc123",
          "content": "Hey! How are you?",
          "sender_id": "usr_x9y8z7w6",
          "type": "text",
          "sent_at": "2026-07-19T10:35:00Z"
        },
        "unread_count": 2,
        "is_archived": false,
        "created_at": "2026-07-19T10:00:00Z"
      }
    ],
    "meta": { "page": 1, "limit": 20, "total": 5, "has_more": false }
  }
}
```

**Curl Example:**

```bash
curl -X GET "https://api.connecta.app/v1/chat/conversations?page=1&limit=20" \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."
```

---

### 8.2 Get Conversation Messages

Returns messages in a specific conversation.

```
GET /v1/chat/conversations/:conversation_id/messages
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Query Parameters:**

| Parameter | Default | Description |
|---|---|---|
| `limit` | `50` | Messages per page (max 100) |
| `before` | - | Cursor: return messages before this message ID |
| `after` | - | Cursor: return messages after this message ID |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "message_id": "msg_abc123",
        "conversation_id": "conv_xyz789",
        "sender_id": "usr_x9y8z7w6",
        "content": "Hey! How are you?",
        "type": "text",
        "status": "delivered",
        "reactions": [
          {
            "emoji": "heart",
            "user_id": "usr_a1b2c3d4e5f6",
            "reacted_at": "2026-07-19T10:36:00Z"
          }
        ],
        "reply_to": null,
        "edited": false,
        "deleted": false,
        "sent_at": "2026-07-19T10:35:00Z",
        "encrypted_content": "base64-encrypted-content"
      },
      {
        "message_id": "msg_def456",
        "conversation_id": "conv_xyz789",
        "sender_id": "usr_a1b2c3d4e5f6",
        "content": "I'm great! Thanks for asking.",
        "type": "text",
        "status": "read",
        "reactions": [],
        "reply_to": "msg_abc123",
        "edited": false,
        "deleted": false,
        "sent_at": "2026-07-19T10:36:00Z",
        "encrypted_content": "base64-encrypted-content"
      }
    ],
    "has_more": false,
    "next_cursor": null,
    "prev_cursor": null
  }
}
```

**Message Types:**

| Type | Description |
|---|---|
| `text` | Plain text message |
| `image` | Photo message |
| `video` | Video message |
| `audio` | Voice message |
| `gif` | GIF message |
| `location` | Shared location |
| `system` | System message (match, unmatch) |

**Curl Example:**

```bash
curl -X GET "https://api.connecta.app/v1/chat/conversations/conv_xyz789/messages?limit=50" \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."
```

---

### 8.3 Send Message

Sends a message in a conversation.

```
POST /v1/chat/conversations/:conversation_id/messages
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Request Body:**

```json
{
  "content": "Hey! What are you up to?",
  "type": "text",
  "encrypted_content": "base64-encrypted-content",
  "reply_to": null,
  "client_message_id": "client-uuid-123"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "message": {
      "message_id": "msg_ghi789",
      "conversation_id": "conv_xyz789",
      "sender_id": "usr_a1b2c3d4e5f6",
      "content": "Hey! What are you up to?",
      "type": "text",
      "status": "sent",
      "client_message_id": "client-uuid-123",
      "sent_at": "2026-07-19T10:40:00Z"
    }
  }
}
```

**Error Responses:**

| Status | Code | Scenario |
|---|---|---|
| 400 | `CHT_001` | Invalid message type |
| 400 | `CHT_002` | Message content is empty |
| 403 | `CHT_003` | Not a participant in this conversation |
| 403 | `CHT_004` | User has blocked you |

**Curl Example:**

```bash
curl -X POST https://api.connecta.app/v1/chat/conversations/conv_xyz789/messages \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hey! What are you up to?",
    "type": "text",
    "client_message_id": "client-uuid-123"
  }'
```

---

### 8.4 React to Message

Adds or removes an emoji reaction to a message.

```
POST /v1/chat/conversations/:conversation_id/messages/:message_id/reactions
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Request Body:**

```json
{
  "emoji": "heart",
  "action": "add"
}
```

| `action` | Description |
|---|---|
| `add` | Add reaction (or toggle if same emoji) |
| `remove` | Remove reaction |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "message_id": "msg_abc123",
    "reactions": [
      {
        "emoji": "heart",
        "user_id": "usr_a1b2c3d4e5f6",
        "reacted_at": "2026-07-19T10:36:00Z"
      }
    ]
  }
}
```

**Curl Example:**

```bash
curl -X POST https://api.connecta.app/v1/chat/conversations/conv_xyz789/messages/msg_abc123/reactions \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{"emoji": "heart", "action": "add"}'
```

---

### 8.5 Mark as Read / Read Receipts

Marks messages in a conversation as read up to a specific message.

```
PUT /v1/chat/conversations/:conversation_id/read
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Request Body:**

```json
{
  "last_read_message_id": "msg_def456"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "conversation_id": "conv_xyz789",
    "last_read_message_id": "msg_def456",
    "read_at": "2026-07-19T10:45:00Z",
    "unread_count": 0
  }
}
```

**Curl Example:**

```bash
curl -X PUT https://api.connecta.app/v1/chat/conversations/conv_xyz789/read \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{"last_read_message_id": "msg_def456"}'
```

---

### 8.6 Typing Indicator

Sends a typing indicator to the conversation.

```
POST /v1/chat/conversations/:conversation_id/typing
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Request Body:**

```json
{
  "is_typing": true
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "conversation_id": "conv_xyz789",
    "is_typing": true,
    "expires_at": "2026-07-19T10:40:08Z"
  }
}
```

> **Note:** Typing indicators auto-expire after 8 seconds. The client should re-send every 5 seconds while typing.

**Curl Example:**

```bash
curl -X POST https://api.connecta.app/v1/chat/conversations/conv_xyz789/typing \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{"is_typing": true}'
```

---

### 8.7 Search Messages

Searches messages within a conversation or across all conversations.

```
GET /v1/chat/messages/search
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Query Parameters:**

| Parameter | Required | Description |
|---|---|---|
| `q` | Yes | Search query |
| `conversation_id` | No | Limit to specific conversation |
| `page` | No | Page number (default: 1) |
| `limit` | No | Results per page (default: 20) |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "message_id": "msg_abc123",
        "conversation_id": "conv_xyz789",
        "sender_id": "usr_x9y8z7w6",
        "content": "Let's meet at the coffee shop tomorrow",
        "highlight": "...meet at the coffee shop tomorrow...",
        "sent_at": "2026-07-19T10:00:00Z",
        "conversation": {
          "participant_name": "Chidinma Okafor"
        }
      }
    ],
    "meta": { "page": 1, "limit": 20, "total": 3, "has_more": false }
  }
}
```

**Curl Example:**

```bash
curl -X GET "https://api.connecta.app/v1/chat/messages/search?q=coffee+shop" \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."
```

---

### 8.8 Delete Message

Deletes a message (soft delete, visible to sender only).

```
DELETE /v1/chat/conversations/:conversation_id/messages/:message_id
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "deleted": true,
    "message_id": "msg_abc123",
    "visible_to_sender": true,
    "visible_to_recipient": false
  }
}
```

**Error Responses:**

| Status | Code | Scenario |
|---|---|---|
| 403 | `CHT_010` | Can only delete your own messages |
| 404 | `CHT_011` | Message not found |

**Curl Example:**

```bash
curl -X DELETE https://api.connecta.app/v1/chat/conversations/conv_xyz789/messages/msg_abc123 \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."
```

---

## 9. Call Service

### 9.1 Start Call

Initiates a voice or video call with a matched user.

```
POST /v1/calls/start
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Request Body:**

```json
{
  "recipient_id": "usr_x9y8z7w6",
  "call_type": "video",
  "ice_servers": true
}
```

| `call_type` | Description |
|---|---|
| `voice` | Audio-only call |
| `video` | Video call |

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "call_id": "call_abc123",
    "call_type": "video",
    "status": "ringing",
    "caller": {
      "user_id": "usr_a1b2c3d4e5f6",
      "full_name": "Adebayo Johnson",
      "avatar_url": "https://cdn.connecta.app/photos/usr_a1b2c3d4e5f6/1.jpg"
    },
    "recipient": {
      "user_id": "usr_x9y8z7w6",
      "full_name": "Chidinma Okafor"
    },
    "ice_servers": {
      "ice_servers": [
        {
          "urls": "stun:turn.connecta.app:3478",
          "username": "user",
          "credential": "pass"
        }
      ]
    },
    "created_at": "2026-07-19T11:00:00Z"
  }
}
```

**Error Responses:**

| Status | Code | Scenario |
|---|---|---|
| 400 | `CAL_001` | Not a match - cannot call non-matched users |
| 400 | `CAL_002` | Invalid call type |
| 409 | `CAL_003` | Already in an active call |
| 404 | `CAL_004` | Recipient not found |

**Curl Example:**

```bash
curl -X POST https://api.connecta.app/v1/calls/start \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "recipient_id": "usr_x9y8z7w6",
    "call_type": "video"
  }'
```

---

### 9.2 Answer Call

Accepts an incoming call.

```
POST /v1/calls/:call_id/answer
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Request Body:**

```json
{
  "sdp_answer": "base64-encoded-sdp-answer"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "call_id": "call_abc123",
    "status": "connected",
    "connected_at": "2026-07-19T11:00:15Z"
  }
}
```

**Curl Example:**

```bash
curl -X POST https://api.connecta.app/v1/calls/call_abc123/answer \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{"sdp_answer": "base64-encoded-sdp-answer"}'
```

---

### 9.3 Reject Call

Declines an incoming call.

```
POST /v1/calls/:call_id/reject
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Request Body:**

```json
{
  "reason": "busy"
}
```

| `reason` | Description |
|---|---|
| `busy` | Currently busy |
| `declined` | User declined |
| `unavailable` | Not available |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "call_id": "call_abc123",
    "status": "rejected",
    "rejected_by": "usr_x9y8z7w6",
    "reason": "busy"
  }
}
```

**Curl Example:**

```bash
curl -X POST https://api.connecta.app/v1/calls/call_abc123/reject \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{"reason": "busy"}'
```

---

### 9.4 End Call

Ends an active call.

```
POST /v1/calls/:call_id/end
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Request Body:**

```json
{
  "reason": "user_ended"
}
```

| `reason` | Description |
|---|---|
| `user_ended` | User hung up |
| `network_error` | Connection lost |
| `timeout` | No answer |
| `server_error` | Server-side failure |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "call_id": "call_abc123",
    "status": "ended",
    "duration_seconds": 245,
    "ended_by": "usr_a1b2c3d4e5f6",
    "ended_at": "2026-07-19T11:04:10Z",
    "summary": {
      "total_duration": "4m 5s",
      "video_duration": "3m 30s",
      "audio_only_duration": "35s",
      "quality_score": 8.5
    }
  }
}
```

**Curl Example:**

```bash
curl -X POST https://api.connecta.app/v1/calls/call_abc123/end \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{"reason": "user_ended"}'
```

---

### 9.5 Call History

Returns the call history for the authenticated user.

```
GET /v1/calls/history
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Query Parameters:**

| Parameter | Default | Description |
|---|---|---|
| `page` | `1` | Page number |
| `limit` | `20` | Calls per page |
| `call_type` | - | Filter: `voice`, `video` |
| `direction` | - | Filter: `incoming`, `outgoing` |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "calls": [
      {
        "call_id": "call_abc123",
        "call_type": "video",
        "direction": "outgoing",
        "other_user": {
          "user_id": "usr_x9y8z7w6",
          "full_name": "Chidinma Okafor",
          "avatar_url": "https://cdn.connecta.app/photos/usr_x9y8z7w6/1.jpg"
        },
        "status": "ended",
        "duration_seconds": 245,
        "started_at": "2026-07-19T11:00:00Z",
        "ended_at": "2026-07-19T11:04:10Z"
      },
      {
        "call_id": "call_def456",
        "call_type": "voice",
        "direction": "incoming",
        "other_user": {
          "user_id": "usr_m3n4o5p6",
          "full_name": "Amina Bello"
        },
        "status": "missed",
        "duration_seconds": 0,
        "started_at": "2026-07-18T15:00:00Z",
        "ended_at": null
      }
    ],
    "meta": { "page": 1, "limit": 20, "total": 8, "has_more": false }
  }
}
```

**Curl Example:**

```bash
curl -X GET "https://api.connecta.app/v1/calls/history?call_type=video&direction=outgoing" \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."
```

---

## 10. Media Service

### 10.1 Upload Media

Uploads a media file (photo, video, document) to cloud storage.

```
POST /v1/media/upload
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Auth Required:** Yes

**Request Body (form-data):**

| Field | Type | Required | Description |
|---|---|---|---|
| `file` | file | Yes | Max 50MB |
| `purpose` | string | Yes | `avatar`, `photo`, `message_image`, `message_video`, `message_audio`, `report_evidence` |

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "media": {
      "id": "med_abc123",
      "url": "https://cdn.connecta.app/media/usr_a1b2c3d4e5f6/photo_1.jpg",
      "thumbnail_url": "https://cdn.connecta.app/media/usr_a1b2c3d4e5f6/photo_1_thumb.jpg",
      "type": "image/jpeg",
      "size_bytes": 2048576,
      "purpose": "message_image",
      "uploaded_at": "2026-07-19T10:00:00Z"
    }
  }
}
```

**Error Responses:**

| Status | Code | Scenario |
|---|---|---|
| 400 | `MED_001` | File type not allowed |
| 400 | `MED_002` | File exceeds size limit |
| 422 | `MED_003` | Invalid file format |

**Curl Example:**

```bash
curl -X POST https://api.connecta.app/v1/media/upload \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..." \
  -F "file=@/path/to/image.jpg" \
  -F "purpose=message_image"
```

---

### 10.2 Get Presigned Upload URL

Returns a presigned URL for direct client-side upload to S3/R2.

```
POST /v1/media/presigned-url
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Request Body:**

```json
{
  "file_name": "photo.jpg",
  "file_type": "image/jpeg",
  "file_size": 2048576,
  "purpose": "photo"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "upload_url": "https://connecta-uploads.s3.amazonaws.com/usr_a1b2c3d4e5f6/photo_1.jpg?X-Amz-Algorithm=...",
    "media_id": "med_def456",
    "expires_in": 300,
    "headers": {
      "Content-Type": "image/jpeg",
      "x-amz-meta-purpose": "photo"
    },
    "cdn_url": "https://cdn.connecta.app/media/usr_a1b2c3d4e5f6/photo_1.jpg"
  }
}
```

**Curl Example:**

```bash
curl -X POST https://api.connecta.app/v1/media/presigned-url \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "file_name": "photo.jpg",
    "file_type": "image/jpeg",
    "file_size": 2048576,
    "purpose": "photo"
  }'
```

---

## 11. Payment Service

### 11.1 Get Subscription Plans

Returns available subscription plans.

```
GET /v1/payments/plans
```

**Auth Required:** No

**Query Parameters:**

| Parameter | Description |
|---|---|
| `country` | ISO country code for localized pricing |
| `currency` | ISO currency code |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "plan_id": "plan_free",
        "name": "Free",
        "price": 0,
        "currency": "NGN",
        "interval": "month",
        "features": [
          "Limited daily likes",
          "Basic filters",
          "Text messaging"
        ],
        "limits": {
          "daily_likes": 50,
          "super_likes_per_day": 0,
          "rewinds_per_day": 0,
          "see_who_liked_you": false,
          "unlimited_swipes": false
        }
      },
      {
        "plan_id": "plan_plus_monthly",
        "name": "Connecta Plus",
        "price": 4999,
        "currency": "NGN",
        "interval": "month",
        "trial_days": 7,
        "features": [
          "Unlimited likes",
          "Advanced filters",
          "See who liked you",
          "5 super-likes per day",
          "3 rewinds per day",
          "Priority in feed"
        ],
        "limits": {
          "daily_likes": -1,
          "super_likes_per_day": 5,
          "rewinds_per_day": 3,
          "see_who_liked_you": true,
          "unlimited_swipes": true
        },
        "popular": true
      },
      {
        "plan_id": "plan_plus_yearly",
        "name": "Connecta Plus (Annual)",
        "price": 39999,
        "currency": "NGN",
        "interval": "year",
        "savings_percent": 33,
        "trial_days": 7,
        "features": [
          "Everything in Plus",
          "Monthly boost",
          "Profile insights"
        ]
      },
      {
        "plan_id": "plan_premium_monthly",
        "name": "Connecta Premium",
        "price": 9999,
        "currency": "NGN",
        "interval": "month",
        "features": [
          "Everything in Plus",
          "10 super-likes per day",
          "5 rewinds per day",
          "See profile visitors",
          "Travel mode",
          "Incognito mode"
        ]
      }
    ]
  }
}
```

**Curl Example:**

```bash
curl -X GET "https://api.connecta.app/v1/payments/plans?country=NG"
```

---

### 11.2 Subscribe to Plan

Creates a new subscription.

```
POST /v1/payments/subscribe
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Request Body:**

```json
{
  "plan_id": "plan_plus_monthly",
  "payment_method": "card",
  "payment_token": "tok_visa_4242"
}
```

| `payment_method` | Description |
|---|---|
| `card` | Credit/debit card (via Paystack/Flutterwave) |
| `bank_transfer` | Bank transfer |
| `mobile_money` | Mobile money (MTN, Airtel) |
| `ussd` | USSD payment |

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "subscription": {
      "subscription_id": "sub_abc123",
      "plan_id": "plan_plus_monthly",
      "plan_name": "Connecta Plus",
      "status": "active",
      "price": 4999,
      "currency": "NGN",
      "interval": "month",
      "current_period_start": "2026-07-19T10:00:00Z",
      "current_period_end": "2026-08-19T10:00:00Z",
      "trial_end": null,
      "cancel_at_period_end": false,
      "payment": {
        "transaction_id": "txn_xyz789",
        "status": "successful",
        "payment_method": "card",
        "card_last4": "4242"
      }
    }
  }
}
```

**Error Responses:**

| Status | Code | Scenario |
|---|---|---|
| 400 | `PAY_001` | Invalid plan ID |
| 400 | `PAY_002` | Invalid payment token |
| 402 | `PAY_003` | Payment declined |
| 409 | `PAY_004` | Already subscribed to this plan |

**Curl Example:**

```bash
curl -X POST https://api.connecta.app/v1/payments/subscribe \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "plan_id": "plan_plus_monthly",
    "payment_method": "card",
    "payment_token": "tok_visa_4242"
  }'
```

---

### 11.3 Cancel Subscription

Cancels the current subscription (active until period end).

```
POST /v1/payments/subscribe/cancel
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Request Body:**

```json
{
  "reason": "too_expensive",
  "feedback": "Would consider a cheaper plan."
}
```

| `reason` | Description |
|---|---|
| `too_expensive` | Cost concern |
| `not_using` | Not using features |
| `bad_experience` | Poor experience |
| `found_partner` | Found someone |
| `other` | Other reason |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "subscription_id": "sub_abc123",
    "status": "active_until_period_end",
    "current_period_end": "2026-08-19T10:00:00Z",
    "refund_eligible": false,
    "access_until": "2026-08-19T10:00:00Z"
  }
}
```

**Curl Example:**

```bash
curl -X POST https://api.connecta.app/v1/payments/subscribe/cancel \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{"reason": "too_expensive"}'
```

---

### 11.4 Upgrade/Downgrade Plan

Changes the current subscription plan.

```
PUT /v1/payments/subscribe/upgrade
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Request Body:**

```json
{
  "new_plan_id": "plan_premium_monthly",
  "prorate": true
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "subscription": {
      "subscription_id": "sub_abc123",
      "previous_plan": "plan_plus_monthly",
      "new_plan": "plan_premium_monthly",
      "status": "active",
      "effective_date": "2026-07-19T10:00:00Z",
      "proration_credit": 3500,
      "new_price": 9999,
      "payment": {
        "transaction_id": "txn_new123",
        "amount_charged": 6499,
        "status": "successful"
      }
    }
  }
}
```

**Curl Example:**

```bash
curl -X PUT https://api.connecta.app/v1/payments/subscribe/upgrade \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "new_plan_id": "plan_premium_monthly",
    "prorate": true
  }'
```

---

### 11.5 Initialize Payment

Initializes a payment transaction for one-time purchases (boosts, super-likes).

```
POST /v1/payments/initialize
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Request Body:**

```json
{
  "amount": 999,
  "currency": "NGN",
  "description": "10 Super Likes",
  "metadata": {
    "product": "super_likes_pack",
    "quantity": 10
  }
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "transaction_id": "txn_init123",
    "amount": 999,
    "currency": "NGN",
    "status": "pending",
    "payment_url": "https://checkout.paystack.com/pay/txn_init123",
    "reference": "CKA-TXN-INIT123",
    "expires_at": "2026-07-19T10:30:00Z"
  }
}
```

**Curl Example:**

```bash
curl -X POST https://api.connecta.app/v1/payments/initialize \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 999,
    "currency": "NGN",
    "description": "10 Super Likes",
    "metadata": {"product": "super_likes_pack", "quantity": 10}
  }'
```

---

### 11.6 Verify Payment

Verifies a payment transaction after redirect.

```
POST /v1/payments/verify
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Request Body:**

```json
{
  "reference": "CKA-TXN-INIT123"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "transaction_id": "txn_init123",
    "reference": "CKA-TXN-INIT123",
    "status": "successful",
    "amount": 999,
    "currency": "NGN",
    "product": "super_likes_pack",
    "quantity": 10,
    "verified_at": "2026-07-19T10:05:00Z"
  }
}
```

**Error Responses:**

| Status | Code | Scenario |
|---|---|---|
| 400 | `PAY_010` | Invalid reference |
| 400 | `PAY_011` | Payment not completed |
| 400 | `PAY_012` | Payment already verified |

**Curl Example:**

```bash
curl -X POST https://api.connecta.app/v1/payments/verify \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{"reference": "CKA-TXN-INIT123"}'
```

---

### 11.7 Payment History

Returns the payment history for the authenticated user.

```
GET /v1/payments/history
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Query Parameters:**

| Parameter | Default | Description |
|---|---|---|
| `page` | `1` | Page number |
| `limit` | `20` | Items per page |
| `type` | - | Filter: `subscription`, `one_time`, `refund` |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "transaction_id": "txn_xyz789",
        "type": "subscription",
        "description": "Connecta Plus - Monthly",
        "amount": 4999,
        "currency": "NGN",
        "status": "successful",
        "payment_method": "card",
        "card_last4": "4242",
        "created_at": "2026-07-19T10:00:00Z",
        "receipt_url": "https://cdn.connecta.app/receipts/txn_xyz789.pdf"
      },
      {
        "transaction_id": "txn_init123",
        "type": "one_time",
        "description": "10 Super Likes",
        "amount": 999,
        "currency": "NGN",
        "status": "successful",
        "payment_method": "card",
        "card_last4": "4242",
        "created_at": "2026-07-15T14:00:00Z"
      }
    ],
    "meta": { "page": 1, "limit": 20, "total": 2, "has_more": false }
  }
}
```

**Curl Example:**

```bash
curl -X GET "https://api.connecta.app/v1/payments/history?page=1&limit=20" \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."
```

---

### 11.8 Request Refund

Requests a refund for a recent transaction.

```
POST /v1/payments/refund/:transaction_id
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Request Body:**

```json
{
  "reason": "accidental_purchase",
  "description": "Purchased by mistake."
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "refund_id": "ref_abc123",
    "transaction_id": "txn_xyz789",
    "status": "pending_review",
    "estimated_resolution": "2026-07-26T10:00:00Z",
    "message": "Your refund request has been submitted. You'll receive an update within 7 business days."
  }
}
```

**Error Responses:**

| Status | Code | Scenario |
|---|---|---|
| 400 | `PAY_020` | Refund window expired (30 days) |
| 400 | `PAY_021` | Already requested refund for this transaction |
| 404 | `PAY_022` | Transaction not found |

**Curl Example:**

```bash
curl -X POST https://api.connecta.app/v1/payments/refund/txn_xyz789 \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "accidental_purchase",
    "description": "Purchased by mistake."
  }'
```

---

## 12. Notification Service

### 12.1 List Notifications

Returns all notifications for the authenticated user.

```
GET /v1/notifications
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Query Parameters:**

| Parameter | Default | Description |
|---|---|---|
| `page` | `1` | Page number |
| `limit` | `20` | Notifications per page |
| `filter` | `all` | `all`, `unread`, `read` |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "ntf_abc123",
        "type": "new_match",
        "title": "New Match!",
        "body": "You and Chidinma Okafor liked each other!",
        "data": {
          "match_id": "mtch_xyz789",
          "user_id": "usr_x9y8z7w6"
        },
        "image_url": "https://cdn.connecta.app/photos/usr_x9y8z7w6/1.jpg",
        "read": false,
        "action_url": "connecta://match/mtch_xyz789",
        "created_at": "2026-07-19T10:30:00Z"
      },
      {
        "id": "ntf_def456",
        "type": "new_message",
        "title": "New message from Chidinma",
        "body": "Hey! How are you?",
        "data": {
          "conversation_id": "conv_xyz789",
          "sender_id": "usr_x9y8z7w6"
        },
        "read": false,
        "action_url": "connecta://chat/conv_xyz789",
        "created_at": "2026-07-19T10:35:00Z"
      }
    ],
    "unread_count": 5,
    "meta": { "page": 1, "limit": 20, "total": 42, "has_more": true }
  }
}
```

**Notification Types:**

| Type | Description |
|---|---|
| `new_match` | Mutual like (new match) |
| `new_message` | New chat message |
| `super_like_received` | Someone super-liked you |
| `like_received` | Someone liked you |
| `profile_view` | Someone viewed your profile |
| `call_missed` | Missed voice/video call |
| `call_incoming` | Incoming call |
| `verification_approved` | Profile verified |
| `verification_rejected` | Verification failed |
| `subscription_expiring` | Subscription about to expire |
| `subscription_expired` | Subscription expired |
| `payment_success` | Payment successful |
| `payment_failed` | Payment failed |
| `security_alert` | New login detected |
| `report_resolved` | Report action taken |
| `weekly_digest` | Weekly activity summary |
| `boost_activated` | Profile boost activated |

**Curl Example:**

```bash
curl -X GET "https://api.connecta.app/v1/notifications?filter=unread" \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."
```

---

### 12.2 Get Notification Preferences

Returns the user's notification preferences.

```
GET /v1/notifications/preferences
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "preferences": {
      "push_enabled": true,
      "email_enabled": true,
      "sms_enabled": false,
      "channels": {
        "new_match": { "push": true, "email": false, "sms": false },
        "new_message": { "push": true, "email": false, "sms": false },
        "super_like_received": { "push": true, "email": true, "sms": false },
        "like_received": { "push": true, "email": false, "sms": false },
        "call_incoming": { "push": true, "email": false, "sms": false },
        "subscription_expiring": { "push": true, "email": true, "sms": true },
        "security_alert": { "push": true, "email": true, "sms": true },
        "weekly_digest": { "push": false, "email": true, "sms": false }
      },
      "quiet_hours": {
        "enabled": true,
        "start": "22:00",
        "end": "07:00",
        "timezone": "Africa/Lagos"
      }
    }
  }
}
```

**Curl Example:**

```bash
curl -X GET https://api.connecta.app/v1/notifications/preferences \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."
```

---

### 12.3 Update Notification Preferences

Updates the user's notification preferences.

```
PUT /v1/notifications/preferences
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Request Body:**

```json
{
  "push_enabled": true,
  "email_enabled": true,
  "channels": {
    "new_match": { "push": true, "email": false },
    "new_message": { "push": true, "email": false },
    "weekly_digest": { "push": false, "email": true }
  },
  "quiet_hours": {
    "enabled": true,
    "start": "22:00",
    "end": "07:00",
    "timezone": "Africa/Lagos"
  }
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "preferences": { },
    "updated_at": "2026-07-19T10:00:00Z"
  }
}
```

**Curl Example:**

```bash
curl -X PUT https://api.connecta.app/v1/notifications/preferences \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "push_enabled": true,
    "email_enabled": false,
    "channels": {
      "new_match": {"push": true, "email": false},
      "new_message": {"push": true, "email": false}
    }
  }'
```

---

### 12.4 Mark Notifications as Read

Marks one or all notifications as read.

```
PUT /v1/notifications/read
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Request Body:**

```json
{
  "notification_ids": ["ntf_abc123", "ntf_def456"]
}
```

Or to mark all as read:

```json
{
  "mark_all": true
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "marked_read": 2,
    "unread_count": 3
  }
}
```

**Curl Example:**

```bash
curl -X PUT https://api.connecta.app/v1/notifications/read \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{"mark_all": true}'
```

---

### 12.5 Send Broadcast (Admin)

Sends a broadcast notification to all users or a segment.

```
POST /v1/notifications/broadcast
Authorization: Bearer <admin_access_token>
```

**Auth Required:** Yes (Admin)

**Request Body:**

```json
{
  "title": "New Feature: Video Calls!",
  "body": "Connecta now supports video calls. Try it today!",
  "image_url": "https://cdn.connecta.app/broadcasts/video_calls.jpg",
  "action_url": "connecta://features/video_calls",
  "target": {
    "type": "all"
  },
  "schedule_at": null
}
```

| Target Types | Description |
|---|---|
| `{ "type": "all" }` | All users |
| `{ "type": "segment", "value": "premium" }` | Premium subscribers |
| `{ "type": "segment", "value": "inactive_7d" }` | Inactive 7+ days |
| `{ "type": "user_ids", "value": ["usr_abc", "usr_def"] }` | Specific users |

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "broadcast_id": "bcast_abc123",
    "status": "scheduled",
    "target_type": "all",
    "estimated_recipients": 125000,
    "scheduled_at": "2026-07-19T12:00:00Z"
  }
}
```

**Curl Example:**

```bash
curl -X POST https://api.connecta.app/v1/notifications/broadcast \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Feature: Video Calls!",
    "body": "Connecta now supports video calls.",
    "target": {"type": "all"}
  }'
```

---

## 13. Search Service

### 13.1 Search Users

Searches for users based on filters.

```
GET /v1/search/users
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Query Parameters:**

| Parameter | Required | Description |
|---|---|---|
| `q` | No | Free-text search (name, bio) |
| `age_min` | No | Minimum age |
| `age_max` | No | Maximum age |
| `gender` | No | `male`, `female`, `non_binary`, `other` |
| `distance_km` | No | Maximum distance in km |
| `verified` | No | Filter verified profiles only |
| `has_bio` | No | Filter profiles with bio |
| `looking_for` | No | `men`, `women`, `everyone` |
| `relationship_goal` | No | `casual`, `short_term`, `long_term`, `marriage` |
| `page` | No | Page number (default: 1) |
| `limit` | No | Results per page (default: 20) |
| `sort_by` | No | `compatibility`, `distance`, `recent`, `popular` |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "user_id": "usr_x9y8z7w6",
        "full_name": "Chidinma Okafor",
        "age": 27,
        "gender": "female",
        "bio": "Passionate about art and travel.",
        "job_title": "UX Designer",
        "compatibility_score": 87,
        "distance_km": 5.2,
        "verified": true,
        "is_online": false,
        "photos": [
          {
            "url": "https://cdn.connecta.app/photos/usr_x9y8z7w6/1.jpg",
            "is_primary": true
          }
        ],
        "mutual_interests": ["travel", "art"]
      }
    ],
    "meta": { "page": 1, "limit": 20, "total": 35, "has_more": true }
  }
}
```

**Curl Example:**

```bash
curl -X GET "https://api.connecta.app/v1/search/users?q=designer&age_min=22&age_max=30&verified=true" \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."
```

---

### 13.2 Autocomplete

Returns autocomplete suggestions for user search.

```
GET /v1/search/autocomplete
Authorization: Bearer <access_token>
```

**Auth Required:** Yes

**Query Parameters:**

| Parameter | Required | Description |
|---|---|---|
| `q` | Yes | Search prefix (min 2 chars) |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "text": "Chioma",
        "type": "name",
        "user_id": "usr_p1q2r3s4",
        "avatar_url": "https://cdn.connecta.app/photos/usr_p1q2r3s4/1.jpg"
      },
      {
        "text": "Chidinma",
        "type": "name",
        "user_id": "usr_x9y8z7w6",
        "avatar_url": "https://cdn.connecta.app/photos/usr_x9y8z7w6/1.jpg"
      }
    ]
  }
}
```

**Curl Example:**

```bash
curl -X GET "https://api.connecta.app/v1/search/autocomplete?q=Chi" \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."
```

---

## 14. Admin Service

### 14.1 Admin Login

Authenticates an admin user.

```
POST /v1/admin/login
```

**Auth Required:** No

**Request Body:**

```json
{
  "email": "admin@connecta.app",
  "password": "AdminSecureP@ss1"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "admin": {
      "id": "adm_abc123",
      "email": "admin@connecta.app",
      "full_name": "System Admin",
      "role": "super_admin",
      "permissions": ["*"]
    },
    "tokens": {
      "access_token": "eyJhbGciOiJSUzI1NiIs...",
      "refresh_token": "art_admin...",
      "expires_in": 900
    },
    "requires_2fa": true
  }
}
```

**If 2FA is required:**

```json
{
  "success": true,
  "data": {
    "requires_2fa": true,
    "temp_token": "tmp_admin...",
    "methods": ["totp"]
  }
}
```

**Curl Example:**

```bash
curl -X POST https://api.connecta.app/v1/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@connecta.app",
    "password": "AdminSecureP@ss1"
  }'
```

---

### 14.2 Admin Verify 2FA

Completes admin 2FA verification.

```
POST /v1/admin/2fa/verify
```

**Auth Required:** No (uses temp_token)

**Request Body:**

```json
{
  "temp_token": "tmp_admin...",
  "code": "482917"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "admin": {
      "id": "adm_abc123",
      "email": "admin@connecta.app",
      "full_name": "System Admin",
      "role": "super_admin",
      "permissions": ["*"],
      "mfa_verified": true
    },
    "tokens": {
      "access_token": "eyJhbGciOiJSUzI1NiIs...",
      "refresh_token": "art_admin...",
      "expires_in": 900
    }
  }
}
```

**Error Responses:**

| Status | Code | Scenario |
|---|---|---|
| 400 | `ADM_001` | Invalid 2FA code |
| 400 | `ADM_002` | Temp token expired |

**Curl Example:**

```bash
curl -X POST https://api.connecta.app/v1/admin/2fa/verify \
  -H "Content-Type: application/json" \
  -d '{
    "temp_token": "tmp_admin...",
    "code": "482917"
  }'
```

---

### 14.3 Dashboard Stats

Returns high-level platform statistics.

```
GET /v1/admin/dashboard
Authorization: Bearer <admin_access_token>
```

**Auth Required:** Yes (Admin - `dashboard.read`)

**Query Parameters:**

| Parameter | Default | Description |
|---|---|---|
| `period` | `7d` | `24h`, `7d`, `30d`, `90d` |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "period": "7d",
    "generated_at": "2026-07-19T10:00:00Z",
    "users": {
      "total": 125840,
      "new_registrations": 1250,
      "daily_active": 45200,
      "weekly_active": 78500,
      "monthly_active": 105000
    },
    "matching": {
      "total_matches": 340000,
      "new_matches_7d": 12500,
      "match_rate": "35%",
      "avg_compatibility_score": 78
    },
    "messaging": {
      "total_messages": 8500000,
      "messages_7d": 1250000,
      "avg_messages_per_match": 42,
      "response_rate": "68%"
    },
    "calls": {
      "total_calls": 180000,
      "calls_7d": 15000,
      "avg_duration_seconds": 245,
      "video_call_ratio": "45%"
    },
    "revenue": {
      "total_revenue_ngn": 45000000,
      "revenue_7d_ngn": 850000,
      "active_subscriptions": 32000,
      "conversion_rate": "25.4%"
    },
    "safety": {
      "reports_7d": 320,
      "accounts_suspended_7d": 85,
      "fake_profiles_detected_7d": 450,
      "avg_response_time_hours": 4.5
    }
  }
}
```

**Curl Example:**

```bash
curl -X GET "https://api.connecta.app/v1/admin/dashboard?period=7d" \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."
```

---

### 14.4 List Users (Admin)

Returns a paginated list of all users.

```
GET /v1/admin/users
Authorization: Bearer <admin_access_token>
```

**Auth Required:** Yes (Admin - `users.read`)

**Query Parameters:**

| Parameter | Default | Description |
|---|---|---|
| `page` | `1` | Page number |
| `limit` | `20` | Users per page (max 100) |
| `search` | - | Search by name, email, phone |
| `status` | - | `active`, `suspended`, `banned`, `pending` |
| `verified` | - | `true`, `false` |
| `sort_by` | `created_at` | `created_at`, `last_active_at`, `name` |
| `sort_order` | `desc` | `asc`, `desc` |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "usr_a1b2c3d4e5f6",
        "email": "user@example.com",
        "full_name": "Adebayo Johnson",
        "phone": "+2348012345678",
        "status": "active",
        "verified": true,
        "profile_completed": true,
        "subscription": {
          "plan": "Connecta Plus",
          "status": "active",
          "expires_at": "2026-08-19T10:00:00Z"
        },
        "safety_score": 95,
        "reports_received": 0,
        "reports_filed": 2,
        "last_active_at": "2026-07-19T10:30:00Z",
        "created_at": "2026-06-01T08:00:00Z"
      }
    ],
    "meta": { "page": 1, "limit": 20, "total": 125840, "has_more": true }
  }
}
```

**Curl Example:**

```bash
curl -X GET "https://api.connecta.app/v1/admin/users?status=active&verified=true" \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."
```

---

### 14.5 Get User Detail (Admin)

Returns full details of a specific user.

```
GET /v1/admin/users/:user_id
Authorization: Bearer <admin_access_token>
```

**Auth Required:** Yes (Admin - `users.read`)

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_a1b2c3d4e5f6",
      "email": "user@example.com",
      "phone": "+2348012345678",
      "full_name": "Adebayo Johnson",
      "date_of_birth": "1995-06-15",
      "gender": "male",
      "status": "active",
      "email_verified": true,
      "phone_verified": true,
      "profile_completed": true,
      "verified": true,
      "safety_score": 95,
      "location": {
        "city": "Lagos",
        "country": "Nigeria"
      },
      "subscription": {},
      "stats": {
        "matches": 24,
        "messages_sent": 580,
        "calls_made": 12,
        "reports_received": 0,
        "reports_filed": 2
      },
      "devices": [],
      "last_active_at": "2026-07-19T10:30:00Z",
      "created_at": "2026-06-01T08:00:00Z"
    }
  }
}
```

**Curl Example:**

```bash
curl -X GET https://api.connecta.app/v1/admin/users/usr_a1b2c3d4e5f6 \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."
```

---

### 14.6 Suspend User (Admin)

Suspends a user account.

```
POST /v1/admin/users/:user_id/suspend
Authorization: Bearer <admin_access_token>
```

**Auth Required:** Yes (Admin - `users.write`)

**Request Body:**

```json
{
  "reason": "harassment_violation",
  "description": "Multiple reports of harassment in chat.",
  "duration_days": 30,
  "notify_user": true
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "user_id": "usr_a1b2c3d4e5f6",
    "status": "suspended",
    "suspended_until": "2026-08-19T10:00:00Z",
    "sessions_revoked": 3,
    "notification_sent": true
  }
}
```

**Curl Example:**

```bash
curl -X POST https://api.connecta.app/v1/admin/users/usr_a1b2c3d4e5f6/suspend \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "harassment_violation",
    "description": "Multiple reports of harassment.",
    "duration_days": 30
  }'
```

---

### 14.7 Ban User (Admin)

Permanently bans a user.

```
POST /v1/admin/users/:user_id/ban
Authorization: Bearer <admin_access_token>
```

**Auth Required:** Yes (Admin - `users.write`)

**Request Body:**

```json
{
  "reason": "scam_operation",
  "description": "Operating romance scam accounts.",
  "ban_ip": true,
  "ban_device": true,
  "notify_user": true
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "user_id": "usr_a1b2c3d4e5f6",
    "status": "banned",
    "banned_at": "2026-07-19T10:00:00Z",
    "sessions_revoked": 3,
    "devices_banned": 2,
    "ip_banned": true,
    "notification_sent": true
  }
}
```

**Curl Example:**

```bash
curl -X POST https://api.connecta.app/v1/admin/users/usr_a1b2c3d4e5f6/ban \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "scam_operation",
    "description": "Operating romance scam accounts.",
    "ban_ip": true,
    "ban_device": true
  }'
```

---

### 14.8 Unsuspend User (Admin)

Removes a suspension from a user.

```
POST /v1/admin/users/:user_id/unsuspend
Authorization: Bearer <admin_access_token>
```

**Auth Required:** Yes (Admin - `users.write`)

**Request Body:**

```json
{
  "reason": "overturn_after_review"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "user_id": "usr_a1b2c3d4e5f6",
    "status": "active",
    "unsuspended_at": "2026-07-19T10:00:00Z"
  }
}
```

**Curl Example:**

```bash
curl -X POST https://api.connecta.app/v1/admin/users/usr_a1b2c3d4e5f6/unsuspend \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{"reason": "overturn_after_review"}'
```

---

### 14.9 List Reports (Admin)

Returns all user reports.

```
GET /v1/admin/reports
Authorization: Bearer <admin_access_token>
```

**Auth Required:** Yes (Admin - `reports.read`)

**Query Parameters:**

| Parameter | Default | Description |
|---|---|---|
| `page` | `1` | Page number |
| `limit` | `20` | Reports per page |
| `status` | - | `pending_review`, `investigating`, `resolved`, `dismissed` |
| `reason` | - | Filter by report reason |
| `priority` | - | `low`, `medium`, `high`, `urgent` |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "report_id": "rpt_xyz789",
        "reporter": {
          "user_id": "usr_a1b2c3d4e5f6",
          "full_name": "Adebayo Johnson"
        },
        "reported_user": {
          "user_id": "usr_x9y8z7w6",
          "full_name": "Chidinma Okafor",
          "status": "active"
        },
        "reason": "fake_profile",
        "description": "This profile is using stolen photos from Instagram.",
        "evidence_urls": [
          "https://cdn.connecta.app/reports/evidence1.jpg"
        ],
        "message_ids": ["msg_abc123"],
        "status": "pending_review",
        "priority": "high",
        "ai_risk_score": 85,
        "created_at": "2026-07-19T08:00:00Z"
      }
    ],
    "stats": {
      "pending": 32,
      "investigating": 15,
      "resolved_today": 8,
      "avg_response_hours": 4.5
    },
    "meta": { "page": 1, "limit": 20, "total": 320, "has_more": true }
  }
}
```

**Curl Example:**

```bash
curl -X GET "https://api.connecta.app/v1/admin/reports?status=pending_review&priority=high" \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."
```

---

### 14.10 Resolve Report (Admin)

Takes action on a report.

```
POST /v1/admin/reports/:report_id/resolve
Authorization: Bearer <admin_access_token>
```

**Auth Required:** Yes (Admin - `reports.write`)

**Request Body:**

```json
{
  "action": "suspend_user",
  "suspension_duration_days": 30,
  "note": "Confirmed fake profile with stolen photos.",
  "notify_reporter": true,
  "notify_reported_user": true
}
```

| `action` | Description |
|---|---|
| `dismiss` | No violation found |
| `warn_user` | Send warning to reported user |
| `suspend_user` | Temporarily suspend reported user |
| `ban_user` | Permanently ban reported user |
| `remove_content` | Remove specific content |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "report_id": "rpt_xyz789",
    "status": "resolved",
    "action_taken": "suspend_user",
    "resolved_by": "adm_abc123",
    "resolved_at": "2026-07-19T10:00:00Z",
    "notifications_sent": ["reporter", "reported"]
  }
}
```

**Curl Example:**

```bash
curl -X POST https://api.connecta.app/v1/admin/reports/rpt_xyz789/resolve \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "action": "suspend_user",
    "suspension_duration_days": 30,
    "note": "Confirmed fake profile.",
    "notify_reporter": true
  }'
```

---

### 14.11 Analytics (Admin)

Returns detailed platform analytics.

```
GET /v1/admin/analytics
Authorization: Bearer <admin_access_token>
```

**Auth Required:** Yes (Admin - `analytics.read`)

**Query Parameters:**

| Parameter | Default | Description |
|---|---|---|
| `metric` | - | `registrations`, `matches`, `messages`, `calls`, `revenue`, `retention` |
| `period` | `30d` | `24h`, `7d`, `30d`, `90d`, `1y` |
| `granularity` | `day` | `hour`, `day`, `week`, `month` |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "metric": "registrations",
    "period": "30d",
    "granularity": "day",
    "data_points": [
      { "date": "2026-07-01", "value": 420 },
      { "date": "2026-07-02", "value": 385 },
      { "date": "2026-07-03", "value": 410 }
    ],
    "summary": {
      "total": 12500,
      "average": 417,
      "peak": { "date": "2026-07-15", "value": 620 },
      "growth_rate": "12.5%"
    }
  }
}
```

**Curl Example:**

```bash
curl -X GET "https://api.connecta.app/v1/admin/analytics?metric=registrations&period=30d&granularity=day" \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."
```

---

### 14.12 Audit Log (Admin)

Returns admin action audit log.

```
GET /v1/admin/audit-log
Authorization: Bearer <admin_access_token>
```

**Auth Required:** Yes (Admin - `audit_log.read`)

**Query Parameters:**

| Parameter | Default | Description |
|---|---|---|
| `page` | `1` | Page number |
| `limit` | `50` | Entries per page |
| `admin_id` | - | Filter by admin |
| `action` | - | Filter by action type |
| `start_date` | - | ISO date |
| `end_date` | - | ISO date |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "audit_entries": [
      {
        "entry_id": "audit_abc123",
        "admin": {
          "id": "adm_abc123",
          "email": "admin@connecta.app",
          "role": "super_admin"
        },
        "action": "user_suspend",
        "resource_type": "user",
        "resource_id": "usr_a1b2c3d4e5f6",
        "details": {
          "reason": "harassment_violation",
          "duration_days": 30
        },
        "ip_address": "192.168.1.100",
        "user_agent": "Mozilla/5.0...",
        "created_at": "2026-07-19T10:00:00Z"
      }
    ],
    "meta": { "page": 1, "limit": 50, "total": 1250, "has_more": true }
  }
}
```

**Curl Example:**

```bash
curl -X GET "https://api.connecta.app/v1/admin/audit-log?action=user_suspend" \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."
```

---

### 14.13 Get System Settings (Admin)

Returns current system configuration.

```
GET /v1/admin/settings
Authorization: Bearer <admin_access_token>
```

**Auth Required:** Yes (Admin - `settings.read`)

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "settings": {
      "platform": {
        "app_name": "Connecta",
        "version": "1.0.0",
        "maintenance_mode": false,
        "min_app_version": "1.0.0"
      },
      "limits": {
        "max_photos": 9,
        "max_bio_length": 500,
        "max_message_length": 5000,
        "daily_like_limit_free": 50,
        "daily_super_like_limit_plus": 5,
        "daily_super_like_limit_premium": 10
      },
      "safety": {
        "min_age": 18,
        "max_age": 100,
        "auto_ban_threshold_reports": 5,
        "ai_toxicity_threshold": 0.85,
        "fake_photo_detection_enabled": true,
        "romance_scam_detection_enabled": true
      },
      "payments": {
        "currency": "NGN",
        "payment_providers": ["paystack", "flutterwave"],
        "refund_window_days": 30,
        "trial_period_days": 7
      },
      "notifications": {
        "push_enabled": true,
        "email_provider": "sendgrid",
        "sms_provider": "termii"
      }
    }
  }
}
```

**Curl Example:**

```bash
curl -X GET https://api.connecta.app/v1/admin/settings \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."
```

---

### 14.14 Update System Settings (Admin)

Updates system configuration.

```
PUT /v1/admin/settings
Authorization: Bearer <admin_access_token>
```

**Auth Required:** Yes (Admin - `settings.write`)

**Request Body:**

```json
{
  "platform": {
    "maintenance_mode": true
  },
  "limits": {
    "daily_like_limit_free": 100
  }
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "updated_fields": ["platform.maintenance_mode", "limits.daily_like_limit_free"],
    "updated_at": "2026-07-19T10:00:00Z"
  }
}
```

**Curl Example:**

```bash
curl -X PUT https://api.connecta.app/v1/admin/settings \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "platform": {"maintenance_mode": true},
    "limits": {"daily_like_limit_free": 100}
  }'
```

---

### 14.15 Admin Broadcast

Sends a broadcast notification (duplicate of Notification Service 12.5 for admin convenience).

```
POST /v1/admin/broadcast
Authorization: Bearer <admin_access_token>
```

**Auth Required:** Yes (Admin - `broadcast.write`)

**Request Body:**

```json
{
  "title": "System Maintenance",
  "body": "Connecta will be under maintenance tonight from 11 PM to 2 AM.",
  "target": { "type": "all" },
  "priority": "high",
  "schedule_at": "2026-07-19T22:00:00Z"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "broadcast_id": "bcast_def456",
    "status": "scheduled",
    "target_type": "all",
    "estimated_recipients": 125840,
    "scheduled_at": "2026-07-19T22:00:00Z"
  }
}
```

**Curl Example:**

```bash
curl -X POST https://api.connecta.app/v1/admin/broadcast \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "System Maintenance",
    "body": "Connecta will be under maintenance tonight from 11 PM to 2 AM.",
    "target": {"type": "all"}
  }'
```

---

## 15. WebSocket Events

Connecta uses WebSocket connections for real-time communication. The WebSocket server is available at `wss://ws.connecta.app/v1`.

### 15.1 Connection

**WebSocket URL:**

```
wss://ws.connecta.app/v1?token=<access_token>
```

**Connection Headers:**

```
Authorization: Bearer <access_token>
X-Device-ID: <device_id>
```

### 15.2 Event Categories

#### Chat Events

| Event | Direction | Description |
|---|---|---|
| `message:new` | Receive | New message received |
| `message:typing` | Send/Receive | Typing indicator |
| `message:read` | Send/Receive | Read receipt |
| `message:reaction` | Receive | Message reaction added/removed |
| `message:deleted` | Receive | Message deleted by sender |
| `conversation:updated` | Receive | Conversation metadata updated |

**`message:new` Event:**

```json
{
  "event": "message:new",
  "data": {
    "message_id": "msg_abc123",
    "conversation_id": "conv_xyz789",
    "sender_id": "usr_x9y8z7w6",
    "content": "Hey! How are you?",
    "encrypted_content": "base64-encrypted-content",
    "type": "text",
    "sent_at": "2026-07-19T10:35:00Z",
    "client_message_id": "client-uuid-123"
  }
}
```

**`message:typing` Event (Send):**

```json
{
  "event": "message:typing",
  "data": {
    "conversation_id": "conv_xyz789",
    "is_typing": true
  }
}
```

**`message:typing` Event (Receive):**

```json
{
  "event": "message:typing",
  "data": {
    "conversation_id": "conv_xyz789",
    "user_id": "usr_x9y8z7w6",
    "is_typing": true,
    "expires_at": "2026-07-19T10:40:08Z"
  }
}
```

**`message:read` Event:**

```json
{
  "event": "message:read",
  "data": {
    "conversation_id": "conv_xyz789",
    "user_id": "usr_x9y8z7w6",
    "last_read_message_id": "msg_def456",
    "read_at": "2026-07-19T10:45:00Z"
  }
}
```

#### Matching Events

| Event | Direction | Description |
|---|---|---|
| `match:new` | Receive | New match created (mutual like) |
| `like:received` | Receive | Someone liked you (for notifications) |
| `superlike:received` | Receive | Someone super-liked you |

**`match:new` Event:**

```json
{
  "event": "match:new",
  "data": {
    "match_id": "mtch_abc123",
    "matched_user": {
      "user_id": "usr_x9y8z7w6",
      "full_name": "Chidinma Okafor",
      "avatar_url": "https://cdn.connecta.app/photos/usr_x9y8z7w6/1.jpg"
    },
    "matched_at": "2026-07-19T10:30:00Z",
    "conversation_id": "conv_xyz789"
  }
}
```

#### Call Events

| Event | Direction | Description |
|---|---|---|
| `call:ringing` | Receive | Incoming call notification |
| `call:answered` | Receive | Call answered by recipient |
| `call:rejected` | Receive | Call rejected |
| `call:ended` | Receive | Call ended |
| `call:ice_candidate` | Send/Receive | ICE candidate for WebRTC |
| `call:signal` | Send/Receive | WebRTC signaling |

**`call:ringing` Event:**

```json
{
  "event": "call:ringing",
  "data": {
    "call_id": "call_abc123",
    "call_type": "video",
    "caller": {
      "user_id": "usr_a1b2c3d4e5f6",
      "full_name": "Adebayo Johnson",
      "avatar_url": "https://cdn.connecta.app/photos/usr_a1b2c3d4e5f6/1.jpg"
    },
    "ice_servers": {
      "ice_servers": [
        {
          "urls": "stun:turn.connecta.app:3478",
          "username": "user",
          "credential": "pass"
        }
      ]
    }
  }
}
```

#### Presence Events

| Event | Direction | Description |
|---|---|---|
| `presence:online` | Receive | User came online |
| `presence:offline` | Receive | User went offline |
| `presence:typing` | Receive | User is typing in a conversation |

**`presence:online` Event:**

```json
{
  "event": "presence:online",
  "data": {
    "user_id": "usr_x9y8z7w6",
    "last_seen_at": "2026-07-19T10:30:00Z"
  }
}
```

#### Notification Events

| Event | Direction | Description |
|---|---|---|
| `notification:new` | Receive | New push notification received via WebSocket |

**`notification:new` Event:**

```json
{
  "event": "notification:new",
  "data": {
    "id": "ntf_abc123",
    "type": "new_match",
    "title": "New Match!",
    "body": "You and Chidinma Okafor liked each other!",
    "data": {
      "match_id": "mtch_xyz789",
      "user_id": "usr_x9y8z7w6"
    },
    "created_at": "2026-07-19T10:30:00Z"
  }
}
```

### 15.3 WebSocket Error Events

```json
{
  "event": "error",
  "data": {
    "code": "WS_001",
    "message": "Authentication failed",
    "retry_after": 5
  }
}
```

| Error Code | Description |
|---|---|
| `WS_001` | Authentication failed |
| `WS_002` | Token expired |
| `WS_003` | Rate limit exceeded |
| `WS_004` | Invalid message format |
| `WS_005` | Connection throttled |

### 15.4 Reconnection Strategy

The client should implement exponential backoff for reconnection:

1. Initial delay: 1 second
2. Max delay: 30 seconds
3. Max retries: 10
4. Jitter: Add random 0-5 seconds

```
delay = min(base_delay * 2^attempt + jitter, max_delay)
```

### 15.5 Heartbeat

The server sends a ping every 30 seconds. The client must respond with a pong within 10 seconds. If no pong is received, the connection is considered dead and should be reconnected.

```json
{ "event": "ping" }
{ "event": "pong" }
```

---

*This document is part of the Connecta Software Design Document (SDD) package.*
