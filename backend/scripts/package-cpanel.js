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
  'app.js',
  '.env.example',
];
const DIRS = ['dist', 'migrations'];

const args = process.argv.slice(2);
const forceBuild = args.includes('--build');
const wantZip = args.includes('--zip');

const monolithEntry = path.join(ROOT, 'dist', 'apps', 'monolith', 'src', 'main.js');

function log(msg) {
  console.log(`[package:cpanel] ${msg}`);
}

function build() {
  log('running npm run build:monolith ...');
  const result = spawnSync('npm run build:monolith', {
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
  const notes = `cPanel deployment checklist (single-process monolith)
=====================================================

This bundle runs the WHOLE platform as ONE Node process (apps/monolith).
It does not spawn child processes and does not bind ports 3001-3012, so it
works on shared / CloudLinux (CageFS) cPanel hosting.

1. Upload
   - Upload the CONTENTS of this folder to your cPanel Node app root
     (e.g. ~/backend/), keeping this layout: app.js, dist/, package.json, ...
   - Do NOT forget package-lock.json (used by cPanel's NPM install).

2. cPanel -> Application Manager (the old "Setup Node.js App") -> Create Application
   - Node.js version  : 22.x
   - Application root : (folder you uploaded to)
   - Startup file     : app.js      <-- IMPORTANT (default Passenger name)
   - Application URL  : your domain / subdomain

3. NPM install
   - Click "Run NPM Install" in the Application Manager.
   - Migrations use ts-node (a devDependency). If the install was
     production-only and you need to run migrations on the host, run a full
     "npm install" via cPanel Terminal, or run migrations from your own machine
     against the same DATABASE_URL instead.

4. Database (external PostgreSQL - NO cPanel database needed)
   - Create a project at https://neon.tech and copy the connection string.
       * App runtime: use the POOLED endpoint (host contains "-pooled.")
       * Migrations / seed: use the DIRECT endpoint
       * Keep ?sslmode=require (Neon requires TLS)
   - Copy .env.example to .env and set DATABASE_URL, JWT_SECRET, ADMIN_JWT_SECRET.
   - Run migrations from the app root (your machine or cPanel Terminal):
       npm run migration:run
   - Optional first admin user:
       npx ts-node apps/monolith/src/modules/admin/seed-admin.ts

5. Restart the application in Application Manager, then check:
   https://yourdomain.com/v1/health
   https://yourdomain.com/docs

6. Point clients at https://yourdomain.com/v1
   - mobile : EXPO_PUBLIC_API_URL=https://yourdomain.com/v1
   - admin  : NEXT_PUBLIC_API_URL=https://yourdomain.com/v1

WHY THIS AVOIDS ERROR 127
-------------------------
- Startup file is app.js (Passenger's default name) -> no "file not found".
- No child_process.spawn()/fork() and no internal ports -> nothing for the
  shell to fail to execute ("command not found"), and no LVE nproc/port limits.
- Only runtime dependencies are required at boot; builds/migrations are not
  run through npm lifecycle scripts on the host.

REQUIREMENTS: Node.js >= 22 enabled in cPanel and an external PostgreSQL
database (Neon recommended). cPanel's local MySQL/Postgres is NOT needed.
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

if (forceBuild || !fs.existsSync(monolithEntry)) {
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
