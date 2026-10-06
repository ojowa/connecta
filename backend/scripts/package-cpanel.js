#!/usr/bin/env node
'use strict';

/**
 * Assembles a cPanel-ready bundle in backend/out/cpanel/ (gitignored).
 *
 * Usage:
 *   node scripts/package-cpanel.js          # builds only if dist/ is missing
 *   node scripts/package-cpanel.js --build  # force a fresh build first
 *   node scripts/package-cpanel.js --zip    # also create out/cpanel.zip
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'out', 'cpanel');
const ZIP = path.join(ROOT, 'out', 'cpanel.zip');

const FILES = [
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'ormconfig.ts',
  'server.js',
  '.env.example',
];
const DIRS = ['dist', 'migrations'];

const args = process.argv.slice(2);
const forceBuild = args.includes('--build');
const wantZip = args.includes('--zip');

const gatewayEntry = path.join(ROOT, 'dist', 'apps', 'api-gateway', 'src', 'main.js');

function log(msg) {
  console.log(`[package:cpanel] ${msg}`);
}

function build() {
  log('running npm run build:all ...');
  const result = spawnSync('npm run build:all', {
    cwd: ROOT,
    stdio: 'inherit',
    shell: true,
  });
  if (result.status !== 0) {
    console.error('[package:cpanel] build failed');
    process.exit(result.status || 1);
  }
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

function dirSize(dir) {
  let total = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    total += entry.isDirectory() ? dirSize(full) : fs.statSync(full).size;
  }
  return total;
}

function writeDeployNotes() {
  const notes = `cPanel deployment checklist
===========================

1. Upload
   - Upload the CONTENTS of this folder to your cPanel Node app root
     (e.g. ~/backend/), keeping this layout: server.js, dist/, package.json, ...
   - Do NOT forget package-lock.json (used by cPanel's NPM install).

2. cPanel -> Setup Node.js App -> Create Application
   - Node.js version : 22.x
   - Application root : (folder you uploaded to)
   - Startup file     : server.js

3. NPM install
   - Click "Run NPM Install" in the Node.js app screen.
   - NOTE: for step 4 (migrations) you need devDependencies (ts-node):
     run "npm install" (full) via cPanel Terminal instead if install was production-only.

4. Database (Neon - NO cPanel database needed)
   - Create a project at https://neon.tech and copy the connection string
     (Postgres -> Connection string).
       * App runtime: use the POOLED endpoint (host contains "-pooled.")
       * Migrations / seed: use the DIRECT endpoint
       * Keep ?sslmode=require (Neon requires TLS)
   - Copy .env.example to .env and set DATABASE_URL, JWT_SECRET, ADMIN_JWT_SECRET.
   - If Neon IP restrictions are enabled, allow your machine (and server) IP.
   - Run migrations from the app root (your machine or cPanel Terminal):
       npm run migration:run
   - Optional first admin user:
       npx ts-node apps/admin-service/src/seed-admin.ts
     (args: [email] [password] ["Full Name"] [role])

5. Start / Restart the application in cPanel.

6. Point clients at https://yourdomain.com/v1
   - health check: https://yourdomain.com/v1/health
   - mobile  : EXPO_PUBLIC_API_URL=https://yourdomain.com/v1
   - admin   : NEXT_PUBLIC_API_URL=https://yourdomain.com/v1

SECURITY: internal services listen on 0.0.0.0:3001-3012. Block ports
3001-3012 in your firewall (CSF/WHM) so only the gateway port is public.

REQUIREMENTS: Node.js >= 22 in cPanel, an external PostgreSQL database
(Neon recommended - cPanel's local MySQL/Postgres is NOT needed), and a host
that allows binding local ports (VPS/dedicated cPanel - shared/CageFS
hosting usually does not).
`;
  fs.writeFileSync(path.join(OUT, 'DEPLOY.txt'), notes, 'utf8');
}

function makeZip() {
  log('creating out/cpanel.zip ...');
  fs.rmSync(ZIP, { force: true });
  let result;
  if (process.platform === 'win32') {
    // bsdtar writes forward-slash entry names; Compress-Archive writes
    // backslashes which break extraction on Linux (cPanel).
    result = spawnSync('tar', ['-a', '-cf', ZIP, '-C', OUT, '.'], {
      stdio: 'inherit',
    });
  } else {
    result = spawnSync('zip', ['-r', ZIP, '.'], { cwd: OUT, stdio: 'inherit' });
  }
  if (result.error || result.status !== 0) {
    console.error('[package:cpanel] zip failed - zip the folder manually');
    return;
  }
  log(`wrote ${ZIP}`);
}

// --- main -----------------------------------------------------------------

if (forceBuild || !fs.existsSync(gatewayEntry)) {
  build();
}

for (const file of FILES) {
  if (!fs.existsSync(path.join(ROOT, file))) {
    console.error(`[package:cpanel] missing required file: ${file}`);
    process.exit(1);
  }
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

for (const file of FILES) {
  fs.copyFileSync(path.join(ROOT, file), path.join(OUT, file));
}
for (const dir of DIRS) {
  copyRecursive(path.join(ROOT, dir), path.join(OUT, dir));
}

writeDeployNotes();

const mb = (dirSize(OUT) / (1024 * 1024)).toFixed(1);
log(`bundle ready: ${OUT} (${mb} MB)`);
log('contents: ' + fs.readdirSync(OUT).join(', '));

if (wantZip) {
  makeZip();
} else {
  log('next: upload the folder, or re-run with --zip to create out/cpanel.zip');
}
