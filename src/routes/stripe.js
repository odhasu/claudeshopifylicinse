const express = require('express');
const router = express.Router();
const { validate, schemas } = require('../middleware/validate');
const rateLimit = require('../middleware/rateLimit');
const { getStripe, STRIPE_WEBHOOK_SECRET, PLAN_PRICES } = require('../services/stripeService');
const { getStore, saveStore } = require('../services/storeService');
const { generateLicenseKey, createLicense } = require('../services/licenseService');
const { sendWelcomeEmail } = require('../services/emailService');
const { kvGetLicenses, kvAcquireIdempotencyLock } = require('../services/kvService');

const DEFAULT_PUBLIC_ORIGIN = 'https://claudecodethemeshopify.vercel.app';
const configuredPublicOrigin = (() => {
  try {
    return new URL(process.env.PUBLIC_BASE_URL || DEFAULT_PUBLIC_ORIGIN).origin;
  } catch (_) {
    return DEFAULT_PUBLIC_ORIGIN;
  }
})();

const checkoutAllowedOrigins = (process.env.CHECKOUT_ALLOWED_ORIGINS || process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean)
  .map((value) => {
    try {
      return new URL(value).origin;
    } catch (_) {
      return null;
    }
  })
  .filter(Boolean);

const PLAN_PATTERN = /^(LITE|PRO)$/;
const PAYMENT_INTENT_PATTERN = /^pi_[A-Za-z0-9_]{8,128}$/;
const SESSION_ID_PATTERN = /^cs_[A-Za-z0-9_]{8,200}$/;

function sanitizePlan(plan) {
  return PLAN_PATTERN.test(String(plan || '').toUpperCase()) ? String(plan).toUpperCase() : 'LITE';
}

function getClientIp(req) {
  const header = req.headers['x-forwarded-for'];
  if (typeof header === 'string' && header) {
    return header.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || '';
}

function resolveCheckoutOrigin(req) {
  const requestOriginHeader = req.headers.origin;
  if (typeof requestOriginHeader === 'string' && requestOriginHeader) {
    try {
      const requestOrigin = new URL(requestOriginHeader).origin;
      if (checkoutAllowedOrigins.includes(requestOrigin)) return requestOrigin;
      if (process.env.NODE_ENV !== 'production' && checkoutAllowedOrigins.length === 0) return requestOrigin;
      console.warn('[Stripe] Rejected untrusted checkout origin:', requestOrigin);
    } catch (_) {
      console.warn('[Stripe] Invalid checkout origin header received');
    }
  }
  return configuredPublicOrigin;
}

const localWebhookLocks = new Map();

function acquireLocalWebhookLock(eventId, ttlMs) {
  const now = Date.now();
  const existing = localWebhookLocks.get(eventId);
  if (existing && existing > now) return false;
  localWebhookLocks.set(eventId, now + ttlMs);
  return true;
}

setInterval(() => {
  const now = Date.now();
  for (const [eventId, expiresAt] of localWebhookLocks.entries()) {
    if (expiresAt <= now) localWebhookLocks.delete(eventId);
  }
}, 5 * 60 * 1000).unref();

// Stripe Webhook (raw body required — mounted separately in index.js)
async function handleWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  if (!sig || typeof sig !== 'string') {
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  if (!STRIPE_WEBHOOK_SECRET) {
    console.error('[Webhook] STRIPE_WEBHOOK_SECRET not set');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[Webhook] Signature verification failed:', err.message);
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  const lockTtlMs = 10 * 60 * 1000;
  const lockKey = `webhook:stripe:event:${event.id}`;
  let lockAcquired = await kvAcquireIdempotencyLock(lockKey, lockTtlMs);
  if (lockAcquired === null) lockAcquired = acquireLocalWebhookLock(event.id, lockTtlMs);
  if (!lockAcquired) {
    console.log(`[Webhook] Duplicate event skipped: ${event.id}`);
    return res.json({ received: true, duplicate: true });
  }

  try {
    const { ensureRedisInitialized } = require('../services/storeService');
    await ensureRedisInitialized();

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log(`[Webhook] Processing checkout.session.completed: ${session.id}`);

      const licenses = await kvGetLicenses();
      if (licenses.find(l => l.stripe_session_id === session.id)) {
        console.log('[Webhook] Duplicate event — license already exists for session', session.id);
        return res.json({ received: true });
      }

      const email = session.customer_details?.email || null;
      const name  = session.customer_details?.name  || null;
      const plan  = sanitizePlan(session.metadata?.plan);

      if (!email && !name) {
        console.warn(`[Webhook] Warning: No email or name provided for session ${session.id}`);
      }

      const license = await createLicense({
        username: name || email || 'Unknown',
        domain: '*',
        permanent_domain: '*',
        plan,
        email,
        customer_name: name,
        stripe_session_id: session.id,
        notes: 'Auto-created via Stripe checkout',
      });
      console.log(`[Webhook] License created: ${license.license_key} for ${email || name || 'unknown'} (${plan})`);

      // Send email — doesn't fail the webhook if it errors
      try {
        await sendWelcomeEmail({ email, name, licenseKey: license.license_key, plan });
        console.log(`[Webhook] Welcome email queued for ${email || 'no-email'}`);
      } catch (emailErr) {
        console.error(`[Webhook] Warning: Failed to send email for license ${license.license_key}:`, emailErr.message);
        // Continue — license is created even if email fails
      }

      return res.json({ received: true });
    }

    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object;
      console.log(`[Webhook] Processing payment_intent.succeeded: ${pi.id}`);

      const licenses = await kvGetLicenses();
      if (licenses.find(l => l.stripe_payment_intent_id === pi.id)) {
        console.log('[Webhook] Duplicate event — license already exists for PaymentIntent', pi.id);
        return res.json({ received: true });
      }

      const email = pi.receipt_email || pi.metadata?.email || null;
      const name  = pi.metadata?.customer_name || null;
      const plan  = sanitizePlan(pi.metadata?.plan);

      if (!email && !name) {
        console.warn(`[Webhook] Warning: No email or name provided for PaymentIntent ${pi.id}`);
      }

      const license = await createLicense({
        username: name || email || 'Unknown',
        domain: '*',
        permanent_domain: '*',
        plan,
        email,
        customer_name: name,
        stripe_payment_intent_id: pi.id,
        notes: 'Auto-created via Stripe PaymentIntent',
      });
      console.log(`[Webhook] License created: ${license.license_key} for ${email || name || 'unknown'} (${plan}) [PaymentIntent]`);

      // Send email — doesn't fail the webhook if it errors
      try {
        await sendWelcomeEmail({ email, name, licenseKey: license.license_key, plan });
        console.log(`[Webhook] Welcome email queued for ${email || 'no-email'}`);
      } catch (emailErr) {
        console.error(`[Webhook] Warning: Failed to send email for license ${license.license_key}:`, emailErr.message);
        // Continue — license is created even if email fails
      }

      return res.json({ received: true });
    }

    console.log(`[Webhook] Ignoring event type: ${event.type}`);
    res.json({ received: true });
  } catch (error) {
    console.error('[Webhook] Processing error:', error.message, error.stack);
    // Return 500 so Stripe retries, but log the issue
    res.status(500).json({ error: 'Webhook processing failed', message: error.message });
  }
}

// Payment Intent
router.post('/create-payment-intent', validate(schemas.createPaymentIntent), async (req, res) => {
  const ip = getClientIp(req);
  const allowed = await rateLimit(ip, 'stripe', 10);
  if (!allowed) return res.status(429).json({ error: 'rate_limited' });
  const { plan, email, customerName } = req.body;
  try {
    const stripe = getStripe();
    const { amount, name } = PLAN_PRICES[plan];
    const intentData = {
      amount,
      currency: 'usd',
      metadata: { plan, planName: name },
      automatic_payment_methods: { enabled: true },
    };
    if (email) {
      intentData.receipt_email = email.trim();
      intentData.metadata.email = email.trim();
    }
    if (customerName) {
      intentData.metadata.customer_name = customerName.trim();
    }
    const paymentIntent = await stripe.paymentIntents.create(intentData);
    res.json({ clientSecret: paymentIntent.client_secret, amount, planName: name, plan });
  } catch (err) {
    console.error('[Stripe] create-payment-intent error:', err.message);
    res.status(500).json({ error: 'Unable to create payment intent' });
  }
});

router.get('/payment-intent', async (req, res) => {
  const ip = getClientIp(req);
  const allowed = await rateLimit(ip, 'stripe_lookup', 120);
  if (!allowed) return res.status(429).json({ error: 'rate_limited' });

  const { payment_intent } = req.query;
  if (typeof payment_intent !== 'string' || !PAYMENT_INTENT_PATTERN.test(payment_intent)) {
    return res.status(400).json({ error: 'Invalid payment_intent' });
  }
  try {
    const stripe = getStripe();
    const pi = await stripe.paymentIntents.retrieve(payment_intent);
    res.json({
      plan:     pi.metadata?.plan     || null,
      planName: pi.metadata?.planName || null,
      email:    pi.receipt_email      || null,
      status:   pi.status,
    });
  } catch (err) {
    console.error('[Stripe] payment-intent retrieve error:', err.message);
    res.status(500).json({ error: 'Unable to retrieve payment intent' });
  }
});

router.post('/checkout', validate(schemas.checkout), async (req, res) => {
  const ip = getClientIp(req);
  const allowed = await rateLimit(ip, 'stripe', 10);
  if (!allowed) return res.status(429).json({ error: 'rate_limited' });
  const { plan } = req.body;
  try {
    const stripe = getStripe();
    const { amount, name } = PLAN_PRICES[plan];
    const origin = resolveCheckoutOrigin(req);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          unit_amount: amount,
          product_data: {
            name,
            description: 'Lifetime license · Free updates · Instant download',
            images: ['https://claudecodethemeshopify.vercel.app/diamond-logo.svg'],
          },
        },
        quantity: 1,
      }],
      success_url: `${origin}/theme/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/theme/pricing`,
      metadata: { plan },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    });

    if (!session.url) {
      console.error('[Stripe] checkout session missing URL:', session.id);
      return res.status(502).json({ error: 'Checkout URL unavailable' });
    }

    res.json({ url: session.url });
  } catch (err) {
    console.error('[Stripe] checkout error:', err.message);
    res.status(500).json({ error: 'Unable to create checkout session' });
  }
});

router.get('/session', async (req, res) => {
  const ip = getClientIp(req);
  const allowed = await rateLimit(ip, 'stripe_lookup', 120);
  if (!allowed) return res.status(429).json({ error: 'rate_limited' });

  const { session_id } = req.query;
  if (typeof session_id !== 'string' || !SESSION_ID_PATTERN.test(session_id)) {
    return res.status(400).json({ error: 'Invalid session_id' });
  }
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(session_id);
    res.json({
      plan:  session.metadata?.plan || 'Unknown',
      email: session.customer_email || session.customer_details?.email || null,
    });
  } catch (err) {
    console.error('[Stripe] session retrieve error:', err.message);
    res.status(500).json({ error: 'Unable to retrieve checkout session' });
  }
});

module.exports = { router, handleWebhook };
