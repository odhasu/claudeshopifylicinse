const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { requireAdmin } = require('../middleware/requireAdmin');
const { validate, schemas } = require('../middleware/validate');
const { getStore, saveStore, nextId } = require('../services/storeService');
const { kvGetTickets, kvSaveTickets, kvGetLicenses, kvSaveLicenses, kvGetRuntimeStatus } = require('../services/kvService');
const { generateLicenseKey } = require('../services/licenseService');
const { sendTicketReplyEmail, sendWelcomeEmail } = require('../services/emailService');

function toCsvValue(value) {
  if (value === null || value === undefined) return '';
  let text = String(value);
  // Mitigate CSV formula injection when opened in spreadsheet software.
  if (/^[=+\-@]/.test(text)) {
    text = `'${text}`;
  }
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function boolQuery(value) {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'true' || normalized === '1' || normalized === 'yes') return true;
  if (normalized === 'false' || normalized === '0' || normalized === 'no') return false;
  return null;
}

function parsePositiveInt(value) {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function isValidEmail(value) {
  if (typeof value !== 'string') return false;
  const email = value.trim();
  if (!email || email.length > 200) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function generateUniqueLicenseKey(existingKeys) {
  for (let i = 0; i < 10; i++) {
    const key = generateLicenseKey();
    if (!existingKeys.has(key)) return key;
  }
  throw new Error('Failed to allocate unique license key');
}

function findTicketById(tickets, id) {
  return tickets.find((ticket) => ticket.id === id);
}

async function loadTicketsWithTicket(id) {
  const tickets = await kvGetTickets();
  return { tickets, ticket: findTicketById(tickets, id) };
}

// License CRUD
router.post('/licenses', requireAdmin, validate(schemas.createLicense), async (req, res) => {
  try {
    const { username, domain, permanent_domain, store_name, plan, expires_at } = req.body;
    const licenses = await kvGetLicenses();
    const existingKeys = new Set(licenses.map((item) => String(item.license_key || '')));
    const licenseKey = generateUniqueLicenseKey(existingKeys);
    const license = {
      id: nextId(),
      license_key: licenseKey,
      username: username || '',
      domain,
      permanent_domain: permanent_domain || '',
      store_name: store_name || '',
      plan: plan || 'standard',
      active: 1,
      created_at: new Date().toISOString(),
      expires_at: expires_at || null,
      last_verified_at: null,
      request_count: 0
    };
    licenses.push(license);
    await kvSaveLicenses(licenses);
    
    // Also update local store for fallback
    const store = getStore();
    store.licenses.push(license);
    saveStore();
    
    res.json({ license_key: licenseKey, domain, plan: plan || 'standard', message: 'License created successfully' });
  } catch (error) {
    console.error('[Admin] Create license error:', error);
    res.status(500).json({ error: 'Failed to create license' });
  }
});

router.post('/licenses/bulk-create', requireAdmin, async (req, res) => {
  try {
    const payload = req.body || {};
    const inputLicenses = Array.isArray(payload.licenses) ? payload.licenses : null;
    if (!inputLicenses || inputLicenses.length === 0) {
      return res.status(400).json({ error: 'licenses array is required' });
    }
    if (inputLicenses.length > 250) {
      return res.status(400).json({ error: 'Maximum 250 licenses per request' });
    }

    const skipExisting = payload.skipExisting !== false;
    const existing = await kvGetLicenses();
    const existingByDomain = new Set(existing.map(item => String(item.domain || '').trim().toLowerCase()).filter(Boolean));
    const existingByPermanent = new Set(existing.map(item => String(item.permanent_domain || '').trim().toLowerCase()).filter(Boolean));
    const existingKeys = new Set(existing.map(item => String(item.license_key || '')).filter(Boolean));

    const created = [];
    const skipped = [];
    const batchDomainKeys = new Set();
    const batchPermanentKeys = new Set();

    for (let i = 0; i < inputLicenses.length; i++) {
      const row = inputLicenses[i] || {};
      const parsed = schemas.createLicense.safeParse(row);
      if (!parsed.success) {
        skipped.push({ index: i, reason: 'validation_error' });
        continue;
      }

      const normalized = parsed.data;
      const domain = normalized.domain;
      if (!domain) {
        skipped.push({ index: i, reason: 'domain_required' });
        continue;
      }

      const permanentDomain = normalized.permanent_domain || '';
      const domainKey = domain.toLowerCase();
      const permanentKey = permanentDomain.toLowerCase();
      const hasDuplicate =
        existingByDomain.has(domainKey) ||
        (permanentKey && existingByPermanent.has(permanentKey)) ||
        batchDomainKeys.has(domainKey) ||
        (permanentKey && batchPermanentKeys.has(permanentKey));

      if (hasDuplicate && skipExisting) {
        skipped.push({ index: i, domain, reason: 'duplicate_domain' });
        continue;
      }
      if (hasDuplicate && !skipExisting) {
        return res.status(409).json({
          error: 'duplicate_domain',
          message: `Duplicate domain found at index ${i}`,
          index: i,
          domain,
        });
      }

      const license = {
        id: nextId(),
        license_key: generateUniqueLicenseKey(existingKeys),
        username: normalized.username || '',
        domain,
        permanent_domain: permanentDomain,
        store_name: normalized.store_name || '',
        plan: normalized.plan ? String(normalized.plan).trim().toUpperCase() : 'STANDARD',
        active: 1,
        created_at: new Date().toISOString(),
        expires_at: normalized.expires_at || null,
        last_verified_at: null,
        request_count: 0,
        customer_name: row.customer_name ? String(row.customer_name).trim() : null,
        email: row.email ? String(row.email).trim() : null,
        notes: row.notes ? String(row.notes).trim() : 'Bulk-created via admin API',
      };

      existing.push(license);
      existingKeys.add(license.license_key);
      batchDomainKeys.add(domainKey);
      if (permanentKey) batchPermanentKeys.add(permanentKey);
      existingByDomain.add(domainKey);
      if (permanentKey) existingByPermanent.add(permanentKey);
      created.push(license);
    }

    await kvSaveLicenses(existing);

    const store = getStore();
    store.licenses = existing;
    saveStore();

    res.status(201).json({
      success: true,
      created_count: created.length,
      skipped_count: skipped.length,
      created,
      skipped,
    });
  } catch (error) {
    console.error('[Admin] Bulk create licenses error:', error);
    res.status(500).json({ error: 'Failed to bulk create licenses' });
  }
});

router.get('/licenses', requireAdmin, async (req, res) => {
  try {
    const licenses = await kvGetLicenses();
    res.json({ licenses: licenses.slice().reverse() });
  } catch (error) {
    console.error('[Admin] Get licenses error:', error);
    res.status(500).json({ error: 'Failed to fetch licenses' });
  }
});

router.get('/licenses/expiring-soon', requireAdmin, async (req, res) => {
  try {
    const daysRaw = Number.parseInt(String(req.query.days ?? 30), 10);
    const days = Number.isInteger(daysRaw) ? daysRaw : 30;
    if (days < 1 || days > 3650) {
      return res.status(400).json({ error: 'days must be between 1 and 3650' });
    }

    const includeExpired = boolQuery(req.query.includeExpired) === true;
    const limitRaw = Number.parseInt(String(req.query.limit ?? 200), 10);
    const limit = Number.isInteger(limitRaw) ? Math.max(1, Math.min(limitRaw, 1000)) : 200;

    const now = Date.now();
    const cutoff = now + days * 24 * 60 * 60 * 1000;
    const licenses = await kvGetLicenses();

    const expiring = licenses
      .filter((license) => {
        if (!license.expires_at) return false;
        const expiryTs = Date.parse(license.expires_at);
        if (Number.isNaN(expiryTs)) return false;
        if (expiryTs < now) return includeExpired;
        return expiryTs <= cutoff;
      })
      .map((license) => {
        const expiryTs = Date.parse(license.expires_at);
        const daysRemaining = Math.ceil((expiryTs - now) / (24 * 60 * 60 * 1000));
        return {
          license_key: license.license_key,
          plan: license.plan || null,
          domain: license.domain || null,
          permanent_domain: license.permanent_domain || null,
          email: license.email || null,
          customer_name: license.customer_name || license.username || null,
          active: Boolean(license.active),
          expires_at: license.expires_at,
          days_remaining: daysRemaining,
        };
      })
      .sort((a, b) => String(a.expires_at).localeCompare(String(b.expires_at)));

    const expiringSoon = expiring.filter(item => item.days_remaining >= 0);
    const expired = expiring.filter(item => item.days_remaining < 0);

    res.json({
      days_window: days,
      include_expired: includeExpired,
      total_matches: expiring.length,
      summary: {
        expiring_soon: expiringSoon.length,
        expired: expired.length,
      },
      licenses: expiring.slice(0, limit),
      truncated: expiring.length > limit,
    });
  } catch (error) {
    console.error('[Admin] Expiring licenses error:', error);
    res.status(500).json({ error: 'Failed to fetch expiring licenses' });
  }
});

router.get('/licenses/export.csv', requireAdmin, async (req, res) => {
  try {
    const licenses = await kvGetLicenses();
    const activeOnly = boolQuery(req.query.activeOnly);
    const planFilter = typeof req.query.plan === 'string' ? req.query.plan.trim().toUpperCase() : null;
    const domainFilter = typeof req.query.domain === 'string' ? req.query.domain.trim().toLowerCase() : null;

    let filtered = licenses;
    if (activeOnly === true) filtered = filtered.filter(item => Boolean(item.active));
    if (activeOnly === false) filtered = filtered.filter(item => !item.active);
    if (planFilter) filtered = filtered.filter(item => String(item.plan || '').toUpperCase() === planFilter);
    if (domainFilter) {
      filtered = filtered.filter(item => {
        const domain = String(item.domain || '').toLowerCase();
        const permanentDomain = String(item.permanent_domain || '').toLowerCase();
        return domain.includes(domainFilter) || permanentDomain.includes(domainFilter);
      });
    }

    const columns = [
      'id',
      'license_key',
      'username',
      'domain',
      'permanent_domain',
      'store_name',
      'plan',
      'active',
      'created_at',
      'expires_at',
      'last_verified_at',
      'request_count',
      'customer_name',
      'email',
      'notes',
      'stripe_session_id',
      'stripe_payment_intent_id',
    ];

    const sorted = filtered
      .slice()
      .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));

    const lines = [
      columns.join(','),
      ...sorted.map(item => columns.map(column => toCsvValue(item[column])).join(',')),
    ];

    const dateLabel = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="licenses-${dateLabel}.csv"`);
    res.send(lines.join('\n'));
  } catch (error) {
    console.error('[Admin] Export licenses CSV error:', error);
    res.status(500).json({ error: 'Failed to export licenses CSV' });
  }
});

router.delete('/licenses/:key', requireAdmin, async (req, res) => {
  try {
    const key = typeof req.params.key === 'string' ? req.params.key.trim() : '';
    if (!/^[A-Za-z0-9-]{6,80}$/.test(key)) {
      return res.status(400).json({ error: 'Invalid license key' });
    }

    const licenses = await kvGetLicenses();
    const license = licenses.find(l => l.license_key === key);
    if (license) { 
      license.active = 0; 
      await kvSaveLicenses(licenses);
      
      // Also update local store
      const store = getStore();
      const localLicense = store.licenses.find(l => l.license_key === key);
      if (localLicense) {
        localLicense.active = 0;
        saveStore();
      }
      
      res.json({ message: 'License revoked' }); 
    }
    else res.status(404).json({ error: 'License not found' });
  } catch (error) {
    console.error('[Admin] Delete license error:', error);
    res.status(500).json({ error: 'Failed to delete license' });
  }
});

router.post('/licenses/bulk-revoke', requireAdmin, async (req, res) => {
  try {
    const payload = req.body || {};
    const keys = Array.isArray(payload.keys)
      ? payload.keys.map((item) => String(item || '').trim()).filter(Boolean)
      : [];
    const domains = Array.isArray(payload.domains)
      ? payload.domains.map((item) => String(item || '').trim().toLowerCase()).filter(Boolean)
      : [];
    const selectAll = payload.selectAll === true;

    const filterPlan = typeof payload.filterPlan === 'string' ? payload.filterPlan.trim().toUpperCase() : null;
    const filterActive = typeof payload.filterActive === 'boolean' ? payload.filterActive : null;

    if (!selectAll && keys.length === 0 && domains.length === 0) {
      return res.status(400).json({ error: 'Provide keys, domains, or selectAll=true' });
    }
    if (keys.length > 2000) return res.status(400).json({ error: 'Maximum 2000 keys per request' });
    if (domains.length > 2000) return res.status(400).json({ error: 'Maximum 2000 domains per request' });

    const keySet = new Set(keys);
    const domainSet = new Set(domains);

    const licenses = await kvGetLicenses();
    const updatedKeys = [];

    for (const license of licenses) {
      const licenseKey = String(license.license_key || '').trim();
      const domain = String(license.domain || '').trim().toLowerCase();
      const permanentDomain = String(license.permanent_domain || '').trim().toLowerCase();

      const keyMatch = keySet.has(licenseKey);
      const domainMatch = domainSet.has(domain) || (permanentDomain && domainSet.has(permanentDomain));
      const selectionMatch = selectAll || keyMatch || domainMatch;
      if (!selectionMatch) continue;

      if (filterPlan && String(license.plan || '').toUpperCase() !== filterPlan) continue;
      if (filterActive !== null && Boolean(license.active) !== filterActive) continue;

      if (!license.active) continue;

      license.active = 0;
      const auditNote = `[${new Date().toISOString()}] Bulk revoked via admin API`;
      license.notes = [license.notes, auditNote].filter(Boolean).join(' | ');
      updatedKeys.push(licenseKey);
    }

    await kvSaveLicenses(licenses);
    const store = getStore();
    store.licenses = licenses;
    saveStore();

    res.json({
      success: true,
      revoked_count: updatedKeys.length,
      revoked_keys: updatedKeys,
    });
  } catch (error) {
    console.error('[Admin] Bulk revoke licenses error:', error);
    res.status(500).json({ error: 'Failed to bulk revoke licenses' });
  }
});

router.post('/licenses/:key/resend-email', requireAdmin, async (req, res) => {
  try {
    const key = typeof req.params.key === 'string' ? req.params.key.trim() : '';
    if (!/^[A-Za-z0-9-]{6,80}$/.test(key)) {
      return res.status(400).json({ error: 'Invalid license key' });
    }

    const licenses = await kvGetLicenses();
    const license = licenses.find(item => item.license_key === key);
    if (!license) return res.status(404).json({ error: 'License not found' });

    const emailOverride = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
    const targetEmail = emailOverride || String(license.email || '').trim();
    if (!targetEmail) {
      return res.status(400).json({ error: 'No email on license. Provide email in request body.' });
    }
    if (!isValidEmail(targetEmail)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const nameOverride = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    const targetName = nameOverride || String(license.customer_name || license.username || '').trim();

    await sendWelcomeEmail({
      email: targetEmail,
      name: targetName || null,
      licenseKey: license.license_key,
      plan: license.plan || 'LITE',
    });

    res.json({
      success: true,
      sent_to: targetEmail,
      license_key: license.license_key,
      plan: license.plan || 'LITE',
    });
  } catch (error) {
    console.error('[Admin] Resend license email error:', error);
    res.status(500).json({ error: 'Failed to resend license email' });
  }
});

router.post('/licenses/:key/renew', requireAdmin, async (req, res) => {
  try {
    const key = typeof req.params.key === 'string' ? req.params.key.trim() : '';
    if (!/^[A-Za-z0-9-]{6,80}$/.test(key)) {
      return res.status(400).json({ error: 'Invalid license key' });
    }

    const payload = req.body || {};
    const makePermanent = payload.make_permanent === true;
    const daysRaw = payload.days;
    const days = Number.isInteger(daysRaw) ? daysRaw : Number.parseInt(String(daysRaw), 10);
    const hasDays = Number.isInteger(days) && days > 0;
    const expiresAtInput = typeof payload.expires_at === 'string' ? payload.expires_at.trim() : '';
    const hasExpiresAt = Boolean(expiresAtInput);

    if (!makePermanent && !hasDays && !hasExpiresAt) {
      return res.status(400).json({ error: 'Provide days, expires_at, or make_permanent=true' });
    }
    if (hasDays && (days < 1 || days > 3650)) {
      return res.status(400).json({ error: 'days must be between 1 and 3650' });
    }

    let nextExpiry = null;
    if (!makePermanent && hasExpiresAt) {
      const parsed = Date.parse(expiresAtInput);
      if (Number.isNaN(parsed)) return res.status(400).json({ error: 'Invalid expires_at value' });
      nextExpiry = new Date(parsed).toISOString();
    }

    const licenses = await kvGetLicenses();
    const license = licenses.find(item => item.license_key === key);
    if (!license) return res.status(404).json({ error: 'License not found' });

    if (!makePermanent && !hasExpiresAt && hasDays) {
      const now = Date.now();
      const currentExpiry = license.expires_at ? Date.parse(license.expires_at) : NaN;
      const base = Number.isNaN(currentExpiry) || currentExpiry < now ? now : currentExpiry;
      nextExpiry = new Date(base + days * 24 * 60 * 60 * 1000).toISOString();
    }

    const previousExpiry = license.expires_at || null;
    license.expires_at = makePermanent ? null : nextExpiry;
    license.active = 1;

    const note = typeof payload.note === 'string' ? payload.note.trim() : '';
    const auditNote = makePermanent
      ? `[${new Date().toISOString()}] Renewed: set to permanent`
      : `[${new Date().toISOString()}] Renewed: expires_at=${license.expires_at}`;
    license.notes = [license.notes, auditNote, note || null].filter(Boolean).join(' | ');

    await kvSaveLicenses(licenses);
    const store = getStore();
    store.licenses = licenses;
    saveStore();

    res.json({
      success: true,
      license_key: license.license_key,
      previous_expires_at: previousExpiry,
      expires_at: license.expires_at,
      active: license.active,
    });
  } catch (error) {
    console.error('[Admin] Renew license error:', error);
    res.status(500).json({ error: 'Failed to renew license' });
  }
});

// Logs & Stats
router.get('/logs', requireAdmin, (req, res) => {
  const requestedLimit = Number.parseInt(String(req.query.limit || '100'), 10);
  const safeLimit = Number.isInteger(requestedLimit) ? requestedLimit : 100;
  const limit = Math.max(1, Math.min(safeLimit, 500));
  res.json({ logs: getStore().request_log.slice(0, limit) });
});

router.get('/stats', requireAdmin, (req, res) => {
  const store = getStore();
  const today = new Date().toISOString().split('T')[0];
  const totalLicenses = store.licenses.length;
  const activeLicenses = store.licenses.filter(l => l.active).length;
  const todayRequests = store.request_log.filter(l => l.created_at && l.created_at.startsWith(today)).length;
  const failedToday = store.request_log.filter(l => l.created_at && l.created_at.startsWith(today) && l.status !== 'success').length;
  res.json({ licenses: { total: totalLicenses, active: activeLicenses }, requests: { today: todayRequests, failed_today: failedToday } });
});

router.get('/observability', requireAdmin, async (req, res) => {
  try {
    const store = getStore();
    const now = Date.now();
    const dayAgoIso = new Date(now - 24 * 60 * 60 * 1000).toISOString();

    const [licenses, tickets] = await Promise.all([
      kvGetLicenses(),
      kvGetTickets(),
    ]);

    const requestLog = store.request_log || [];
    const requestsLast24h = requestLog.filter(entry => entry.created_at && entry.created_at >= dayAgoIso);
    const failedLast24h = requestsLast24h.filter(entry => entry.status !== 'success');
    const reasonCounts = {};
    for (const entry of failedLast24h) {
      const reason = entry.status || 'unknown';
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
    }
    const topFailureReasons = Object.entries(reasonCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([reason, count]) => ({ reason, count }));

    res.json({
      timestamp: new Date().toISOString(),
      runtime: {
        node_version: process.version,
        uptime_seconds: Math.floor(process.uptime()),
        memory_mb: Math.round((process.memoryUsage().rss / (1024 * 1024)) * 10) / 10,
        env: process.env.NODE_ENV || 'development',
      },
      data: {
        licenses_total: licenses.length,
        licenses_active: licenses.filter(item => item.active).length,
        tickets_total: tickets.length,
        tickets_unread: tickets.filter(item => !item.read).length,
      },
      requests: {
        total_logged: requestLog.length,
        last_24h: requestsLast24h.length,
        failed_last_24h: failedLast24h.length,
        top_failure_reasons: topFailureReasons,
      },
      kv: kvGetRuntimeStatus(),
    });
  } catch (error) {
    console.error('[Admin] Observability error:', error);
    res.status(500).json({ error: 'Failed to fetch observability metrics' });
  }
});

// Remote content
router.post('/remote-content', requireAdmin, validate(schemas.remoteContent), (req, res) => {
  const { domain, css, html, js, redirect_url } = req.body;
  const store = getStore();
  store.remote_content.push({ id: nextId(), domain, css: css||null, html: html||null, js: js||null, redirect_url: redirect_url||null, active: 1, created_at: new Date().toISOString() });
  saveStore();
  res.json({ message: 'Remote content added' });
});

router.get('/remote-content', requireAdmin, (req, res) => {
  res.json({ content: getStore().remote_content });
});

router.delete('/remote-content/:id', requireAdmin, (req, res) => {
  const id = parsePositiveInt(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id' });
  const store = getStore();
  store.remote_content = store.remote_content.filter(r => r.id !== id);
  saveStore();
  res.json({ message: 'Remote content deleted' });
});

// Tickets
router.get('/tickets', requireAdmin, async (req, res) => {
  try {
    const tickets = await kvGetTickets();
    const unread = tickets.filter(t => !t.read).length;
    res.json({ tickets: tickets.slice().reverse(), unread });
  } catch (error) {
    console.error('[Admin] Get tickets error:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

router.get('/tickets/export.csv', requireAdmin, async (req, res) => {
  try {
    const tickets = await kvGetTickets();
    const statusFilter = typeof req.query.status === 'string' ? req.query.status.trim().toLowerCase() : null;
    const readFilter = boolQuery(req.query.read);
    const emailFilter = typeof req.query.email === 'string' ? req.query.email.trim().toLowerCase() : null;

    let filtered = tickets;
    if (statusFilter) filtered = filtered.filter(item => String(item.status || '').toLowerCase() === statusFilter);
    if (readFilter === true) filtered = filtered.filter(item => Boolean(item.read));
    if (readFilter === false) filtered = filtered.filter(item => !item.read);
    if (emailFilter) filtered = filtered.filter(item => String(item.email || '').toLowerCase().includes(emailFilter));

    const columns = [
      'id',
      'name',
      'email',
      'status',
      'read',
      'message',
      'created_at',
      'updated_at',
      'replies_count',
      'last_reply_at',
    ];

    const rows = filtered
      .slice()
      .sort((a, b) => String(b.updated_at || '').localeCompare(String(a.updated_at || '')))
      .map(item => {
        const replies = Array.isArray(item.replies) ? item.replies : [];
        const lastReply = replies.length > 0 ? replies[replies.length - 1] : null;
        return {
          id: item.id,
          name: item.name,
          email: item.email,
          status: item.status,
          read: Boolean(item.read),
          message: item.message,
          created_at: item.created_at,
          updated_at: item.updated_at,
          replies_count: replies.length,
          last_reply_at: lastReply ? lastReply.sent_at : null,
        };
      });

    const lines = [
      columns.join(','),
      ...rows.map(row => columns.map(column => toCsvValue(row[column])).join(',')),
    ];

    const dateLabel = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="tickets-${dateLabel}.csv"`);
    res.send(lines.join('\n'));
  } catch (error) {
    console.error('[Admin] Export tickets CSV error:', error);
    res.status(500).json({ error: 'Failed to export tickets CSV' });
  }
});

router.post('/tickets/bulk-update', requireAdmin, async (req, res) => {
  try {
    const payload = req.body || {};
    const updateStatus = typeof payload.status === 'string' ? payload.status.trim() : null;
    const updateRead = typeof payload.read === 'boolean' ? payload.read : null;
    if (!updateStatus && updateRead === null) {
      return res.status(400).json({ error: 'status or read must be provided' });
    }

    const allowedStatuses = ['open', 'in-progress', 'closed'];
    if (updateStatus && !allowedStatuses.includes(updateStatus)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const tickets = await kvGetTickets();
    const ids = Array.isArray(payload.ids)
      ? payload.ids.map(parsePositiveInt).filter(Boolean)
      : [];
    if (ids.length > 1000) return res.status(400).json({ error: 'Maximum 1000 ids per request' });

    const filterStatus = typeof payload.filterStatus === 'string' ? payload.filterStatus.trim().toLowerCase() : null;
    const filterRead = typeof payload.filterRead === 'boolean' ? payload.filterRead : null;
    const filterEmail = typeof payload.filterEmail === 'string' ? payload.filterEmail.trim().toLowerCase() : null;
    const selectAll = payload.selectAll === true;

    const idSet = new Set(ids);
    const targets = tickets.filter((ticket) => {
      const idMatch = idSet.has(ticket.id);
      const allMatch = selectAll;
      if (!idMatch && !allMatch) return false;
      if (filterStatus && String(ticket.status || '').toLowerCase() !== filterStatus) return false;
      if (filterRead !== null && Boolean(ticket.read) !== filterRead) return false;
      if (filterEmail && !String(ticket.email || '').toLowerCase().includes(filterEmail)) return false;
      return true;
    });

    if (targets.length === 0) {
      return res.json({ success: true, updated_count: 0, updated_ids: [] });
    }

    const updatedIds = [];
    const now = new Date().toISOString();
    for (const ticket of targets) {
      if (updateStatus) ticket.status = updateStatus;
      if (updateRead !== null) ticket.read = updateRead;
      ticket.updated_at = now;
      updatedIds.push(ticket.id);
    }

    await kvSaveTickets(tickets);
    res.json({
      success: true,
      updated_count: updatedIds.length,
      updated_ids: updatedIds,
    });
  } catch (error) {
    console.error('[Admin] Bulk update tickets error:', error);
    res.status(500).json({ error: 'Failed to bulk update tickets' });
  }
});

router.post('/tickets/archive-closed', requireAdmin, async (req, res) => {
  try {
    const payload = req.body || {};
    const olderThanDaysRaw = Number.parseInt(String(payload.olderThanDays ?? 30), 10);
    const olderThanDays = Number.isInteger(olderThanDaysRaw) ? olderThanDaysRaw : 30;
    const dryRun = payload.dryRun === true;

    if (olderThanDays < 1 || olderThanDays > 3650) {
      return res.status(400).json({ error: 'olderThanDays must be between 1 and 3650' });
    }

    const cutoff = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
    const tickets = await kvGetTickets();

    const archived = [];
    const kept = [];
    for (const ticket of tickets) {
      const updatedAt = ticket.updated_at ? Date.parse(ticket.updated_at) : NaN;
      const isOldEnough = !Number.isNaN(updatedAt) && updatedAt <= cutoff;
      if (String(ticket.status || '').toLowerCase() === 'closed' && isOldEnough) {
        archived.push(ticket);
      } else {
        kept.push(ticket);
      }
    }

    if (!dryRun && archived.length > 0) {
      await kvSaveTickets(kept);
    }

    res.json({
      success: true,
      dry_run: dryRun,
      older_than_days: olderThanDays,
      archived_count: archived.length,
      archived_ids: archived.map((ticket) => ticket.id),
      remaining_count: dryRun ? tickets.length : kept.length,
    });
  } catch (error) {
    console.error('[Admin] Archive closed tickets error:', error);
    res.status(500).json({ error: 'Failed to archive closed tickets' });
  }
});

router.put('/tickets/:id', requireAdmin, validate(schemas.ticketUpdate), async (req, res) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid ticket id' });

    const { tickets, ticket } = await loadTicketsWithTicket(id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    const { status, read } = req.body;
    if (status) ticket.status = status;
    if (typeof read === 'boolean') ticket.read = read;
    ticket.updated_at = new Date().toISOString();
    await kvSaveTickets(tickets);
    res.json({ ticket });
  } catch (error) {
    console.error('[Admin] Update ticket error:', error);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

router.post('/tickets/:id/reply', requireAdmin, validate(schemas.ticketReply), async (req, res) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid ticket id' });

    const { tickets, ticket } = await loadTicketsWithTicket(id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    const { message } = req.body;
    const reply = {
      id: Date.now(),
      message: message.trim().slice(0, 5000),
      sent_at: new Date().toISOString(),
    };
    ticket.replies.push(reply);
    if (ticket.status === 'open') ticket.status = 'in-progress';
    ticket.updated_at = new Date().toISOString();
    await kvSaveTickets(tickets);

    // Persist reply even if outbound email fails.
    try {
      await sendTicketReplyEmail({
        email: ticket.email,
        name: ticket.name,
        message,
        ticketId: ticket.id,
      });
      return res.json({ success: true, reply });
    } catch (emailError) {
      console.error('[Admin] Send reply email error:', emailError);
      return res.status(202).json({ success: true, reply, email_warning: 'Reply saved but email delivery failed' });
    }
  } catch (error) {
    console.error('[Admin] Reply ticket error:', error);
    res.status(500).json({ error: 'Failed to send reply' });
  }
});

router.get('/tickets/unread-count', requireAdmin, async (req, res) => {
  try {
    const tickets = await kvGetTickets();
    res.json({ unread: tickets.filter(t => !t.read).length });
  } catch (error) {
    console.error('[Admin] Unread count error:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

// Theme download
router.get('/download-theme', requireAdmin, (req, res) => {
  try {
    const archiver = require('archiver');
    const themePath = path.join(__dirname, '..', '..', 'theme-dist');
    if (!fs.existsSync(themePath)) return res.status(404).json({ error: 'Theme files not found' });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="scaled-theme-v3.zip"');
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', () => {
      if (!res.headersSent) res.status(500).json({ error: 'Failed to build theme archive' });
    });
    archive.pipe(res);
    archive.directory(themePath, false);
    archive.finalize();
  } catch(e) {
    res.status(500).json({ error: 'archiver not installed — run npm install' });
  }
});

module.exports = router;
