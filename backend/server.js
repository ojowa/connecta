'use strict';

/**
 * cPanel / Passenger launcher.
 *
 * cPanel's "Setup Node.js App" runs a single startup file. This launcher:
 *   1. spawns the 12 internal services (fixed ports 3001-3012), restarting
 *      any that crash after 5 seconds, and
 *   2. loads the api-gateway in THIS process, so cPanel/Passenger binds it
 *      to the port assigned to the application (process.env.PORT).
 *
 * Requires: dist/ built (npm run build:all) and .env present in the app root.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

const INTERNAL_SERVICES = [
  'auth-service', // :3001
  'users-service', // :3002
  'matching-service', // :3003
  'chat-service', // :3004
  'calls-service', // :3005
  'media-service', // :3006
  'payments-service', // :3007
  'notifications-service', // :3008
  'search-service', // :3009
  'content-service', // :3010
  'support-service', // :3011
  'admin-service', // :3012
];

const GATEWAY = path.join(ROOT, 'dist', 'apps', 'api-gateway', 'src', 'main.js');

function die(message) {
  console.error(`[launcher] FATAL: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(GATEWAY)) {
  die(`dist/ not found - run "npm run build:all" first (expected ${GATEWAY})`);
}
if (!fs.existsSync(path.join(ROOT, '.env'))) {
  console.warn('[launcher] WARNING: no .env found in app root - relying on cPanel env vars');
}

const children = new Map();

function startService(name) {
  const entry = path.join(ROOT, 'dist', 'apps', name, 'src', 'main.js');
  const child = spawn(process.execPath, [entry], {
    cwd: ROOT,
    env: process.env,
    stdio: 'inherit',
  });
  children.set(name, child);

  child.on('error', (err) => {
    children.delete(name);
    console.error(`[launcher] ${name} failed to start: ${err.message}; retrying in 5s`);
    setTimeout(() => startService(name), 5000);
  });

  child.on('exit', (code, signal) => {
    children.delete(name);
    if (shuttingDown) return;
    console.error(
      `[launcher] ${name} exited (code=${code}, signal=${signal}); restarting in 5s`,
    );
    setTimeout(() => startService(name), 5000);
  });
}

let shuttingDown = false;

function shutdown(reason, exitCode) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[launcher] ${reason} - stopping ${children.size} service(s)`);
  for (const child of children.values()) {
    child.removeAllListeners('exit');
    child.kill('SIGTERM');
  }
  setTimeout(() => process.exit(exitCode), 1000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT received', 0));
process.on('SIGTERM', () => shutdown('SIGTERM received', 0));
process.on('uncaughtException', (err) => {
  console.error('[launcher] uncaughtException in gateway process:', err);
  shutdown('gateway crashed', 1);
});
process.on('unhandledRejection', (reason) => {
  console.error('[launcher] unhandledRejection in gateway process:', reason);
});

// Clean up strays if the parent dies without a signal (e.g. Passenger stop).
process.on('exit', () => {
  for (const child of children.values()) {
    try {
      child.kill('SIGKILL');
    } catch {
      /* already gone */
    }
  }
});

console.log(`[launcher] starting ${INTERNAL_SERVICES.length} internal services...`);
for (const name of INTERNAL_SERVICES) {
  startService(name);
}

console.log('[launcher] loading api-gateway in-process (PORT=%s)', process.env.PORT || 3000);
require(GATEWAY);
