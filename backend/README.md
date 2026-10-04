# Connecta Backend (OJChat)

Standalone backend service for the OJChat/Connecta dating platform. NestJS
monolith split into 13 microservices behind a single API gateway, with
PostgreSQL (TypeORM), Redis, and Socket.IO.

> This folder is fully self-contained: it has its own `package.json`,
> `tsconfig*`, `nest-cli.json`, migrations, and deploy scripts. It can be
> lifted into its own repository without changes.

## Layout

```
backend/
├── apps/                  # 13 NestJS services (each with src/main.ts)
│   ├── api-gateway/       # public entrypoint — /v1 REST + proxying
│   ├── auth-service/      # authentication, JWT, 2FA
│   ├── users-service/     # profiles, account management
│   ├── matching-service/  # matchmaking engine + AI scoring
│   ├── chat-service/      # conversations, messages, Socket.IO
│   ├── calls-service/     # WebRTC voice/video signalling
│   ├── media-service/     # uploads (local/S3/R2)
│   ├── payments-service/  # subscriptions, Paystack/Flutterwave
│   ├── notifications-service/
│   ├── search-service/
│   ├── content-service/   # moments, feeds
│   ├── support-service/   # tickets, appeals
│   └── admin-service/     # moderation & admin APIs
├── libs/                  # shared libraries (tsconfig path alias @app/*)
│   ├── common/            # entities, constants, storage providers
│   ├── config/            # AppConfigService (env access + validation)
│   ├── database/          # TypeORM module/data-source
│   └── logger/            # logger module, interceptor
├── migrations/            # TypeORM migrations (*.ts, run by migration:run)
│   └── archive/           # legacy raw SQL — NOT executed (see its README)
├── config/                # non-service configuration (azure/)
├── scripts/               # operational one-off scripts
├── startup.sh             # Azure App Service startup (runs all 13 services)
└── dist/                  # build output (gitignored)
```

## Requirements

- Node.js >= 22, npm >= 10
- PostgreSQL 15+ (set `DATABASE_URL`)
- Redis (set `REDIS_URL`)

## Getting started

```bash
npm ci
npm run dev          # gateway (watch) + all 12 services, or:
npm run start:dev    # gateway only, watch mode
npm run build:all    # compile all 13 services to dist/
```

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Run gateway + all services in watch mode |
| `npm run build:all` | Build all 13 services |
| `npm run typecheck` | `tsc --noEmit` over apps + libs |
| `npm run lint` | ESLint (all apps + libs) with `--fix` |
| `npm test` / `test:watch` / `test:cov` | Jest unit tests |
| `npm run migration:run` | Apply pending TypeORM migrations |
| `npm run migration:revert` | Revert last migration |
| `npm run migration:show` | List migrations and their status |
| `npm run start:monolith` | Run all built services concurrently (prod) |

## Environment variables

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes* | `postgresql://user:pass@host:5432/db` (*or `DB_HOST`/`DB_USERNAME`/`DB_PASSWORD`/`DB_NAME`) |
| `JWT_SECRET` | yes | signing secret for access/refresh tokens |
| `ADMIN_JWT_SECRET` | yes | separate secret for admin tokens |
| `REDIS_URL` | yes | `redis://host:6379` |
| `PORT` / `APP_PORT` | no | HTTP port, default `3000` |
| `NODE_ENV` | no | `development` / `production` |
| `EXPO_PUSH_TOKEN` | for prod | Expo push notifications |
| `PAYSTACK_SECRET_KEY` / `PAYSTACK_PUBLIC_KEY` | for payments | |
| `SMTP_*`, `FIREBASE_*`, `CLOUDINARY_*` | optional | see `libs/config/src/config.service.ts` |

Local development uses `.env` (loaded via `dotenv` in each service entrypoint).

## Architecture notes

- **Path alias** `@app/*` → `libs/*/src`, declared in `tsconfig.json` and
  resolved at build time into relative requires (plus `tsconfig-paths/register`
  as a runtime fallback).
- **API gateway** exposes everything under `/v1` and proxies to the other
  services; the mobile app and admin web talk only to the gateway.
- **Deploy (Azure):** `.github/workflows/main_ojchatapi.yml` builds
  `backend/**` on pushes to `main` and deploys to Azure Web App `ojchatapi`,
  starting via `backend/startup.sh` (runs migrations, then all 13 services).
- **Deploy (Render):** `../render.yaml` blueprint runs `cd backend && …`.
