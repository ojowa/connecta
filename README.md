# Connecta

Monorepo for the **OJChat / Connecta** dating platform.

## Repository layout

| Path | What it is |
|---|---|
| [`backend/`](backend/) | Standalone NestJS backend — 13 services behind an API gateway, TypeORM/PostgreSQL, Redis, Socket.IO. **Start here:** [`backend/README.md`](backend/README.md) |
| [`admin-web/`](admin-web/) | Next.js admin dashboard (own `package.json`; deploys to Azure Static Web Apps) |
| [`ojchat-mobile/`](ojchat-mobile/) | Expo / React Native mobile app (own `package.json`) |
| [`docs/`](docs/) | Numbered product & technical specs (01 executive summary … 23 code audit) |

Each app owns its own dependencies and tooling — install and run them
independently:

```bash
# backend
cd backend && npm ci && npm run dev

# admin web
cd admin-web && npm ci && npm run dev   # Next.js on :3013

# mobile
cd ojchat-mobile && npm ci && npx expo start
```

## CI/CD

- **Backend** → Azure Web App `ojchatapi` via
  `.github/workflows/main_ojchatapi.yml` (triggers on `backend/**` changes)
- **Admin web** → Azure Static Web Apps (configured in the Azure portal / SWA CLI)
- **Mobile** → EAS builds (`ojchat-mobile/eas.json`)

See [`backend/README.md`](backend/README.md) for env vars, scripts, and
architecture details.
