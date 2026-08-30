FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

COPY libs/ ./libs/
COPY apps/ ./apps/
COPY migrations/ ./migrations/
COPY ormconfig.ts ./

RUN npm ci

RUN npm run build:all

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/libs ./libs
COPY --from=builder /app/node_modules/tsconfig-paths ./node_modules/tsconfig-paths
COPY --from=builder /app/node_modules/concurrently ./node_modules/concurrently
COPY --from=builder /app/node_modules/.bin/concurrently ./node_modules/.bin/concurrently

EXPOSE 3000 3001 3002 3003 3004 3005 3006 3007 3008 3009 3010 3011 3012

CMD ["npx", "concurrently", "--names", "gw,auth,usr,match,chat,call,media,pay,notif,search,content,support,admin", "--kill-others", \
  "node -r tsconfig-paths/register dist/apps/api-gateway/src/main.js", \
  "node -r tsconfig-paths/register dist/apps/auth-service/src/main.js", \
  "node -r tsconfig-paths/register dist/apps/users-service/src/main.js", \
  "node -r tsconfig-paths/register dist/apps/matching-service/src/main.js", \
  "node -r tsconfig-paths/register dist/apps/chat-service/src/main.js", \
  "node -r tsconfig-paths/register dist/apps/calls-service/src/main.js", \
  "node -r tsconfig-paths/register dist/apps/media-service/src/main.js", \
  "node -r tsconfig-paths/register dist/apps/payments-service/src/main.js", \
  "node -r tsconfig-paths/register dist/apps/notifications-service/src/main.js", \
  "node -r tsconfig-paths/register dist/apps/search-service/src/main.js", \
  "node -r tsconfig-paths/register dist/apps/content-service/src/main.js", \
  "node -r tsconfig-paths/register dist/apps/support-service/src/main.js", \
  "node -r tsconfig-paths/register dist/apps/admin-service/src/main.js"]