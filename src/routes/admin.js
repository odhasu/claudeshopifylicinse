const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { requireAdmin } = require('../middleware/requireAdmin');
const { validate, schemas } = require('../middleware/validate');
const { getStore, saveStore, nextId } = require('../services/storeService');
const { kvGetTickets, kvSaveTickets, kvGetLicenses, kvSaveLicenses } = require('../services/kvService');
const { generateLicenseKey } = require('../services/licenseService');
const { sendTicketReplyEmail } = require('../services/emailService');

// License CRUD
router.post('/licenses', requireAdmin, validate(schemas.createLicense), async (req, res) => {
  try {
    const { username, domain, permanent_domain, store_name, plan, expires_at } = req.body;
    const licenses = await kvGetLicenses();
    const licenseKey = generateLicenseKey();
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

router.get('/licenses', requireAdmin, async (req, res) => {
  try {
    const licenses = await kvGetLicenses();
    res.json({ licenses: licenses.slice().reverse() });
  } catch (error) {
    console.error('[Admin] Get licenses error:', error);
    res.status(500).json({ error: 'Failed to fetch licenses' });
  }
});

router.delete('/licenses/:key', requireAdmin, async (req, res) => {
  try {
    const licenses = await kvGetLicenses();
    const license = licenses.find(l => l.license_key === req.params.key);
    if (license) { 
      license.active = 0; 
      await kvSaveLicenses(licenses);
      
      // Also update local store
      const store = getStore();
      const localLicense = store.licenses.find(l => l.license_key === req.params.key);
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

// Logs & Stats
router.get('/logs', requireAdmin, (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 100, 500);
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
  const store = getStore();
  store.remote_content = store.remote_content.filter(r => r.id !== parseInt(req.params.id));
  saveStore();
  res.json({ message: 'Remote content deleted' });
});

// Tickets
router.get('/tickets', requireAdmin, async (req, res) => {
  const tickets = await kvGetTickets();
  const unread = tickets.filter(t => !t.read).length;
  res.json({ tickets: tickets.slice().reverse(), unread });
});

router.put('/tickets/:id', requireAdmin, async (req, res) => {
  const tickets = await kvGetTickets();
  const ticket = tickets.find(t => t.id === parseInt(req.params.id));
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  const { status, read } = req.body;
  if (status && ['open', 'in-progress', 'closed'].includes(status)) ticket.status = status;
  if (typeof read === 'boolean') ticket.read = read;
  ticket.updated_at = new Date().toISOString();
  await kvSaveTickets(tickets);
  res.json({ ticket });
});

router.post('/tickets/:id/reply', requireAdmin, validate(schemas.ticketReply), async (req, res) => {
  const tickets = await kvGetTickets();
  const ticket = tickets.find(t => t.id === parseInt(req.params.id));
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

  // Send reply email to customer
  await sendTicketReplyEmail({
    email: ticket.email,
    name: ticket.name,
    message,
    ticketId: ticket.id,
  });

  res.json({ success: true, reply });
});

router.get('/tickets/unread-count', requireAdmin, async (req, res) => {
  const tickets = await kvGetTickets();
  res.json({ unread: tickets.filter(t => !t.read).length });
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
    archive.on('error', (err) => res.status(500).json({ error: err.message }));
    archive.pipe(res);
    archive.directory(themePath, false);
    archive.finalize();
  } catch(e) {
    res.status(500).json({ error: 'archiver not installed — run npm install' });
  }
});

module.exports = router;
