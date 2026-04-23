const crypto = require('crypto');
const logger = require('../utils/logger');
const { upsertSubscription, getSubscriptionByEmail } = require('../services/supabaseService');
const { createLicense } = require('../services/licenseService');
const { kvGetLicenses, kvSaveLicenses } = require('../services/kvService');

const WHOP_WEBHOOK_SECRET = process.env.WHOP_WEBHOOK_SECRET;

function verifySignature(rawBody, header) {
  if (!WHOP_WEBHOOK_SECRET) return true; // Skip if not configured (dev)
  if (!header) return false;
  for (const part of header.split(',')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    const prefix = part.slice(0, eq).trim();
    const sig = part.slice(eq + 1).trim();
    if (prefix === 'v1') {
      try {
        const expected = crypto
          .createHmac('sha256', WHOP_WEBHOOK_SECRET)
          .update(rawBody)
          .digest('hex');
        const sigBuf = Buffer.from(sig, 'hex');
        const expBuf = Buffer.from(expected, 'hex');
        if (sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf)) return true;
      } catch { return false; }
    }
  }
  return false;
}

async function syncKvLicense(licenseKey, expiresAt, keepActive) {
  try {
    const licenses = await kvGetLicenses();
    const idx = licenses.findIndex(l => l.license_key === licenseKey);
    if (idx !== -1) {
      licenses[idx].expires_at = expiresAt;
      if (!keepActive) licenses[idx].active = 0;
      await kvSaveLicenses(licenses);
    }
  } catch (e) {
    logger.error({ err: e?.message }, 'whop_kv_sync_failed');
  }
}

async function ensureLicense(sub) {
  if (sub.license_key) {
    const active = sub.status === 'trial' || sub.status === 'active';
    await syncKvLicense(sub.license_key, sub.expires_at, active);
    return sub.license_key;
  }
  const license = await createLicense({
    email: sub.email,
    plan: sub.plan || 'monthly',
    domain: '*',
    permanent_domain: '*',
    expires_at: sub.expires_at,
    notes: `whop_${sub.plan || 'monthly'}`,
  });
  return license.license_key;
}

async function handleWhopWebhook(req, res) {
  const rawBody = req.body; // Buffer — express.raw() is applied in index.js
  const sig = req.headers['whop-signature'] || req.headers['x-whop-signature'] || '';

  if (!verifySignature(rawBody, sig)) {
    return res.status(401).json({ error: 'invalid_signature' });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody.toString('utf8'));
  } catch {
    return res.status(400).json({ error: 'invalid_json' });
  }

  // Whop sends { action, data } or { event, data } depending on version
  const action = payload?.action || payload?.event;
  const data = payload?.data || payload?.object || {};
  if (!action || !data) return res.status(400).json({ error: 'missing_fields' });

  // Whop embeds user in data.user or data.membership.user depending on webhook version
  const user = data.user || data.membership?.user || data.object?.user || {};
  const email = typeof user.email === 'string' ? user.email.toLowerCase().trim() : null;
  if (!email) {
    logger.warn({ action }, 'whop_webhook_no_email');
    return res.json({ ok: true }); // Ack — can't process without email
  }

  const whopUserId = typeof user.id === 'string' ? user.id : null;
  const now = new Date();

  try {
    // membership_activated = new member or renewal (replaces membership.created + membership.active)
    if (action === 'membership_activated' || action === 'membership.created') {
      const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const existing = await getSubscriptionByEmail(email);
      const upserted = await upsertSubscription({
        email,
        plan: 'monthly',
        status: 'trial',
        expires_at: expiresAt,
        store_limit: 1,
        whop_user_id: whopUserId,
        license_key: existing?.license_key || null,
      });
      if (upserted) {
        const key = await ensureLicense(upserted);
        if (!upserted.license_key && key) {
          await upsertSubscription({ ...upserted, license_key: key });
        }
      }

    } else if (action === 'invoice_paid' || action === 'membership.active') {
      const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const existing = await getSubscriptionByEmail(email);
      const upserted = await upsertSubscription({
        email,
        plan: existing?.plan || 'monthly',
        status: 'active',
        expires_at: expiresAt,
        store_limit: existing?.store_limit || 1,
        whop_user_id: whopUserId,
        license_key: existing?.license_key || null,
      });
      if (upserted) await ensureLicense(upserted);

    } else if (action === 'membership_deactivated' || action === 'membership.cancelled') {
      const existing = await getSubscriptionByEmail(email);
      if (existing) {
        await upsertSubscription({
          email: existing.email,
          plan: existing.plan,
          status: 'cancelled',
          expires_at: existing.expires_at,
          store_limit: existing.store_limit,
          whop_user_id: existing.whop_user_id,
          license_key: existing.license_key,
        });
      }
    }

    logger.info({ action, email }, 'whop_webhook_processed');
    res.json({ ok: true });
  } catch (err) {
    logger.error({ err: err?.message, action, email }, 'whop_webhook_error');
    res.status(500).json({ error: 'processing_failed' });
  }
}

module.exports = { handleWhopWebhook };
