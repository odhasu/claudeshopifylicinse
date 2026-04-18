const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { kvGetLicenses } = require('../services/kvService');
const rateLimit = require('../middleware/rateLimit');
const logger = require('../utils/logger');

// GET /api/customer/download
// Header: X-License-Key — validates license is active, serves theme zip
router.get('/download', async (req, res) => {
  const raw = req.headers['x-license-key'];
  if (!raw || typeof raw !== 'string' || !raw.trim()) {
    return res.status(401).json({ error: 'license_key_required' });
  }
  const licenseKey = raw.trim();

  // Rate limit: 10 downloads per hour per IP
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
    const allowed = await rateLimit(ip, 'customer_download', 10, 60 * 60 * 1000);
    if (!allowed) return res.status(429).json({ error: 'rate_limited' });
  } catch (err) {
    logger.error({ err: err?.message }, 'customer_download_rate_limit_failed');
  }

  try {
    const licenses = await kvGetLicenses();
    const license = licenses.find(l => String(l.license_key) === licenseKey);
    if (!license || !license.active) {
      return res.status(403).json({ error: 'invalid_or_inactive_license' });
    }

    const themePath = path.join(__dirname, '..', '..', 'theme-dist');
    if (!fs.existsSync(themePath)) {
      return res.status(503).json({ error: 'theme_not_available' });
    }

    res.setHeader('Content-Disposition', 'attachment; filename="vexel-v1.zip"');
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Cache-Control', 'no-store');

    const archiver = require('archiver');
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', (err) => {
      logger.error({ err: err?.message }, 'customer_download_archive_error');
      if (!res.headersSent) res.status(500).json({ error: 'archive_failed' });
    });
    archive.pipe(res);
    archive.directory(themePath, false);
    archive.finalize();

    logger.info({ license_key: licenseKey, domain: license.domain }, 'customer_theme_download');
  } catch (error) {
    logger.error({ err: error?.message }, 'customer_download_error');
    if (!res.headersSent) res.status(500).json({ error: 'download_failed' });
  }
});

module.exports = router;
