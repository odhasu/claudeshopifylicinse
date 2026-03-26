const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/requireAdmin');
const { sendWelcomeEmail } = require('../services/emailService');

// POST /api/email/test — admin-only test endpoint
router.post('/test', requireAdmin, async (req, res) => {
  const { email, plan } = req.body;
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'A valid email address is required' });
  }
  const normalizedPlan = typeof plan === 'string' && ['LITE', 'PRO'].includes(plan.toUpperCase())
    ? plan.toUpperCase()
    : 'LITE';
  try {
    await sendWelcomeEmail({
      email: email.trim(),
      name: 'Test User',
      licenseKey: 'VXEL-TEST-XXXX-XXXX',
      plan: normalizedPlan,
    });
    res.json({ ok: true, sent_to: email.trim() });
  } catch (err) {
    console.error('[Email Test] Error:', err.message);
    res.status(500).json({ error: 'Failed to send test email' });
  }
});

module.exports = router;
