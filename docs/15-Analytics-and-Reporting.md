# SDD 15: Analytics & Reporting

## 1. Overview

The Analytics & Reporting platform powers business intelligence, user engagement tracking, and safety monitoring for Connecta. It provides real-time dashboards for operations teams, scheduled reports for leadership, and data pipelines that feed into automated safety and growth systems.

The analytics architecture is designed with privacy-first principles: all user-level data is pseudonymized at ingestion, raw event data is retained only for 90 days, and aggregated metrics are stored indefinitely. Users can opt out of non-essential tracking via in-app settings.

---

## 2. Event Tracking

### 2.1 User Events

| Event Name | Description | Properties |
|---|---|---|
| `signup` | User completes registration | `method` (email, phone, google), `referral_source`, `country` |
| `profile_complete` | User fills all required profile fields | `completion_time_seconds`, `photos_count` |
| `first_match` | User receives their first mutual match | `time_to_first_match_minutes` |
| `first_message` | User sends their first message | `time_since_match_minutes`, `message_length` |
| `subscription_purchase` | User completes a paid subscription | `plan_tier`, `payment_method`, `amount_ngn` |
| `app_open` | App comes to foreground | `session_id`, `platform`, `app_version` |
| `profile_view` | User views another profile | `profile_id_hashed`, `time_on_profile_seconds` |
| `swipe_right` / `swipe_left` | User performs a like/pass action | `profile_id_hashed`, `daily_swipe_count` |
| `conversation_started` | Two users exchange first messages | `match_id_hashed`, `time_since_match_minutes` |
| `push_notification_received` | Push notification delivered | `notification_type`, `delivery_status` |
| `push_notification_opened` | User taps a push notification | `notification_type`, `time_to_open_seconds` |
| `search_performed` | User uses search/filter | `filters_applied`, `results_count` |
| `boost_used` | User activates profile boost | `boost_duration`, `remaining_boosts` |
| `super_like_used` | User sends a super like | `remaining_super_likes` |

### 2.2 System Events

| Event Name | Description | Properties |
|---|---|---|
| `api_error` | API endpoint returns 4xx/5xx | `endpoint`, `status_code`, `error_code`, `latency_ms` |
| `rate_limit` | Rate limiter triggers | `endpoint`, `client_ip_hashed`, `limit_type` |
| `security_incident` | Security system flags an event | `incident_type`, `severity`, `affected_user_hashed` |
| `service_health` | Periodic health check results | `service_name`, `status`, `memory_usage_mb`, `cpu_percent` |
| `database_slow_query` | Query exceeds threshold | `query_hash`, `duration_ms`, `table` |
| `websocket_disconnect` | Unexpected socket disconnection | `reason`, `session_duration_seconds` |

### 2.3 Event Ingestion

Events are captured client-side via the `AnalyticsService` and sent to the `analytics-service` microservice over HTTPS. The service validates events against a schema, enriches them with server-side context (timestamp, device info, geo-region), and writes them to the `analytics.events` table in PostgreSQL.

Batch ingestion is used for high-volume events (swipes, profile views) to reduce network overhead. Events are buffered in a Redis queue and flushed every 10 seconds or when the batch reaches 100 events, whichever comes first.

---

## 3. Metrics Dashboard

### 3.1 Core Metrics

| Metric | Definition | Target |
|---|---|---|
| **DAU** | Unique users with at least one event per day | >10K by month 6 |
| **MAU** | Unique users with at least one event per month | >100K by month 6 |
| **DAU/MAU Ratio** | Stickiness indicator | >20% |
| **D1 Retention** | % of new users returning day 1 | >60% |
| **D7 Retention** | % of new users returning day 7 | >35% |
| **D30 Retention** | % of new users returning day 30 | >20% |
| **Avg Session Duration** | Mean session length per day | >8 minutes |
| **Sessions per User per Day** | Average number of sessions | >2 |

### 3.2 Conversion Funnel

```
Signup → Profile Complete → First Match → First Message → Subscription Purchase
```

| Stage | Target Conversion | Measurement |
|---|---|---|
| Signup → Profile Complete | >75% | Tracked via `signup` and `profile_complete` events |
| Profile Complete → First Match | >50% within 7 days | Cohort analysis by registration date |
| First Match → First Message | >80% | Time-series from `first_match` to `first_message` |
| First Message → Subscription | >5% within 30 days | Revenue attribution model |

Funnel data is computed nightly by the `analytics-service` and stored in the `analytics.funnel_snapshots` table. The admin dashboard renders funnel visualizations with drill-down by country, referral source, and registration cohort.

### 3.3 Engagement Metrics

| Metric | Definition | Granularity |
|---|---|---|
| Messages per user per day | Total messages / DAU | Daily |
| Matches per user per week | New matches / WAU | Weekly |
| Profile views per user per day | Profile views / DAU | Daily |
| Swipe-to-match ratio | Matches / total swipes | Daily |
| Response rate | Messages replied to / messages sent | Daily |
| Search usage rate | Users who search / DAU | Daily |

---

## 4. Safety Metrics

### 4.1 Key Safety Indicators

| Metric | Definition | Target |
|---|---|---|
| **Report Volume** | User-submitted reports per 1K users | <10 |
| **Report Response Time** | Median time from report to moderator action | <2 hours |
| **Ban Rate** | % of users banned per month | <1% |
| **Scam Detection Rate** | Scams detected by ML vs. total scam attempts | >90% |
| **Fake Profile Detection Rate** | Fakes caught at onboarding | >85% |
| **Appeal Overturn Rate** | Bans overturned on appeal | <5% |
| **Time to Ban (automated)** | Time from detection to enforcement | <5 minutes |

### 4.2 Safety Dashboard

The safety dashboard provides real-time visibility into platform health:

- **Report Queue**: Open reports by category (harassment, spam, fake profile, scam, other) with priority scoring
- **Moderator Performance**: Actions taken per moderator, accuracy rate, average response time
- **Trend Analysis**: Report volume trends, emerging scam patterns, geographic hotspots
- **Automated Actions**: Count of auto-bans, auto-warnings, and auto-shadow-bans by detection type

### 4.3 Escalation Alerts

Automated alerts fire when safety metrics breach thresholds:

- Report volume >2x rolling 7-day average → Slack alert to safety team lead
- Ban rate >2% in any 24-hour period → PagerDuty incident
- New scam pattern detected → Slack alert with pattern details
- False positive rate on auto-bans >10% → Review trigger for ML model retraining

---

## 5. Revenue Metrics

### 5.1 Key Revenue Indicators

| Metric | Definition | Target |
|---|---|---|
| **MRR** | Monthly Recurring Revenue | >₦5M by month 6 |
| **ARPU** | Average Revenue Per User (monthly) | >₦500 |
| **Churn Rate** | % of subscribers canceling per month | <8% |
| **LTV** | Average customer lifetime value | >₦5,000 |
| **CAC** | Customer Acquisition Cost | <₦2,000 |
| **LTV:CAC Ratio** | Return on acquisition spend | >2.5:1 |
| **Trial → Paid Conversion** | % of trial users converting | >15% |

### 5.2 Plan Tier Breakdown

Revenue metrics are segmented by subscription tier:

| Tier | Price (₦/month) | Target Mix | ARPU Contribution |
|---|---|---|---|
| Free | 0 | 70% of users | ₦0 |
| Gold | 2,000 | 20% of users | ₦400 |
| Platinum | 5,000 | 8% of users | ₦400 |
| Diamond | 10,000 | 2% of users | ₦200 |

### 5.3 Revenue Dashboard

- **MRR Trend**: Daily MRR with MoM growth rate
- **Churn Analysis**: Churn by tier, tenure, and reason
- **Payment Success Rate**: Successful payments / total attempts by method (card, bank transfer, USSD)
- **Refund Rate**: Refunds / total transactions
- **Revenue by Geography**: Country-level revenue distribution
- **Cohort Revenue**: Revenue per registration cohort over time

---

## 6. A/B Testing Framework

### 6.1 Architecture

A/B testing is implemented through the admin settings system and a dedicated `experiments` table. Feature flags are stored in the `admin.settings` table and evaluated by the `feature-flag` middleware in the API gateway.

### 6.2 Experiment Configuration

```sql
CREATE TABLE analytics.experiments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    status VARCHAR(20) DEFAULT 'draft', -- draft, running, paused, completed
    traffic_allocation JSONB, -- {"control": 50, "variant_a": 25, "variant_b": 25}
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6.3 Experiment Groups

- **Control Group**: Receives current experience (50% default)
- **Variant Groups**: Receive experimental changes (split evenly among remaining traffic)
- **Holdout Group**: Never exposed to any experiments (5% permanent holdout for long-term impact measurement)

### 6.4 Statistical Significance

- Minimum sample size: 1,000 users per variant
- Confidence level: 95%
- Minimum detectable effect: 5% relative improvement
- Tests run for minimum 7 days to account for weekly patterns
- Bonferroni correction applied when running multiple simultaneous experiments

### 6.5 Experiment Lifecycle

1. **Draft**: Experiment configured, not yet active
2. **Running**: Actively assigning users and collecting data
3. **Paused**: Temporarily halted (data preserved)
4. **Completed**: Statistical threshold reached, results available

---

## 7. Data Pipeline

### 7.1 Architecture

```
Client Events → analytics-service → PostgreSQL (analytics schema) → Aggregation Queries → Admin Dashboard
                                      ↓
                                  Scheduled Reports (email/Slack)
```

### 7.2 Pipeline Stages

| Stage | Component | SLA |
|---|---|---|
| Ingestion | `analytics-service` REST/WebSocket endpoint | <100ms ingestion latency |
| Validation | JSON schema validation + deduplication | <10ms per event |
| Enrichment | Server-side context (geo, device, session) | <5ms per event |
| Storage | PostgreSQL `analytics.events` table | Partitioned by month |
| Aggregation | Nightly cron jobs + materialized views | Complete by 06:00 UTC |
| Serving | Admin dashboard API endpoints | <500ms query response |
| Reporting | Scheduled email/Slack reports | Daily at 08:00 UTC |

### 7.3 Data Retention

| Data Type | Retention Period | Storage |
|---|---|---|
| Raw events | 90 days | PostgreSQL (partitioned) |
| Aggregated metrics | Indefinite | PostgreSQL (analytics schema) |
| Funnel snapshots | 2 years | PostgreSQL |
| Safety incident logs | 3 years | PostgreSQL (encrypted) |
| Revenue reports | 7 years | PostgreSQL + cold storage |

### 7.4 Database Schema

```sql
-- Partitioned events table
CREATE TABLE analytics.events (
    id BIGSERIAL,
    event_name VARCHAR(100) NOT NULL,
    user_id UUID,
    session_id VARCHAR(100),
    properties JSONB DEFAULT '{}',
    server_context JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Monthly partitions
CREATE TABLE analytics.events_2026_01 PARTITION OF analytics.events
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

-- Materialized view for daily metrics
CREATE MATERIALIZED VIEW analytics.daily_metrics AS
SELECT
    DATE(created_at) AS date,
    event_name,
    COUNT(DISTINCT user_id) AS unique_users,
    COUNT(*) AS total_events
FROM analytics.events
GROUP BY DATE(created_at), event_name;
```

---

## 8. Privacy Compliance

### 8.1 Data Anonymization

- All user IDs are pseudonymized in analytics tables using HMAC-SHA256
- IP addresses are truncated to /24 subnet before storage
- Location data is aggregated to state/region level, never stored at street level
- Free-text fields (messages, bios) are never included in analytics events

### 8.2 GDPR Compliance

| Requirement | Implementation |
|---|---|
| **Right to Access** | Users can export their analytics data via profile settings |
| **Right to Erasure** | Analytics data deleted within 30 days of account deletion |
| **Consent** | Analytics consent collected at signup, granular opt-out available |
| **Data Minimization** | Only essential events tracked; no tracking of message content |
| **Purpose Limitation** | Analytics data used only for stated purposes (product improvement, safety) |

### 8.3 Opt-Out Support

Users can opt out of non-essential analytics via:
- In-app settings: `Settings > Privacy > Analytics` toggle
- API endpoint: `PUT /api/v1/user/privacy/analytics` with `{"enabled": false}`
- Essential events (security, fraud detection) remain active regardless of opt-out

### 8.4 Data Access Controls

- Analytics database access restricted to analytics team and automated pipelines
- All queries logged and auditable
- PII fields excluded from analytical query permissions
- Service accounts use least-privilege roles

---

## 9. Implementation Status

### V1 — Basic Event Logging (Current)

- [x] Event schema definition and validation
- [x] Client-side `AnalyticsService` SDK
- [x] Server-side event ingestion endpoint
- [x] PostgreSQL storage with monthly partitioning
- [x] Basic DAU/MAU queries
- [x] Signup and subscription event tracking
- [ ] User opt-out toggle

### V2 — Funnel Analysis & Dashboards (Q2 2026)

- [ ] Conversion funnel computation pipeline
- [ ] Retention cohort analysis
- [ ] Admin dashboard with interactive charts
- [ ] A/B testing framework with experiment management
- [ ] Scheduled email reports
- [ ] Safety metrics dashboard
- [ ] Revenue metrics dashboard

### V3 — ML-Powered Insights (Q4 2026)

- [ ] Predictive churn modeling
- [ ] Anomaly detection on key metrics
- [ ] Natural language query interface for dashboards
- [ ] Real-time streaming analytics via Kafka
- [ ] Automated insight generation and alerts
- [ ] Cross-platform attribution modeling
