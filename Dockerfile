# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY libs/ ./libs/
COPY apps/ ./apps/

RUN npm run build:all

# ---- Production Stage ----
FROM node:20-alpine AS runner

RUN apk add --no-cache tini

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist/ ./dist/

RUN addgroup -S ojchat && adduser -S ojchat -G ojchat
USER ojchat

ENV NODE_ENV=production

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3000/v1/health || exit 1

ENTRYPOINT ["/sbin/tini", "--"]

CMD ["npm", "run", "start:monolith"]
