const express = require('express');
const router = express.Router();
const { getStore } = require('../services/storeService');
const { kvGetLicenses } = require('../services/kvService');

const LOOKUP_CACHE_TTL_MS = 5000;
const LOOKUP_CACHE_MAX_ENTRIES = 500;
const lookupCache = new Map();

function pruneLookupCache() {
  const now = Date.now();
  for (const [key, value] of lookupCache.entries()) {
    if (now > value.expiresAt) lookupCache.delete(key);
  }

  while (lookupCache.size > LOOKUP_CACHE_MAX_ENTRIES) {
    const oldestKey = lookupCache.keys().next().value;
    if (!oldestKey) break;
    lookupCache.delete(oldestKey);
  }
}

function getCachedLicense(cacheKey) {
  pruneLookupCache();
  const cached = lookupCache.get(cacheKey);
  if (!cached) return null;
  return cached.license;
}

function setCachedLicense(cacheKey, license) {
  pruneLookupCache();
  lookupCache.set(cacheKey, {
    license,
    expiresAt: Date.now() + LOOKUP_CACHE_TTL_MS,
  });
}

async function findLicense(predicate) {
  const kvLicenses = await kvGetLicenses();
  let license = kvLicenses.find(predicate);

  if (!license) {
    const store = getStore();
    license = store.licenses.find(predicate);
  }

  return license;
}

function toLookupResponse(license) {
  return {
    license_key: license.license_key,
    plan: license.plan,
    email: license.email,
    created_at: license.created_at,
  };
}

router.get('/by-payment-intent/:pi_id', async (req, res) => {
  const { pi_id } = req.params;
  if (!pi_id || !pi_id.startsWith('pi_')) return res.status(400).json({ error: 'Invalid payment_intent id' });
  const cacheKey = `pi:${pi_id}`;
  
  try {
    let response = getCachedLicense(cacheKey);

    if (!response) {
      const license = await findLicense((l) => l.stripe_payment_intent_id === pi_id);

      if (!license) {
        return res.status(404).json({
          error: 'License not ready yet',
          hint: 'License is being created. Try again in 1-2 seconds.'
        });
      }

      response = toLookupResponse(license);
      setCachedLicense(cacheKey, response);
    }

    res.json(response);
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
    let response = getCachedLicense(cacheKey);

    if (!response) {
      const license = await findLicense((l) => l.stripe_session_id === session_id);

      if (!license) {
        return res.status(404).json({
          error: 'License not ready yet',
          hint: 'License is being created. Try again in 1-2 seconds.'
        });
      }

      response = toLookupResponse(license);
      setCachedLicense(cacheKey, response);
    }

    res.json(response);
  } catch (err) {
    console.error('[License Lookup] Error fetching license:', err.message);
    res.status(500).json({ error: 'Failed to retrieve license' });
  }
});

module.exports = router;
