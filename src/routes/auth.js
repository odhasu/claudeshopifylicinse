const express = require('express');
const router = express.Router();
const { getStore } = require('../services/storeService');
const { EFFECTIVE_ADMIN_KEY } = require('../middleware/requireAdmin');
const { kvGetLicenses } = require('../services/kvService');

router.post('/login', async (req, res) => {
  try {
    const { licenseKey } = req.body;
    if (!licenseKey) return res.status(400).json({ error: 'License key required' });
    
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

router.post('/check-admin', (req, res) => {
  const { adminKey } = req.body;
  res.json({ isAdmin: adminKey === EFFECTIVE_ADMIN_KEY });
});

module.exports = router;
