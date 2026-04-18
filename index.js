/**
 * OGVendors Theme Protection Server — v3 Architecture (Modular)
 *
 * The "Brain" — renders section HTML, serves critical CSS/JS,
 * and validates licenses. Shell sections on Shopify are empty containers;
 * this server fills them with content for licensed stores only.
 *
 * Modules:
 *   src/routes/       — Route handlers (auth, render, stripe, admin, support, loader, licenses)
 *   src/middleware/    — Auth, rate limiting, validation
 *   src/services/     — Business logic (store, license, stripe, email, kv)
 *   src/renderers/    — Section HTML renderers
 *   src/utils/        — Shared utilities
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
const { randomUUID } = require('crypto');
const logger = require('./src/utils/logger');
const rateLimit = require('./src/middleware/rateLimit');

// Initialize store (must happen before routes import it)
require('./src/services/storeService');

const { handleWebhook, router: stripeRouter } = require('./src/routes/stripe');
const authRouter = require('./src/routes/auth');
const renderRouter = require('./src/routes/render');
const adminRouter = require('./src/routes/admin');
const supportRouter = require('./src/routes/support');
const loaderRouter = require('./src/routes/loader');
const licensesRouter = require('./src/routes/licenses');
const emailRouter = require('./src/routes/email');
const systemRouter = require('./src/routes/system');
const customerRouter = require('./src/routes/customer');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Security Middleware ─────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://api.stripe.com", "https://*.upstash.io"],
      frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com"],
      fontSrc: ["'self'", "https:", "data:"],
    },
  },
}));

// CORS: permissive for public API (Shopify stores call from any domain),
// restricted for admin endpoints when ALLOWED_ORIGINS is set
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : null;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (!ALLOWED_ORIGINS) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(null, false);
  },
  methods: ['GET', 'POST', 'DELETE', 'PUT'],
  allowedHeaders: ['Content-Type', 'X-Admin-Key', 'X-Request-Id'],
  exposedHeaders: ['X-Request-Id'],
}));

// ─── Stripe Webhook (raw body — must be before express.json) ────
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), handleWebhook);

// ─── Body Parser ─────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));

// Handle malformed JSON payloads with a controlled response.
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'invalid_json', request_id: req.requestId || null });
  }
  return next(err);
});

// ─── Request Tracking & Access Logs ──────────────────────────────
app.use((req, res, next) => {
  const startedAt = Date.now();
  const requestIdHeader = req.headers['x-request-id'];
  const sanitizedRequestId = typeof requestIdHeader === 'string'
    ? requestIdHeader.trim().replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 100)
    : '';
  const requestId = sanitizedRequestId
    ? sanitizedRequestId
    : randomUUID();
  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);

  res.on('finish', () => {
    logger.info({
      request_id: requestId,
      method: req.method,
      path: req.originalUrl,
      status_code: res.statusCode,
      duration_ms: Date.now() - startedAt,
      ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown',
      user_agent: req.headers['user-agent'] || '',
    }, 'http_request');
  });

  next();
});

// ─── Serve Next.js Static Site ──────────────────────────────────
const siteDir = path.join(__dirname, 'site');

app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  if (req.path === '/') return next();
  const cleanPath = req.path.replace(/\/$/, '');
  const htmlPath = path.join(siteDir, cleanPath + '.html');
  if (fs.existsSync(htmlPath)) return res.sendFile(htmlPath);
  const indexPath = path.join(siteDir, cleanPath, 'index.html');
  if (fs.existsSync(indexPath)) return res.sendFile(indexPath);
  next();
});

app.use(express.static(siteDir, { extensions: ['html'] }));

// ─── API Routes ─────────────────────────────────────────────────
app.use(systemRouter); // /api/health

app.use('/api/auth', async (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Pragma', 'no-cache');

  try {
    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
    const allowed = await rateLimit(ip, 'auth_perimeter', 120, 60 * 1000);
    if (!allowed) return res.status(429).json({ error: 'rate_limited', request_id: req.requestId || null });
  } catch (error) {
    logger.error({ err: error?.message || String(error) }, 'auth_perimeter_rate_limit_failed');
    return res.status(503).json({ error: 'service_unavailable', request_id: req.requestId || null });
  }

  next();
});

app.use('/api/admin', async (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Pragma', 'no-cache');

  try {
    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
    const allowed = await rateLimit(ip, 'admin_perimeter', 120, 60 * 1000);
    if (!allowed) return res.status(429).json({ error: 'rate_limited', request_id: req.requestId || null });
  } catch (error) {
    logger.error({ err: error?.message || String(error) }, 'admin_perimeter_rate_limit_failed');
    return res.status(503).json({ error: 'service_unavailable', request_id: req.requestId || null });
  }

  next();
});

app.use('/api/auth', authRouter);
app.use('/api', renderRouter);
app.use('/api/stripe', stripeRouter);
app.use('/api/admin', adminRouter);
app.use('/api/support', supportRouter);
app.use('/api/loader', loaderRouter);
app.use('/api/licenses', licensesRouter);
app.use('/api/email', emailRouter);
app.use('/api/customer', customerRouter);

// ─── Central Error Handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  const status = Number(err?.status) || 500;
  const message = status >= 500 ? 'internal_server_error' : 'request_failed';
  const requestId = req?.requestId || res.getHeader('X-Request-Id') || randomUUID();
  if (!res.getHeader('X-Request-Id')) res.setHeader('X-Request-Id', requestId);

  logger.error({
    request_id: requestId,
    method: req?.method,
    path: req?.originalUrl,
    status_code: status,
    error_message: err?.message || 'Unknown error',
    stack: err?.stack,
  }, 'http_error');

  if (res.headersSent) return next(err);
  return res.status(status).json({ error: message, request_id: requestId });
});

// ─── Fallback 404 ───────────────────────────────────────────────
app.use((req, res) => {
  if (req.method === 'GET') {
    const notFoundPath = path.join(siteDir, '404.html');
    if (fs.existsSync(notFoundPath)) {
      return res.status(404).sendFile(notFoundPath);
    }
  }
  res.status(404).json({ error: 'not_found', request_id: req.requestId || null });
});

// ─── Graceful Shutdown ──────────────────────────────────────────
let server;
function shutdown(signal) {
  console.log(`[Scaled] ${signal} received — shutting down gracefully`);
  if (server) {
    server.close(() => {
      console.log('[Scaled] Server closed');
      process.exit(0);
    });
    setTimeout(() => {
      console.error('[Scaled] Forced shutdown after timeout');
      process.exit(1);
    }, 10000).unref();
  } else {
    process.exit(0);
  }
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// ─── Start Server ───────────────────────────────────────────────
if (require.main === module) {
  const { EFFECTIVE_ADMIN_KEY } = require('./src/middleware/requireAdmin');
  server = app.listen(PORT, () => {
    console.log(`[Scaled] Theme protection server v3 running on port ${PORT}`);
    console.log(`[Scaled] Dashboard: http://localhost:${PORT}/dashboard`);
    console.log(`[Scaled] Admin key: ${process.env.ADMIN_KEY ? '✓ Custom key set' : '⚠️  USING DEFAULT KEY — set ADMIN_KEY env var'}`);
  });
}

module.exports = app;
