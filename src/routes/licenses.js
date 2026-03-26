const express = require('express');
const router = express.Router();
const { getStore } = require('../services/storeService');
const { kvGetLicenses } = require('../services/kvService');

const LOOKUP_CACHE_TTL_MS = 5000;
const lookupCache = new Map();

function getCachedLicense(cacheKey) {
  const cached = lookupCache.get(cacheKey);
  if (!cached) return null;
  if (Date.now() > cached.expiresAt) {
    lookupCache.delete(cacheKey);
    return null;
  }
  return cached.license;
}

function setCachedLicense(cacheKey, license) {
  lookupCache.set(cacheKey, {
    license,
    expiresAt: Date.now() + LOOKUP_CACHE_TTL_MS,
  });
}

router.get('/by-payment-intent/:pi_id', async (req, res) => {
  const { pi_id } = req.params;
  if (!pi_id || !pi_id.startsWith('pi_')) return res.status(400).json({ error: 'Invalid payment_intent id' });
  const cacheKey = `pi:${pi_id}`;
  
  try {
    let license = getCachedLicense(cacheKey);

    if (!license) {
    // Try KV store first (primary source of truth)
    const kvLicenses = await kvGetLicenses();
      license = kvLicenses.find(l => l.stripe_payment_intent_id === pi_id);
    
    // Fall back to local store if not in KV
    if (!license) {
      const store = getStore();
      license = store.licenses.find(l => l.stripe_payment_intent_id === pi_id);
    }
    }
    
    if (!license) {
      return res.status(404).json({ 
        error: 'License not ready yet',
        hint: 'License is being created. Try again in 1-2 seconds.'
      });
    }

    setCachedLicense(cacheKey, license);
    
    res.json({
      license_key: license.license_key,
      plan: license.plan,
      email: license.email,
      created_at: license.created_at,
    });
  } catch (err) {
    console.error('[License Lookup] Error fetching license:', err.message);
    res.status(500).json({ error: 'Failed to retrieve license' });
  }
});

router.get('/by-session/:session_id', async (req, res) => {
  const { session_id } = req.params;
  if (!session_id || !session_id.startsWith('cs_')) return res.status(400).json({ error: 'Invalid session_id' });
  const cacheKey = `cs:${session_id}`;
  
  try {
    let license = getCachedLicense(cacheKey);

    if (!license) {
    // Try KV store first (primary source of truth)
    const kvLicenses = await kvGetLicenses();
      license = kvLicenses.find(l => l.stripe_session_id === session_id);
    
    // Fall back to local store if not in KV
    if (!license) {
      const store = getStore();
      license = store.licenses.find(l => l.stripe_session_id === session_id);
    }
    }
    
    if (!license) {
      return res.status(404).json({ 
        error: 'License not ready yet',
        hint: 'License is being created. Try again in 1-2 seconds.'
      });
    }

    setCachedLicense(cacheKey, license);
    
    res.json({
      license_key: license.license_key,
      plan: license.plan,
      email: license.email,
      created_at: license.created_at,
    });
  } catch (err) {
    console.error('[License Lookup] Error fetching license:', err.message);
    res.status(500).json({ error: 'Failed to retrieve license' });
  }
});

module.exports = router;
