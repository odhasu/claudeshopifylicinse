const express = require('express');
const router = express.Router();
const { getStore } = require('../services/storeService');

router.get('/by-payment-intent/:pi_id', (req, res) => {
  const { pi_id } = req.params;
  if (!pi_id || !pi_id.startsWith('pi_')) return res.status(400).json({ error: 'Invalid payment_intent id' });
  const store = getStore();
  const license = store.licenses.find(l => l.stripe_payment_intent_id === pi_id);
  if (!license) return res.status(404).json({ error: 'License not ready yet' });
  res.json({
    license_key: license.license_key,
    plan: license.plan,
    email: license.email,
    created_at: license.created_at,
  });
});

router.get('/by-session/:session_id', (req, res) => {
  const { session_id } = req.params;
  if (!session_id || !session_id.startsWith('cs_')) return res.status(400).json({ error: 'Invalid session_id' });
  const store = getStore();
  const license = store.licenses.find(l => l.stripe_session_id === session_id);
  if (!license) return res.status(404).json({ error: 'License not ready yet' });
  res.json({
    license_key: license.license_key,
    plan: license.plan,
    email: license.email,
    created_at: license.created_at,
  });
});

module.exports = router;
