#!/bin/bash
# Startup script for OJChat monolith - runs all 13 services concurrently
# This script is deployed to Azure App Service and run as the startup command

set -e

echo "Starting OJChat monolith services..."

# Ensure we're in the right directory
cd /home/site/wwwroot

# Check if dist exists
if [ ! -d "dist" ]; then
  echo "ERROR: dist directory not found"
  exit 1
fi

# Run database migrations first
echo "Running database migrations..."
npm run migration:run || echo "Migration failed or already applied, continuing..."

# Run all services with concurrently
npx concurrently --names gw,auth,usr,match,chat,call,media,pay,notif,search,content,support,admin --kill-others \
  "node -r tsconfig-paths/register dist/apps/api-gateway/src/main.js" \
  "node -r tsconfig-paths/register dist/apps/auth-service/src/main.js" \
  "node -r tsconfig-paths/register dist/apps/users-service/src/main.js" \
  "node -r tsconfig-paths/register dist/apps/matching-service/src/main.js" \
  "node -r tsconfig-paths/register dist/apps/chat-service/src/main.js" \
  "node -r tsconfig-paths/register dist/apps/calls-service/src/main.js" \
  "node -r tsconfig-paths/register dist/apps/media-service/src/main.js" \
  "node -r tsconfig-paths/register dist/apps/payments-service/src/main.js" \
  "node -r tsconfig-paths/register dist/apps/notifications-service/src/main.js" \
  "node -r tsconfig-paths/register dist/apps/search-service/src/main.js" \
  "node -r tsconfig-paths/register dist/apps/content-service/src/main.js" \
  "node -r tsconfig-paths/register dist/apps/support-service/src/main.js" \
  "node -r tsconfig-paths/register dist/apps/admin-service/src/main.js"