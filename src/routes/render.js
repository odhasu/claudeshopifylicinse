const express = require('express');
const router = express.Router();
const { validate, schemas } = require('../middleware/validate');
const rateLimit = require('../middleware/rateLimit');
const { validateLicense, logRequest } = require('../services/licenseService');
const { getStore } = require('../services/storeService');
const renderers = require('../renderers');
const { getCriticalCSS, getKillSwitchCSS } = require('../renderers/css');
const normalizeDomain = require('../utils/domainNorm');

router.post('/v3/render', validate(schemas.render), async (req, res) => {
  try {
    const { ensureRedisInitialized } = require('../services/storeService');
    await ensureRedisInitialized();
    
    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

    const allowed = await rateLimit(ip, 'render', 60);
    if (!allowed) return res.status(429).json({ error: 'rate_limited' });

    const { licenseKey, domain, permanentDomain, sections, colors, brandName, logoUrl, chatbot, urgency } = req.body;

    let result = await validateLicense(licenseKey, domain);
    if (!result.valid && permanentDomain) result = await validateLicense(licenseKey, permanentDomain);

    if (!result.valid) {
      logRequest(licenseKey, domain, ip, userAgent, result.reason);

      let footerHtml = '';
      const cfg = { brandName: brandName || '', logoUrl: logoUrl || null, chatbot: chatbot || {}, urgency: urgency || {} };
      if (sections && Array.isArray(sections)) {
        const footerSection = sections.find(s => s.type === 'footer');
        if (footerSection && renderers['footer']) {
          try { footerHtml = renderers['footer'](footerSection.settings || {}, null, colors || {}, cfg); } catch(e) {}
        }
      }

      return res.status(403).json({
        error: result.reason,
        killCSS: getKillSwitchCSS(),
        footerHtml: footerHtml,
        message: result.reason === 'domain_mismatch' ? 'This license is not authorized for this domain.'
          : result.reason === 'expired' ? 'License has expired.' : 'Invalid license key.'
      });
    }

    logRequest(licenseKey, domain, ip, userAgent, 'success');

    const renderedSections = [];
    const cfg = { brandName: brandName || '', logoUrl: logoUrl || null, chatbot: chatbot || {}, urgency: urgency || {} };

    if (sections && Array.isArray(sections)) {
      for (const section of sections) {
        const renderer = renderers[section.type];
        if (renderer) {
          try {
            const html = renderer(section.settings || {}, section.products || null, colors || {}, cfg);
            renderedSections.push({ type: section.type, elementId: section.elementId, html });
          } catch (e) {
            renderedSections.push({ type: section.type, elementId: section.elementId, html: '' });
          }
        }
      }
    }

    res.json({ status: 'ok', css: getCriticalCSS(), js: '', sections: renderedSections, version: '3.0.0', plan: result.license.plan });
  } catch (error) {
    console.error('[Render] Error:', error);
    res.status(500).json({ error: 'Server error', killCSS: getKillSwitchCSS() });
  }
});

router.post('/v1/load', validate(schemas.legacyLoad), async (req, res) => {
  try {
    const { ensureRedisInitialized } = require('../services/storeService');
    await ensureRedisInitialized();
    
    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';
    const allowed = await rateLimit(ip, 'render', 60);
    if (!allowed) return res.status(429).json({ error: 'rate_limited' });
    const { licenseKey, domain, permanentDomain } = req.body;
    let result = await validateLicense(licenseKey, domain);
    if (!result.valid && permanentDomain) result = await validateLicense(licenseKey, permanentDomain);
    if (!result.valid) return res.status(403).json({ error: result.reason, killCSS: getKillSwitchCSS() });
    res.json({ status: 'ok', css: getCriticalCSS(), js: '', version: '3.0.0', plan: result.license.plan });
  } catch (error) {
    console.error('[Load] Error:', error);
    res.status(500).json({ error: 'Server error', killCSS: getKillSwitchCSS() });
  }
});

router.get('/remote-content', (req, res) => {
  const domain = typeof req.query.domain === 'string' ? req.query.domain.trim() : '';
  if (!domain || domain.length > 253) return res.json([]);
  const store = getStore();
  const patches = store.remote_content.filter(r => r.active && (normalizeDomain(r.domain) === normalizeDomain(domain)));
  res.json(patches.map(p => ({ css: p.css, html: p.html, js: p.js, redirect_url: p.redirect_url })));
});

module.exports = router;
