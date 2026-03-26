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

// Initialize store (must happen before routes import it)
require('./src/services/storeService');

const { handleWebhook, router: stripeRouter } = require('./src/routes/stripe');
const authRouter = require('./src/routes/auth');
const renderRouter = require('./src/routes/render');
const adminRouter = require('./src/routes/admin');
const supportRouter = require('./src/routes/support');
const loaderRouter = require('./src/routes/loader');
const licensesRouter = require('./src/routes/licenses');

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
  allowedHeaders: ['Content-Type', 'X-Admin-Key'],
}));

// ─── Stripe Webhook (raw body — must be before express.json) ────
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), handleWebhook);

// ─── Body Parser ─────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));

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
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '3.0.0', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api', renderRouter);
app.use('/api/stripe', stripeRouter);
app.use('/api/admin', adminRouter);
app.use('/api/support', supportRouter);
app.use('/api/loader', loaderRouter);
app.use('/api/licenses', licensesRouter);
// Email test endpoint (admin-only, mounted at /api/email/test)
const { requireAdmin } = require('./src/middleware/requireAdmin');
const { sendWelcomeEmail } = require('./src/services/emailService');
app.post('/api/email/test', requireAdmin, async (req, res) => {
  const { email, plan } = req.body;
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'A valid email address is required' });
  }
  try {
    await sendWelcomeEmail({
      email: email.trim(),
      name: 'Test User',
      licenseKey: 'VXEL-TEST-XXXX-XXXX',
      plan: plan || 'LITE',
    });
    res.json({ ok: true, sent_to: email.trim() });
  } catch (err) {
    console.error('[Email Test] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Fallback 404 ───────────────────────────────────────────────
app.use((req, res) => {
  if (req.method === 'GET') {
    const notFoundPath = path.join(siteDir, '404.html');
    if (fs.existsSync(notFoundPath)) {
      return res.status(404).sendFile(notFoundPath);
    }
  }
  res.status(404).json({ error: 'not_found' });
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
