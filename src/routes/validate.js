/**
 * Lightweight license validation endpoint for the client-side loader.
 * Goes directly to Supabase — no Redis/KV dependency.
 * Falls back to KV if Supabase is not configured.
 */
const express = require('express');
const router = express.Router();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function validateViaSupabase(licenseKey) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null; // not configured

  const url = `${SUPABASE_URL}/rest/v1/subscriptions?license_key=eq.${encodeURIComponent(licenseKey)}&select=license_key,plan,status,expires_at,store_limit`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
    signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) throw new Error(`Supabase HTTP ${res.status}`);
  const rows = await res.json();
  if (!rows || rows.length === 0) return { valid: false, reason: 'invalid_key' };

  const license = rows[0];
  if (license.status !== 'active') return { valid: false, reason: 'inactive' };
  if (license.expires_at && new Date(license.expires_at) < new Date()) return { valid: false, reason: 'expired' };

  return { valid: true, plan: license.plan || 'standard' };
}

async function validateViaKV(licenseKey) {
  try {
    const { kvGetLicenses } = require('../services/kvService');
    const licenses = await kvGetLicenses();
    const license = licenses.find(l => l.license_key === licenseKey && l.active);
    if (!license) return { valid: false, reason: 'invalid_key' };
    if (license.expires_at && new Date(license.expires_at) < new Date()) return { valid: false, reason: 'expired' };
    return { valid: true, plan: license.plan || 'standard' };
  } catch (e) {
    return null; // KV unavailable
  }
}

router.post('/validate', async (req, res) => {
  const { licenseKey } = req.body || {};
  if (!licenseKey) return res.status(400).json({ status: 'invalid', reason: 'missing_key' });

  try {
    // Try Supabase first (fast, no Redis dependency)
    let result = await validateViaSupabase(licenseKey);

    // Fall back to KV if Supabase not configured
    if (result === null) result = await validateViaKV(licenseKey);

    // If neither is available, fail open
    if (result === null) return res.json({ status: 'ok', plan: 'standard' });

    if (result.valid) return res.json({ status: 'ok', plan: result.plan });
    return res.status(403).json({ status: 'invalid', reason: result.reason });
  } catch (e) {
    console.error('[Validate] error:', e.message);
    // Fail open on server errors
    return res.json({ status: 'ok', plan: 'standard' });
  }
});

module.exports = router;
