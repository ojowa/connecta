FROM node:20-alpine AS builder

ARG SERVICE_NAME=api-gateway

WORKDIR /app
COPY package*.json ./
COPY libs/ ./libs/
COPY apps/ ./apps/
COPY tsconfig*.json ./
COPY nest-cli.json ./

RUN npm ci
RUN npm run build ${SERVICE_NAME}

FROM node:20-alpine AS runner

ARG SERVICE_NAME=api-gateway

WORKDIR /app
COPY --from=builder /app/dist/apps/${SERVICE_NAME}/src ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production

CMD ["sh", "-c", "node dist/main.js"]
