'use strict';

process.env.CONNECTA_SERVERLESS = '1';

const express = require('express');
const { createApp } = require('../dist/apps/monolith/src/main.js');

const server = express();
let appPromise;

function getApp() {
  if (!appPromise) {
    appPromise = createApp(server).then((app) => app.init());
  }
  return appPromise;
}

function normalizeUrl(req) {
  const url = req.url || '/';
  if (url === '/api/index' || url === '/api/index/') {
    req.url = '/';
  } else if (url.startsWith('/api/index/')) {
    req.url = url.slice('/api/index'.length);
  } else if (url.startsWith('/api/index?')) {
    req.url = '/' + url.slice('/api/index'.length);
  }
}

module.exports = async function handler(req, res) {
  try {
    await getApp();
    normalizeUrl(req);
    return server(req, res);
  } catch (err) {
    console.error('[vercel] Failed to initialize NestJS app', err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify({ statusCode: 500, message: 'Internal server error' }));
    }
  }
};
