# Admin Panel (Next.js)

## Connecta — Web Admin Dashboard Specification

**Version:** 1.0.0
**Date:** July 2026

---

## Table of Contents

1. [Overview](#1-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Authentication & Authorization](#4-authentication--authorization)
5. [Routing & Pages](#5-routing--pages)
6. [Component Architecture](#6-component-architecture)
7. [API Integration](#7-api-integration)
8. [State Management](#8-state-management)
9. [Dashboard & Analytics](#9-dashboard--analytics)
10. [User Management](#10-user-management)
11. [Safety & Reports](#11-safety--reports)
12. [System Settings](#12-system-settings)
13. [Audit Log](#13-audit-log)
14. [Responsive Design](#14-responsive-design)
15. [Deployment](#15-deployment)

---

## 1. Overview

### 1.1 Purpose

The Connecta Admin Panel is a web-based management interface built with Next.js that provides platform operators with full visibility and control over the Connecta dating platform. It connects to the same NestJS microservices backend via the Admin Service (port 3011) through the API Gateway (port 3000).

### 1.2 Key Responsibilities

| Area | Capabilities |
|---|---|
| **Dashboard** | Real-time KPIs, revenue tracking, user growth, match statistics |
| **User Management** | View, search, suspend, ban, unsuspend users; view profiles & subscriptions |
| **Safety & Moderation** | Review reports, take action on flagged content/users, track response times |
| **Revenue & Subscriptions** | Monitor subscription plans, payment history, refund requests |
| **System Settings** | Manage platform configuration, feature flags, rate limits |
| **Audit Log** | Track all admin actions for accountability and compliance |
| **Notifications** | Broadcast platform-wide push notifications to users |

### 1.3 Access Control

| Role | Permissions |
|---|---|
| `super_admin` | Full access to all sections |
| `admin` | Dashboard, user management, reports (no system settings or audit log) |
| `moderator` | Reports and user suspension only |

---

## 2. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 14.x |
| Language | TypeScript | 5.x |
| UI Library | React | 18.x |
| Component Library | shadcn/ui (Radix primitives) | latest |
| Styling | Tailwind CSS | 3.x |
| State Management | React Query (TanStack Query) | 5.x |
| Forms | React Hook Form + Zod | latest |
| Charts | Recharts | 2.x |
| Tables | TanStack Table | 8.x |
| Authentication | next-auth (JWT strategy) | 5.x |
| HTTP Client | Axios | 1.x |
| Icons | Lucide React | latest |
| Date Handling | date-fns | 3.x |

### 2.1 Why Next.js?

- **Server-side rendering** for SEO-friendly pages (login, public reports)
- **API routes** as a BFF (Backend-for-Frontend) layer to proxy admin API calls
- **Middleware** for auth token refresh and route protection
- **File-based routing** for intuitive page organization
- **Built-in optimization** for images, fonts, and scripts

---

## 3. Project Structure

```
apps/admin-web/
├── public/
│   ├── favicon.ico
│   └── logo.svg
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx            # Redirect to /dashboard
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx          # Sidebar + topbar layout
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── users/
│   │   │   │   ├── page.tsx        # User list
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx    # User detail
│   │   │   ├── reports/
│   │   │   │   ├── page.tsx        # Report queue
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx    # Report detail
│   │   │   ├── subscriptions/
│   │   │   │   └── page.tsx
│   │   │   ├── notifications/
│   │   │   │   ├── page.tsx        # Notification history
│   │   │   │   └── broadcast/
│   │   │   │       └── page.tsx    # Send broadcast
│   │   │   ├── settings/
│   │   │   │   └── page.tsx
│   │   │   ├── audit-log/
│   │   │   │   └── page.tsx
│   │   │   └── analytics/
│   │   │       └── page.tsx
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── [...nextauth]/
│   │   │           └── route.ts    # NextAuth.js handler
│   │   ├── layout.tsx              # Root layout
│   │   └── page.tsx                # Root redirect
│   ├── components/
│   │   ├── ui/                     # shadcn/ui primitives
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── toast.tsx
│   │   │   └── badge.tsx
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopBar.tsx
│   │   │   ├── Breadcrumb.tsx
│   │   │   └── UserAvatar.tsx
│   │   ├── dashboard/
│   │   │   ├── StatsCards.tsx
│   │   │   ├── RevenueChart.tsx
│   │   │   ├── UserGrowthChart.tsx
│   │   │   ├── MatchStats.tsx
│   │   │   └── RecentActivity.tsx
│   │   ├── users/
│   │   │   ├── UserTable.tsx
│   │   │   ├── UserFilters.tsx
│   │   │   ├── UserDetail.tsx
│   │   │   ├── UserActions.tsx
│   │   │   └── SubscriptionBadge.tsx
│   │   ├── reports/
│   │   │   ├── ReportTable.tsx
│   │   │   ├── ReportDetail.tsx
│   │   │   └── ReportActions.tsx
│   │   └── shared/
│   │       ├── DataTable.tsx        # Reusable table with sorting, pagination
│   │       ├── DateRangePicker.tsx
│   │       ├── SearchInput.tsx
│   │       ├── ConfirmDialog.tsx
│   │       ├── StatusBadge.tsx
│   │       ├── EmptyState.tsx
│   │       ├── LoadingSpinner.tsx
│   │       └── ErrorBoundary.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useUsers.ts
│   │   ├── useDashboard.ts
│   │   ├── useReports.ts
│   │   ├── useSettings.ts
│   │   └── useAuditLog.ts
│   ├── lib/
│   │   ├── api.ts                  # Axios instance with interceptors
│   │   ├── auth.ts                 # NextAuth configuration
│   │   ├── utils.ts                # Helper functions
│   │   └── constants.ts            # API URLs, status enums
│   ├── types/
│   │   ├── api.ts                  # API response types
│   │   ├── user.ts                 # User, Profile types
│   │   ├── report.ts               # Report types
│   │   └── dashboard.ts            # Dashboard stats types
│   └── styles/
│       └── globals.css             # Tailwind + custom styles
├── middleware.ts                    # Auth middleware
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 4. Authentication & Authorization

### 4.1 Login Flow

```
┌──────────┐     POST /v1/admin/login      ┌──────────┐
│ Admin    │ ──────────────────────────────>│  API     │
│ Browser  │                                │  Gateway │
│          │<──────────────────────────────│          │
└──────────┘     200 { tokens, admin }      └──────────┘
      │                                            │
      │  Store tokens in httpOnly cookie           │
      │  Redirect to /dashboard                    │
      ▼                                            ▼
┌──────────┐                                ┌──────────┐
│ Dashboard│                                │  Admin   │
│ Page     │                                │ Service  │
└──────────┘                                └──────────┘
```

### 4.2 Token Management

| Token | Storage | Lifetime | Refresh |
|---|---|---|---|
| Access Token | httpOnly cookie | 15 minutes | Auto-refresh via API route |
| Refresh Token | httpOnly cookie | 7 days | Rotated on each use |
| Session | Server session (next-auth) | 24 hours | Extended on activity |

### 4.3 2FA Flow

```
Login ──> { requires_2fa: true, temp_token }
              │
              ▼
         2FA Verification Page
              │
              ▼
         POST /v1/admin/2fa/verify
              │
              ▼
         { tokens, admin } ──> Dashboard
```

### 4.4 Route Protection

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token');
  const isAuthPage = request.nextUrl.pathname.startsWith('/login');

  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  return NextResponse.next();
}
```

### 4.5 Role-Based Access

```typescript
// Components check admin role before rendering
function SettingsPage() {
  const { admin } = useAuth();
  if (admin.role !== 'super_admin') return <AccessDenied />;
  return <SettingsForm />;
}
```

---

## 5. Routing & Pages

### 5.1 Route Summary

| Route | Page | Auth Required | Role |
|---|---|---|---|
| `/login` | Admin Login | No | — |
| `/dashboard` | Dashboard Overview | Yes | All |
| `/users` | User Management List | Yes | admin+ |
| `/users/[id]` | User Detail Profile | Yes | admin+ |
| `/reports` | Safety Reports Queue | Yes | moderator+ |
| `/reports/[id]` | Report Detail | Yes | moderator+ |
| `/subscriptions` | Subscription Management | Yes | admin+ |
| `/notifications` | Notification History | Yes | admin+ |
| `/notifications/broadcast` | Send Broadcast | Yes | super_admin |
| `/settings` | System Settings | Yes | super_admin |
| `/audit-log` | Admin Audit Log | Yes | super_admin |
| `/analytics` | Analytics Overview | Yes | admin+ |

### 5.2 Page Specifications

#### 5.2.1 Dashboard (`/dashboard`)

**Layout:** Grid of stat cards + charts

**Components:**
- `StatsCards` — Total users, active subs, revenue (NGN), reports pending
- `RevenueChart` — Line chart showing daily revenue for selected period
- `UserGrowthChart` — Area chart showing new registrations over time
- `MatchStats` — Cards showing total matches, match rate, avg compatibility
- `RecentActivity` — Table of recent admin actions from audit log

**Data Source:** `GET /v1/admin/dashboard?period=7d`

**Period Selector:** Toggle between 24h, 7d, 30d, 90d

#### 5.2.2 User List (`/users`)

**Layout:** Search bar + filters + data table

**Components:**
- `SearchInput` — Search by name, email, phone
- `UserFilters` — Status filter (active/suspended/banned/pending), verified filter
- `UserTable` — Sortable, paginated table with columns:
  - Avatar + Name
  - Email
  - Status (badge)
  - Subscription Plan (badge)
  - Last Active
  - Actions (dropdown: View, Suspend, Ban)
- Pagination controls

**Data Source:** `GET /v1/admin/users?page=1&limit=20&search=&status=`

**Row Click:** Navigate to `/users/[id]`

#### 5.2.3 User Detail (`/users/[id]`)

**Layout:** Profile card + subscription info + activity log

**Sections:**
- Profile photo gallery
- Personal info (name, email, phone, DOB, gender)
- Profile details (bio, job, school, location)
- Interest tags
- Subscription status & history
- Activity log (last logins, matches, messages count)
- Action buttons: Suspend, Ban, Unsuspend, Delete

**Data Sources:**
- `GET /v1/admin/users/:id`
- `GET /v1/users/:id` (via user service for full profile)

#### 5.2.4 Reports Queue (`/reports`)

**Layout:** Filter tabs + data table

**Filter Tabs:** All | Pending | Under Review | Resolved | Dismissed

**Table Columns:**
- Reporter
- Reported User
- Reason (badge)
- Status (badge)
- Date Reported
- Actions (View, Resolve)

**Data Source:** `GET /v1/admin/reports?status=&page=1&limit=20`

#### 5.2.5 Report Detail (`/reports/[id]`)

**Layout:** Report info + reporter/reported profiles + actions

**Sections:**
- Report metadata (date, reason, description)
- Evidence URLs (images/files displayed)
- Reporter profile card
- Reported user profile card
- Previous reports against same user
- Action form:
  - Action taken (dropdown): No Action, Warning Issued, Temp Suspension, Permanent Ban
  - Notes (textarea)
  - Submit

**Data Sources:**
- `GET /v1/admin/reports/:id`
- `POST /v1/admin/reports/:id/resolve`

#### 5.2.6 Settings (`/settings`)

**Layout:** Tabbed form

**Tabs:**
- **General** — Platform name, support email, maintenance mode toggle
- **Matching** — Daily like limits, super like limits, distance range
- **Safety** — Report auto-escalation thresholds, banned words list
- **Rate Limits** — API rate limit configuration per tier
- **Notifications** — Push notification templates, email templates
- **Feature Flags** — Toggle features (video calls, AI matching, etc.)

**Data Sources:**
- `GET /v1/admin/settings`
- `PUT /v1/admin/settings`

---

## 6. Component Architecture

### 6.1 Shared DataTable

Reusable table component built on TanStack Table:

```typescript
interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onSort: (field: string, order: 'asc' | 'desc') => void;
  isLoading: boolean;
}
```

**Features:**
- Column sorting (client + server)
- Pagination with page size selector
- Row selection (bulk actions)
- Column visibility toggle
- Loading skeletons
- Empty state

### 6.2 ConfirmDialog

Modal confirmation for destructive actions:

```typescript
interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  variant: 'destructive' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}
```

### 6.3 StatusBadge

Renders colored badges for statuses:

| Status | Color | Label |
|---|---|---|
| `active` | Green | Active |
| `suspended` | Yellow | Suspended |
| `banned` | Red | Banned |
| `pending` | Blue | Pending |
| `resolved` | Green | Resolved |
| `dismissed` | Gray | Dismissed |

---

## 7. API Integration

### 7.1 Axios Instance

```typescript
// src/lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach token
api.interceptors.request.use((config) => {
  // Token is in httpOnly cookie, sent automatically
  return config;
});

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try refresh
      try {
        const refreshResponse = await api.post('/auth/refresh', {
          refreshToken: getRefreshToken(),
        });
        // Retry original request
        return api(error.config);
      } catch {
        // Redirect to login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 7.2 React Query Hooks

```typescript
// src/hooks/useUsers.ts
import { useQuery } from '@tanstack/query';
import api from '@/lib/api';

export function useUsers(params: UserListParams) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      const { data } = await api.get('/admin/users', { params });
      return data;
    },
    staleTime: 30_000, // 30 seconds
  });
}

export function useUserDetail(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const { data } = await api.get(`/admin/users/${userId}`);
      return data;
    },
    enabled: !!userId,
  });
}
```

### 7.3 API Endpoints Summary

| Method | Endpoint | Used By |
|---|---|---|
| `POST` | `/v1/admin/login` | Login page |
| `POST` | `/v1/admin/2fa/verify` | 2FA page |
| `GET` | `/v1/admin/dashboard` | Dashboard |
| `GET` | `/v1/admin/users` | User list |
| `GET` | `/v1/admin/users/:id` | User detail |
| `POST` | `/v1/admin/users/:id/suspend` | User actions |
| `POST` | `/v1/admin/users/:id/ban` | User actions |
| `POST` | `/v1/admin/users/:id/unsuspend` | User actions |
| `GET` | `/v1/admin/reports` | Reports list |
| `POST` | `/v1/admin/reports/:id/resolve` | Report actions |
| `GET` | `/v1/admin/audit-log` | Audit log |
| `GET` | `/v1/admin/settings` | Settings page |
| `PUT` | `/v1/admin/settings` | Settings page |

---

## 8. State Management

### 8.1 Server State (React Query)

All API data is managed via React Query:

| Query Key | Data | Cache Time |
|---|---|---|
| `['dashboard', period]` | Dashboard stats | 30s |
| `['users', params]` | User list | 30s |
| `['user', id]` | User detail | 60s |
| `['reports', params]` | Report list | 30s |
| `['report', id]` | Report detail | 60s |
| `['settings']` | System settings | 5min |
| `['auditLog', params]` | Audit entries | 30s |

### 8.2 Client State (React Context)

| Context | Purpose |
|---|---|
| `AuthContext` | Current admin user, tokens, role, login/logout |
| `ThemeContext` | Light/dark mode preference |
| `ToastContext` | Global toast notifications |

### 8.3 Form State (React Hook Form)

All forms use React Hook Form with Zod validation:

```typescript
const suspendSchema = z.object({
  durationDays: z.number().min(1).max(365),
  reason: z.string().min(10).max(500),
});

function SuspendForm({ userId }: { userId: string }) {
  const form = useForm({ resolver: zodResolver(suspendSchema) });
  const suspendUser = useMutation({
    mutationFn: (data) => api.post(`/admin/users/${userId}/suspend`, data),
    onSuccess: () => toast.success('User suspended'),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(suspendUser.mutate)}>
        {/* form fields */}
      </form>
    </Form>
  );
}
```

---

## 9. Dashboard & Analytics

### 9.1 KPI Cards

| Card | Value Source | Format |
|---|---|---|
| Total Users | `users.total` | Number with locale formatting |
| Active Subscriptions | `revenue.active_subscriptions` | Number |
| Revenue (NGN) | `revenue.total_revenue_ngn` | ₦ + formatted number |
| Reports Pending | `safety.reports_7d` | Number + trend arrow |

### 9.2 Charts

**Revenue Chart (Line)**
- X-axis: Date (last 7/30/90 days)
- Y-axis: Revenue in NGN
- Gradient fill under line
- Tooltip showing daily total

**User Growth Chart (Area)**
- X-axis: Date
- Y-axis: New registrations
- Cumulative line overlay
- Comparison with previous period (dotted line)

### 9.3 Real-Time Updates

Dashboard polls every 30 seconds when the tab is active:

```typescript
useEffect(() => {
  const interval = setInterval(() => {
    refetch();
  }, 30_000);
  return () => clearInterval(interval);
}, [refetch]);
```

---

## 10. User Management

### 10.1 User Table Columns

| Column | Field | Sortable | Width |
|---|---|---|---|
| Avatar + Name | `fullName` | Yes | 250px |
| Email | `email` | Yes | 200px |
| Phone | `phone` | No | 150px |
| Status | `status` | Yes | 120px |
| Plan | `subscription.plan` | No | 120px |
| Verified | `emailVerified` | No | 80px |
| Last Active | `lastActiveAt` | Yes | 150px |
| Joined | `createdAt` | Yes | 150px |
| Actions | — | No | 100px |

### 10.2 User Actions

| Action | Confirmation Required | Effect |
|---|---|---|
| View Profile | No | Navigate to `/users/:id` |
| Suspend User | Yes (ConfirmDialog) | POST `/admin/users/:id/suspend` |
| Ban User | Yes (ConfirmDialog) | POST `/admin/users/:id/ban` |
| Unsuspend User | Yes (ConfirmDialog) | POST `/admin/users/:id/unsuspend` |

### 10.3 Suspend Dialog

```
┌─────────────────────────────────────┐
│  Suspend User                       │
│                                     │
│  Duration:  [___30___] days         │
│  Reason:                            │
│  ┌─────────────────────────────────┐│
│  │ User reported for inappropriate ││
│  │ content in profile photos...    ││
│  └─────────────────────────────────┘│
│                                     │
│         [Cancel]  [Suspend User]    │
└─────────────────────────────────────┘
```

---

## 11. Safety & Reports

### 11.1 Report Reasons

| Reason | Badge Color | Auto-Action |
|---|---|---|
| Inappropriate Content | Red | Flag for review |
| Fake Profile | Orange | Auto-flag profile |
| Harassment | Red | Auto-escalate |
| Spam | Yellow | Rate limit user |
| Underage | Red | Immediate suspension |
| Other | Gray | Queue for review |

### 11.2 Report Resolution Actions

| Action | Description | Side Effects |
|---|---|---|
| No Action | Report dismissed, no violation | Notify reporter |
| Warning Issued | Formal warning to reported user | Create audit entry |
| Content Removed | Remove flagged content | Notify both parties |
| Temp Suspension | Suspend for N days | Revoke sessions |
| Permanent Ban | Ban user permanently | Revoke all sessions, hide profile |

### 11.3 Report Detail View

```
┌──────────────────────────────────────────────────────────┐
│ Report #rpt_abc123                                       │
│ Status: [Pending]    Reason: [Harassment]                │
│                                                          │
│ ┌─ Reporter ──────────┐  ┌─ Reported User ────────────┐ │
│ │ [Avatar]            │  │ [Avatar]                    │ │
│ │ Amina Bello         │  │ Chukwuma Okafor             │ │
│ │ Member since Mar '26│  │ Member since Jan '26        │ │
│ │ 3 reports filed     │  │ 2 reports received          │ │
│ └─────────────────────┘  └─────────────────────────────┘ │
│                                                          │
│ Evidence:                                                │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐                  │
│ │ img1.jpg │ │ img2.jpg │ │ chat.png │                  │
│ └──────────┘ └──────────┘ └──────────┘                  │
│                                                          │
│ Description:                                             │
│ "User sent unwanted explicit messages and photos..."     │
│                                                          │
│ Previous reports against this user: 2                    │
│                                                          │
│ Action:                                                  │
│ [Select action ▼]                                        │
│ Notes:                                                   │
│ ┌────────────────────────────────────────────────────┐   │
│ │                                                    │   │
│ └────────────────────────────────────────────────────┘   │
│                                                          │
│                        [Cancel]  [Submit Action]         │
└──────────────────────────────────────────────────────────┘
```

---

## 12. System Settings

### 12.1 Settings Categories

```typescript
interface SystemSettings {
  general: {
    platformName: string;
    supportEmail: string;
    maintenanceMode: boolean;
    maintenanceMessage: string;
  };
  matching: {
    dailyLikeLimit: { free: number; plus: number; premium: number };
    superLikeLimit: { free: number; plus: number; premium: number };
    maxDistanceKm: number;
    minAge: number;
    maxAge: number;
    feedAlgorithm: 'compatibility' | 'recency' | 'activity';
  };
  safety: {
    autoSuspendThreshold: number;    // reports before auto-suspend
    bannedWords: string[];
    requirePhotoVerification: boolean;
    minProfilePhotos: number;
  };
  rateLimits: {
    anonymous: { perMinute: number };
    free: { perMinute: number };
    plus: { perMinute: number };
    premium: { perMinute: number };
  };
  features: {
    videoCallsEnabled: boolean;
    aiMatchmakingEnabled: boolean;
    superLikeEnabled: boolean;
    boostEnabled: boolean;
    readReceiptsEnabled: boolean;
  };
}
```

### 12.2 Settings Form

Each category renders as a tab with a form:

```
┌──────────────────────────────────────────────────────────┐
│ [General] [Matching] [Safety] [Rate Limits] [Features]   │
│                                                          │
│ General Settings                                         │
│                                                          │
│ Platform Name:  [Connecta                    ]           │
│ Support Email:  [support@connecta.app        ]           │
│ Maintenance:    [○] Enable maintenance mode              │
│                                                         │
│ Maintenance Message:                                     │
│ ┌────────────────────────────────────────────────────┐   │
│ │ We're currently performing scheduled maintenance.  │   │
│ └────────────────────────────────────────────────────┘   │
│                                                          │
│                           [Reset]  [Save Changes]        │
└──────────────────────────────────────────────────────────┘
```

---

## 13. Audit Log

### 13.1 Logged Actions

| Action | Description |
|---|---|
| `admin.login` | Admin logged in |
| `admin.login.2fa` | Admin completed 2FA |
| `user.suspend` | User account suspended |
| `user.ban` | User account banned |
| `user.unsuspend` | User account unsuspended |
| `report.resolve` | Report resolved with action |
| `settings.update` | System settings modified |
| `broadcast.send` | Broadcast notification sent |

### 13.2 Audit Log Table

| Column | Field |
|---|---|
| Timestamp | `createdAt` |
| Admin | `adminUser.email` |
| Action | `action` |
| Target | `targetId` |
| Details | `metadata` |
| IP Address | `ipAddress` |

### 13.3 Log Entry Detail

```json
{
  "id": "aud_xyz789",
  "adminId": "adm_abc123",
  "adminEmail": "admin@connecta.app",
  "action": "user.suspend",
  "targetId": "usr_a1b2c3d4e5f6",
  "metadata": {
    "durationDays": 30,
    "reason": "Inappropriate content"
  },
  "ipAddress": "197.210.65.100",
  "createdAt": "2026-07-19T14:30:00Z"
}
```

---

## 14. Responsive Design

### 14.1 Breakpoints

| Breakpoint | Width | Layout |
|---|---|---|
| Mobile | < 768px | Collapsed sidebar, stacked cards |
| Tablet | 768px - 1024px | Collapsed sidebar, 2-column grid |
| Desktop | > 1024px | Full sidebar, 4-column grid |
| Wide | > 1440px | Full sidebar, expanded charts |

### 14.2 Mobile Adaptations

- Sidebar becomes a bottom navigation bar
- Tables become card-based layouts
- Charts stack vertically
- Action buttons move to FAB (Floating Action Button)

### 14.3 Dark Mode

Full dark mode support via Tailwind's `dark:` prefix:

```css
/* globals.css */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --primary: 4 84% 60%;    /* Coral */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 8%;
  --primary: 4 84% 60%;
}
```

---

## 15. Deployment

### 15.1 Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/v1
NEXTAUTH_SECRET=connecta-admin-nextauth-secret-2026
NEXTAUTH_URL=http://localhost:3001

# Production
NEXT_PUBLIC_API_URL=https://api.connecta.app/v1
NEXTAUTH_SECRET=<secure-random-string>
NEXTAUTH_URL=https://admin.connecta.app
```

### 15.2 Build & Deploy

```bash
# Development
npm run dev          # Starts on port 3001

# Production build
npm run build
npm run start        # Starts on port 3001

# Docker
docker build -t connecta-admin .
docker run -p 3001:3001 connecta-admin
```

### 15.3 Dockerfile

```dockerfile
FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3001
CMD ["node", "server.js"]
```

### 15.4 Performance Targets

| Metric | Target |
|---|---|
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Time to Interactive | < 3.0s |
| Cumulative Layout Shift | < 0.1 |
| Bundle Size (initial) | < 200KB gzipped |

---

## Appendix A: Admin Panel API Proxy Routes

The Next.js app includes API routes that proxy requests to the backend, keeping credentials server-side:

```
src/app/api/
├── auth/
│   └── [...nextauth]/
│       └── route.ts          # NextAuth handler
├── admin/
│   ├── login/
│   │   └── route.ts          # POST -> /v1/admin/login
│   ├── dashboard/
│   │   └── route.ts          # GET -> /v1/admin/dashboard
│   ├── users/
│   │   ├── route.ts          # GET -> /v1/admin/users
│   │   └── [id]/
│   │       ├── route.ts      # GET -> /v1/admin/users/:id
│   │       ├── suspend/
│   │       │   └── route.ts  # POST -> /v1/admin/users/:id/suspend
│   │       ├── ban/
│   │       │   └── route.ts  # POST -> /v1/admin/users/:id/ban
│   │       └── unsuspend/
│   │           └── route.ts  # POST -> /v1/admin/users/:id/unsuspend
│   ├── reports/
│   │   ├── route.ts          # GET -> /v1/admin/reports
│   │   └── [id]/
│   │       └── resolve/
│   │           └── route.ts  # POST -> /v1/admin/reports/:id/resolve
│   ├── settings/
│   │   └── route.ts          # GET/PUT -> /v1/admin/settings
│   └── audit-log/
│       └── route.ts          # GET -> /v1/admin/audit-log
```

## Appendix B: Page Wireframes

### B.1 Login Page

```
┌─────────────────────────────────────────────────┐
│                                                  │
│              [Connecta Logo]                     │
│                                                  │
│         ┌────────────────────────┐              │
│         │ Admin Login            │              │
│         │                        │              │
│         │ Email:                 │              │
│         │ [___________________]  │              │
│         │                        │              │
│         │ Password:              │              │
│         │ [___________________]  │              │
│         │                        │              │
│         │    [ Sign In ]         │              │
│         │                        │              │
│         │    Forgot password?    │              │
│         └────────────────────────┘              │
│                                                  │
│         © 2026 Connecta. All rights reserved.   │
└─────────────────────────────────────────────────┘
```

### B.2 Dashboard Layout

```
┌──────┬──────────────────────────────────────────┐
│      │  Dashboard              [Admin ▼] [🌙]   │
│ Logo │──────────────────────────────────────────│
│      │                                          │
│ Nav  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │
│      │  │Users │ │Subs  │ │Revenue│ │Reports│  │
│ Dash │  │125K  │ │32K   │ │₦45M  │ │320   │  │
│      │  │+1.2K │ │+850  │ │+₦850K│ │-15%  │  │
│ Users│  └──────┘ └──────┘ └──────┘ └──────┘   │
│      │                                          │
│ Reps │  ┌─────────────────┐ ┌─────────────────┐ │
│      │  │ Revenue Chart   │ │ User Growth     │ │
│ Subs │  │   ╱╲  ╱╲       │ │  ▓▓▓▓▓▓▓▓▓▓▓▓  │ │
│      │  │  ╱  ╲╱  ╲╱╲    │ │  ▓▓▓▓▓▓▓▓▓▓▓▓  │ │
│ Nots │  │ ╱          ╲   │ │  ▓▓▓▓▓▓▓▓▓▓▓▓  │ │
│      │  └─────────────────┘ └─────────────────┘ │
│ Sets │                                          │
│      │  ┌─────────────────────────────────────┐ │
│ Audit│  │ Recent Activity                      │ │
│      │  │ 14:30 Admin A suspended usr_abc123   │ │
│      │  │ 14:15 Admin B resolved rpt_xyz789   │ │
│      │  │ 13:45 Admin A updated settings       │ │
│      │  └─────────────────────────────────────┘ │
└──────┴──────────────────────────────────────────┘
```
