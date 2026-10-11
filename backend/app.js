'use strict';

/**
 * cPanel / Passenger startup file for the single-process monolith.
 *
 * In cPanel's Application Manager set "Application startup file" to `app.js`
 * (the default it looks for). Passenger assigns process.env.PORT; the app binds
 * it. This launcher spawns NO child processes and binds NO internal ports, so it
 * works on shared/CageFS hosting where forking and ports 3001-3012 are blocked.
 *
 * Requires: `npm run build:monolith` output in dist/ and a .env in the app root.
 */

const path = require('path');

const entry = path.join(__dirname, 'dist', 'apps', 'monolith', 'src', 'main.js');

require(entry);
