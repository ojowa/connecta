# 19. Data Management

## 1. Overview

This document defines the data lifecycle, storage architecture, retention policies, backup strategies, and compliance measures for the OJChat platform. All data handling prioritizes user privacy and regulatory compliance across African markets.

## 2. Data Classification

| Classification | Examples                              | Protection Level        |
|----------------|---------------------------------------|--------------------------|
| Public         | Display name, bio, public photos      | Standard storage         |
| Private        | Messages, location history, preferences | Encrypted at rest      |
| Sensitive      | Payment info, auth tokens, phone numbers | AES-256 column encryption |
| Restricted     | Biometric data (if collected)         | Isolated storage, strict access |

## 3. Storage Architecture

| Store                | Purpose                              | Technology            |
|----------------------|--------------------------------------|-----------------------|
| Primary Database     | User data, profiles, messages        | PostgreSQL            |
| Cache / Sessions     | Session tokens, rate limiting, cache | Redis                 |
| Object Storage       | Profile photos, media attachments    | S3-compatible (MinIO) |
| Local Encrypted Store| Offline data, tokens on device       | SQLite + AES-256      |

## 4. Data Retention

| Data Type         | Retention Period          | Rationale                     |
|-------------------|---------------------------|-------------------------------|
| Messages          | Indefinite (E2EE)         | User-controlled, encrypted    |
| Media             | Until user/account deletion| User-owned content            |
| Analytics         | 2 years                   | Product improvement           |
| System Logs       | 90 days                   | Debugging, security audits    |
| Deleted Accounts  | 30-day grace period       | Recovery window               |

## 5. Backup Strategy

| Backup Type         | Frequency  | Retention | Storage Location     |
|---------------------|------------|-----------|----------------------|
| Automated DB Backup | Daily      | 30 days   | Same region (S3)     |
| Full Backup         | Weekly     | 90 days   | Same region (S3)     |
| Point-in-Time Recovery | Continuous | 7 days  | PostgreSQL WAL archive|
| Cross-Region Backup | Daily (V2) | 90 days   | Secondary region (S3)|

- Backups are encrypted at rest with AES-256
- Restore tested monthly via automated script

## 6. Migration Strategy

- **Tool**: TypeORM versioned migrations
- **Approach**: Forward-only migrations; rollback requires explicit rollback migration
- **Zero-Downtime**: Migrations split into additive → deploy → destructive phases
- **Review**: All migration files reviewed in PR before merge
- **Testing**: Migrations run against test database in CI pipeline

## 7. Data Export

- **User Export**: Users can request full data export via profile settings
- **Formats**: CSV and JSON download
- **Admin Export**: Admin panel supports filtered export (analytics, user segments)
- **Compliance**: Export available within 30 days of request (GDPR-aligned)
- **Automation**: Export job runs asynchronously, user notified when ready

## 8. Data Deletion

```
Soft Delete (account deactivation)
    ↓ 30-day grace period
Hard Delete (cascading)
    → User record removed
    → Messages anonymized (E2EE keys destroyed)
    → Media files deleted from object storage
    → Search index entries removed
    → Analytics data anonymized
```

- Users can reactivate within 30-day grace period
- Hard delete is irreversible and runs via background job

## 9. Encryption at Rest

| Data                     | Method        | Key Management         |
|--------------------------|---------------|------------------------|
| Sensitive DB columns     | AES-256       | App-level key rotation |
| Backups                  | AES-256       | Backup-specific keys   |
| Object storage           | SSE-S3 / SSE-KMS | AWS KMS             |
| Local device storage     | AES-256 (SQLCipher) | Device keychain |

- Key rotation: quarterly for application keys, annually for infrastructure keys
- Keys stored in AWS Secrets Manager / HashiCorp Vault

## 10. Implementation Status

| Phase | Scope | Status |
|-------|-------|--------|
| V1    | Basic daily backups + soft delete + grace period | Planned |
| V2    | Cross-region backups, point-in-time recovery | Planned |
| V3    | Full column-level encryption at rest, automated key rotation | Planned |
