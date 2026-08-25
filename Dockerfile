FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY libs/ ./libs/
COPY apps/ ./apps/
COPY tsconfig*.json ./
COPY nest-cli.json ./

RUN npm run build:all

FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist/ ./dist/

ENV NODE_ENV=production

EXPOSE 3000

CMD ["sh", "-c", "node dist/apps/auth-service/src/main.js & node dist/apps/users-service/src/main.js & node dist/apps/matching-service/src/main.js & node dist/apps/chat-service/src/main.js & node dist/apps/calls-service/src/main.js & node dist/apps/media-service/src/main.js & node dist/apps/payments-service/src/main.js & node dist/apps/notifications-service/src/main.js & node dist/apps/search-service/src/main.js & node dist/apps/content-service/src/main.js & node dist/apps/support-service/src/main.js & node dist/apps/admin-service/src/main.js & node dist/apps/api-gateway/src/main.js"]
