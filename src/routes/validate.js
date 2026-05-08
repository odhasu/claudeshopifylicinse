/**
 * Lightweight license validation endpoint for the client-side loader.
 * Uses Supabase RPC (validate_license function) via anon key — no service role needed.
 * Falls back to KV if Supabase is unavailable.
 */
const express = require('express');
const router = express.Router();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://eqmagffuzblywevszosw.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxbWFnZmZ1emJseXdldnN6b3N3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MTgwNjcsImV4cCI6MjA4NjQ5NDA2N30.dlSSmQK2C_7ArHOI-SttFLO7hqRoFCLFcDu1n_6VjsY';

async function validateViaSupabase(licenseKey) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);

  try {
    const url = `${SUPABASE_URL}/rest/v1/rpc/validate_license`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ p_license_key: licenseKey }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Supabase HTTP ${res.status}: ${body}`);
    }
    return await res.json(); // { valid: true/false, plan: '...', reason: '...' }
  } finally {
    clearTimeout(timer);
  }
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
    // Supabase RPC — uses anon key, no service role needed
    const result = await validateViaSupabase(licenseKey);

    if (result.valid) return res.json({ status: 'ok', plan: result.plan });
    return res.status(403).json({ status: 'invalid', reason: result.reason });
  } catch (e) {
    console.error('[Validate] Supabase failed:', e.message);

    // Fall back to KV
    try {
      const kvResult = await validateViaKV(licenseKey);
      if (kvResult) {
        if (kvResult.valid) return res.json({ status: 'ok', plan: kvResult.plan });
        return res.status(403).json({ status: 'invalid', reason: kvResult.reason });
      }
    } catch (e2) {
      console.error('[Validate] KV also failed:', e2.message);
    }

    // Both failed — fail open
    return res.json({ status: 'ok', plan: 'standard' });
  }
});

module.exports = router;
