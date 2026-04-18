const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const rateLimit = require('../middleware/rateLimit');
const { validate, schemas } = require('../middleware/validate');
const { EFFECTIVE_ADMIN_KEY, ADMIN_AUTH_CONFIGURED } = require('../middleware/requireAdmin');
const { kvGetLicenses } = require('../services/kvService');

const LICENSE_KEY_PATTERN = /^(?:og\d*|[A-Za-z0-9]{4}(?:-[A-Za-z0-9]{4}){3})$/;

function getRequestIp(req) {
  return req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
}

function isAdminKeyMatch(adminKey) {
  const provided = Buffer.from(adminKey);
  const expected = Buffer.from(EFFECTIVE_ADMIN_KEY);
  return (
    provided.length === expected.length &&
    crypto.timingSafeEqual(provided, expected)
  );
}

router.post('/login', validate(schemas.authLogin), async (req, res) => {
  try {
    const { licenseKey } = req.body;
    if (!LICENSE_KEY_PATTERN.test(licenseKey)) {
      return res.status(400).json({ error: 'Invalid license key format' });
    }

    const ip = getRequestIp(req);
    const allowed = await rateLimit(ip, 'auth_login', 30, 60 * 1000);
    if (!allowed) return res.status(429).json({ error: 'Too many login attempts. Please try again later.' });
    
    const { ensureRedisInitialized } = require('../services/storeService');
    await ensureRedisInitialized();
    
    const licenses = await kvGetLicenses();
    const license = licenses.find(l => l.license_key === licenseKey && l.active);
    if (!license) return res.status(401).json({ error: 'Invalid license key' });
    if (license.expires_at && new Date(license.expires_at) < new Date()) {
      return res.status(401).json({ error: 'License expired' });
    }
    res.json({
      success: true,
      license: {
        key: license.license_key,
        domain: license.domain,
        permanent_domain: license.permanent_domain,
        plan: license.plan,
        active: license.active,
        created_at: license.created_at,
        expires_at: license.expires_at,
        last_verified_at: license.last_verified_at,
        request_count: license.request_count || 0,
        notes: license.notes || '',
        store_name: license.store_name || ''
      }
    });
  } catch (error) {
    console.error('[Auth] Login error:', error);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

router.post('/check-admin', validate(schemas.adminCheck), async (req, res) => {
  const ip = getRequestIp(req);
  const allowed = await rateLimit(ip, 'auth_admin_check', 20, 60 * 1000);
  if (!allowed) return res.status(429).json({ isAdmin: false });

  const { adminKey } = req.body;

  const isAdmin = isAdminKeyMatch(adminKey);

  res.json({ isAdmin });
});

module.exports = router;
