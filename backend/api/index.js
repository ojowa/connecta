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
      const requestIdHeader = req.headers['x-request-id'];
      const requestId = Array.isArray(requestIdHeader) ? requestIdHeader[0] : requestIdHeader;
      res.statusCode = 500;
      res.setHeader('content-type', 'application/json');
      res.end(
        JSON.stringify({
          success: false,
          error: {
            statusCode: 500,
            code: 'INTERNAL_SERVER_ERROR',
            error: 'Internal Server Error',
            message: 'Internal server error',
            timestamp: new Date().toISOString(),
            path: req.originalUrl || req.url,
            method: req.method,
            requestId,
          },
        }),
      );
    }
  }
};
