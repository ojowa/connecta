# SDD 17: Performance & Optimization

## 1. Performance Budget

OJChat targets a responsive, low-bandwidth-friendly experience optimized for Nigerian mobile networks (average 15-25 Mbps 4G, variable 3G coverage).

| Metric | Budget | Measurement |
|---|---|---|
| **App Size (install)** | <50 MB | iOS App Store / Google Play |
| **App Size (OTA update)** | <10 MB | Expo OTA bundle |
| **Time to Interactive** | <3 seconds | On 3G network, mid-range device |
| **First Contentful Paint** | <1.5 seconds | Lighthouse / custom metric |
| **API Response Time (p95)** | <200 ms | Measured at API gateway |
| **API Response Time (p99)** | <500 ms | Measured at API gateway |
| **JS Bundle Size (main)** | <5 MB | Webpack bundle analyzer |
| **Image Cache Hit Rate** | >85% | Measured at CDN / client |
| **Offline Support** | Read-only for cached data | Network failure handling |

---

## 2. API Performance

### 2.1 Connection Pooling (PgBouncer)

All PostgreSQL connections are managed through PgBouncer in transaction mode:

| Parameter | Value |
|---|---|
| Pool mode | Transaction |
| Default pool size | 20 connections per service |
| Max pool size | 50 connections per service |
| Reserve pool size | 5 connections |
| Client idle timeout | 300 seconds |
| Server idle timeout | 600 seconds |

Services connect to PgBouncer on `localhost:6432`, which multiplexes to PostgreSQL on `localhost:5432`. This prevents connection exhaustion under load and reduces PostgreSQL memory overhead.

### 2.2 Redis Caching

Redis is used for multiple caching layers:

| Cache Layer | TTL | Invalidation Strategy |
|---|---|---|
| **Session store** | 24 hours | On logout, on password change |
| **Feed cache** | 5 minutes | Write-through on profile/match changes |
| **Rate limit counters** | 1 minute (sliding window) | Automatic expiry |
| **User profile cache** | 15 minutes | Write-through on profile update |
| **Match recommendations** | 10 minutes | Regenerated on swipe actions |
| **Feature flags** | 5 minutes | Polling from admin settings |
| **OTP codes** | 5 minutes | One-time use, auto-delete |

### 2.3 Query Optimization

**Indexing Strategy:**
- All foreign keys indexed
- Composite indexes for common query patterns (e.g., `(user_id, created_at DESC)` for feed queries)
- Partial indexes for filtered queries (e.g., `WHERE status = 'active'`)
- Covering indexes for frequently accessed small tables

**Query Patterns:**
- All list queries use cursor-based pagination (no OFFSET)
- N+1 queries prevented via eager loading and DataLoader pattern
- Slow query logging enabled for queries >200ms
- EXPLAIN ANALYZE reviewed quarterly for top 20 queries

### 2.4 N+1 Prevention

The `DataLoader` pattern is used across all microservices:

```typescript
// Example: Match loader
@Injectable()
export class MatchLoader {
  private loader = new DataLoader<string, Match>(async (ids) => {
    const matches = await this.matchRepository.findByIds(ids);
    return ids.map(id => matches.find(m => m.id === id) || null);
  });

  load(id: string): Promise<Match> {
    return this.loader.load(id);
  }
}
```

---

## 3. Mobile Performance

### 3.1 Hermes Engine

Hermes is enabled for both iOS and Android builds:

- **Startup time**: Hermes precompiled bytecode reduces JS parse time by ~50%
- **Memory**: Lower memory footprint compared to JavaScriptCore
- **Bundle size**: Hermes-optimized bundles are ~20% smaller

### 3.2 FlatList Optimization

Profile feed and match lists use optimized FlatList configuration:

| Parameter | Value | Rationale |
|---|---|---|
| `initialNumToRender` | 10 | Balances startup speed with content |
| `maxToRenderPerBatch` | 5 | Reduces frame drops during scroll |
| `windowSize` | 5 | Keeps 5 screens worth of content rendered |
| `removeClippedSubviews` | true | Frees memory for off-screen items |
| `getItemLayout` | Defined | Enables scroll-to-index without measurement |
| `keyExtractor` | Unique ID | Prevents unnecessary re-renders |

### 3.3 Lazy Loading

- Screen navigation uses React.lazy() with Suspense boundaries
- Images lazy-loaded with `expo-image` progressive loading
- Below-the-fold content loaded on scroll events
- Modals and overlays loaded on demand, not at mount

### 3.4 Image Caching (expo-image)

| Configuration | Value |
|---|---|
| Cache policy | `memory-disk` |
| Disk cache size | 200 MB |
| Memory cache size | 50 MB |
| Transition | Fade-in (200ms) |
| Placeholder | Blurred thumbnail (LQIP) |
| Format | WebP with JPEG fallback |

Profile photos are served in multiple sizes via CDN:
- Thumbnail: 100x100px (list views)
- Medium: 400x400px (match cards)
- Full: 1080x1080px (profile detail)

### 3.5 Offline-First Architecture

| Feature | Offline Behavior |
|---|---|
| Profile viewing | Cached profiles viewable offline |
| Match list | Last-synced match list available |
| Messages | Read-only access to cached messages |
| Swipe actions | Queued locally, synced when online |
| Profile edits | Queued locally, synced when online |
| Search | Not available offline |
| New matches | Not available offline |

Offline queue is managed by a local SQLite database that syncs with the server when connectivity is restored. Conflict resolution uses last-write-wins for profile edits and server-authoritative for match actions.

---

## 4. Database Performance

### 4.1 Indexes

All query patterns are supported by appropriate indexes:

```sql
-- User lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_status ON users(status) WHERE status = 'active';

-- Feed queries
CREATE INDEX idx_profiles_user_id_status ON profiles(user_id, status);
CREATE INDEX idx_profiles_location ON profiles USING GIST(location);
CREATE INDEX idx_profiles_created_at ON profiles(created_at DESC);

-- Match queries
CREATE INDEX idx_matches_user1 ON matches(user1_id, created_at DESC);
CREATE INDEX idx_matches_user2 ON matches(user2_id, created_at DESC);
CREATE INDEX idx_matches_pair ON matches(user1_id, user2_id);

-- Message queries
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id, created_at DESC);

-- Analytics
CREATE INDEX idx_events_name_created ON events(event_name, created_at);
CREATE INDEX idx_events_user_created ON events(user_id, created_at);
```

### 4.2 Materialized Views

Pre-computed views for expensive analytical queries:

```sql
-- Daily active users
CREATE MATERIALIZED VIEW mv_dau AS
SELECT DATE(created_at) AS date, COUNT(DISTINCT user_id) AS dau
FROM events
WHERE event_name = 'app_open'
GROUP BY DATE(created_at);

-- User retention cohorts
CREATE MATERIALIZED VIEW mv_retention AS
SELECT
    DATE_TRUNC('week', signup_date) AS cohort_week,
    days_since_signup,
    COUNT(DISTINCT user_id) AS active_users
FROM user_activity
GROUP BY 1, 2;

-- Refresh schedule
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dau;
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_retention;
```

### 4.3 Read Replicas (V2)

- Primary database handles all writes
- Read replicas handle analytical queries and dashboard reads
- Replica lag monitored; alerts fire at >5 seconds lag
- Connection routing via application-level configuration

### 4.4 Table Partitioning

Large tables are partitioned by time:

| Table | Partition Key | Strategy |
|---|---|---|
| `events` | `created_at` | Monthly range |
| `messages` | `created_at` | Monthly range |
| `daily_metrics` | `date` | Monthly range |

---

## 5. CDN & Caching

### 5.1 Static Asset CDN

All static assets are served via CDN:

| Asset Type | Cache-Control | CDN TTL |
|---|---|---|
| JS bundles | `public, max-age=31536000, immutable` | 1 year |
| CSS bundles | `public, max-age=31536000, immutable` | 1 year |
| Images (profile) | `public, max-age=86400` | 1 day |
| Fonts | `public, max-age=31536000, immutable` | 1 year |
| Expo OTA bundles | `public, max-age=300` | 5 minutes |

### 5.2 API Response Caching

| Endpoint Category | Cache Strategy | TTL |
|---|---|---|
| Public profiles | CDN cache + client cache | 5 minutes |
| Match feed | Client-side only | 2 minutes |
| User profile (own) | Client-side only | 1 minute |
| App config / feature flags | CDN cache | 5 minutes |
| Search results | No cache | — |
| Messages | No cache | — |

### 5.3 Cache Headers

```typescript
// Example: Profile endpoint cache headers
@Get('profiles/:id')
@CacheControl({ maxAge: 300, scope: CacheScope.PUBLIC })
async getProfile(@Param('id') id: string) {
  return this.profileService.findById(id);
}
```

---

## 6. Bundle Optimization

### 6.1 Code Splitting

The mobile app uses route-based code splitting:

```
src/
  screens/
    Auth/           → AuthBundle (~200KB)
    Onboarding/     → OnboardingBundle (~150KB)
    Home/           → HomeBundle (~500KB)
    Matching/       → MatchingBundle (~400KB)
    Messaging/      → MessagingBundle (~300KB)
    Profile/        → ProfileBundle (~250KB)
    Settings/       → SettingsBundle (~150KB)
    Admin/          → AdminBundle (~350KB)
```

### 6.2 Tree Shaking

- Unused exports eliminated via ES module static analysis
- Lodash replaced with `lodash-es` for tree shaking
- Date libraries: `date-fns` used instead of `moment` (avoids 300KB+ bundle)
- Icon library: Individual icon imports instead of full icon set

### 6.3 Lazy Imports

```typescript
// Heavy modules loaded on demand
const MatchingScreen = React.lazy(() => import('./screens/Matching'));
const VideoCallScreen = React.lazy(() => import('./screens/VideoCall'));
const AdminDashboard = React.lazy(() => import('./screens/Admin'));
```

### 6.4 Dynamic Requires

Native modules and platform-specific code loaded dynamically:

```typescript
// Platform-specific optimizations
const PlatformOptimizer = Platform.select({
  ios: () => require('./optimizers/ios'),
  android: () => require('./optimizers/android'),
})();
```

---

## 7. Monitoring

### 7.1 Sentry Integration

| Configuration | Value |
|---|---|
| DSN | Environment-specific, stored in secrets manager |
| Sample rate (traces) | 20% in production, 100% in staging |
| Sample rate (errors) | 100% |
| Release tracking | Git commit SHA tagged on build |
| Source maps | Uploaded on CI build, deleted after 30 days |
| PII scrubbing | Enabled — email, phone, name redacted |

### 7.2 Performance Traces

Automatically captured traces:

| Trace Type | Description |
|---|---|
| API request | Full request lifecycle (gateway → service → DB → response) |
| Database query | Individual query execution time |
| Cache operation | Redis get/set latency |
| Image load | Client-side image load time |
| Screen render | React component mount + render time |
| Navigation | Screen transition time |

### 7.3 Custom Metrics

Business-specific metrics tracked via StatsD/DataDog:

```
# API metrics
api.request.count.{method}.{endpoint}.{status}
api.request.duration.{method}.{endpoint}.p95
api.request.duration.{method}.{endpoint}.p99

# Business metrics
user.signup.count.{method}
user.subscription.purchase.{tier}
match.created.count
message.sent.count
report.submitted.count.{category}

# Infrastructure metrics
db.query.duration.{service}.p95
redis.operation.duration.{operation}.p95
cache.hit.rate.{layer}
```

### 7.4 APM Integration

- Distributed tracing across all 13 microservices
- Service dependency map auto-generated from trace data
- Bottleneck detection on slow request paths
- Automated alerts on latency regression (>20% increase over 7-day baseline)

---

## 8. Scalability

### 8.1 Horizontal Scaling

Each microservice is containerized and independently scalable:

| Service | Scaling Trigger | Min Instances | Max Instances |
|---|---|---|---|
| api-gateway | CPU >60% | 2 | 10 |
| matching-service | CPU >60% | 2 | 8 |
| messaging-service | CPU >60% or connections >1000 | 3 | 12 |
| admin-service | Queue depth >1000 | 2 | 6 |
| notification-service | Queue depth >500 | 2 | 8 |
| All others | CPU >70% | 1 | 6 |

### 8.2 Container Orchestration

- Kubernetes (EKS/GKE) for container orchestration
- Horizontal Pod Autoscaler (HPA) for reactive scaling
- Cluster Autoscaler for node-level scaling
- Pod Disruption Budgets for zero-downtime deployments

### 8.3 Event-Driven Architecture

Inter-service communication uses message queues for decoupling:

| Queue | Producer | Consumer | Purpose |
|---|---|---|---|
| `match.events` | matching-service | notification-service | New match events |
| `message.events` | messaging-service | notification-service | New message events |
| `report.events` | moderation-service | notification-service | New report events |
| `notification.push` | notification-service | push-worker | Push notification delivery |

### 8.4 Database Sharding (V3)

When single-node PostgreSQL reaches limits:

- Shard by `user_id` using consistent hashing
- Shard key: `user_id % 1024` mapped to shard locations
- Cross-shard queries handled by application-level scatter-gather
- Shard migration tooling for rebalancing

---

## 9. Implementation Status

### V1 — Basic Optimization (Current)

- [x] Hermes engine enabled for Android and iOS
- [x] FlatList optimization for feed screens
- [x] Image caching with expo-image
- [x] Basic code splitting by screen
- [x] Tree shaking configured in Metro bundler
- [x] Sentry error tracking integrated
- [x] API response time monitoring
- [x] PostgreSQL connection pooling via PgBouncer
- [x] Redis session caching
- [ ] Performance budget enforcement in CI
- [ ] Lighthouse CI for admin panel

### V2 — CDN + Caching (Q2 2026)

- [ ] CDN for static assets and images
- [ ] API response caching with Cache-Control headers
- [ ] Materialized views for analytics queries
- [ ] Lazy loading for all screens and heavy modules
- [ ] Offline-first architecture with local SQLite cache
- [ ] Performance traces in Sentry
- [ ] Custom metrics via StatsD/DataDog
- [ ] Read replicas for analytical queries
- [ ] Table partitioning for events and messages

### V3 — Full APM + Auto-Scaling (Q4 2026)

- [ ] Distributed tracing across all microservices
- [ ] Kubernetes HPA with custom metrics scaling
- [ ] Database sharding strategy
- [ ] Auto-generated service dependency maps
- [ ] Latency regression detection and alerts
- [ ] A/B test performance impact analysis
- [ ] Predictive auto-scaling based on traffic patterns
- [ ] Zero-downtime deployment validation
- [ ] Performance budget automated rollback
