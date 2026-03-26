const express = require('express');
const router = express.Router();
const { getStore } = require('../services/storeService');
const { kvGetLicenses } = require('../services/kvService');
const rateLimit = require('../middleware/rateLimit');

const LOOKUP_CACHE_TTL_MS = 5000;
const LOOKUP_CACHE_MAX_ENTRIES = 500;
const lookupCache = new Map();
const NOT_READY_RESPONSE = {
  error: 'License not ready yet',
  hint: 'License is being created. Try again in 1-2 seconds.'
};
const LOOKUP_ERROR_RESPONSE = { error: 'Failed to retrieve license' };
const ID_PATTERNS = {
  payment_intent: /^pi_[A-Za-z0-9_]{8,128}$/,
  session: /^cs_[A-Za-z0-9_]{8,200}$/,
};

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

function sendInvalidId(res, label) {
  return res.status(400).json({ error: `Invalid ${label}` });
}

function createLookupHandler({
  paramName,
  idPattern,
  cachePrefix,
  invalidLabel,
  predicate,
  rateLimitKey,
}) {
  return async (req, res) => {
    const value = req.params[paramName];
    if (!value || !idPattern.test(value)) {
      return sendInvalidId(res, invalidLabel);
    }

    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
    const allowed = await rateLimit(ip, `license_lookup:${rateLimitKey}`, 60, 60 * 1000);
    if (!allowed) {
      return res.status(429).json({ error: 'Too many lookup attempts. Please try again shortly.' });
    }

    const cacheKey = `${cachePrefix}:${value}`;

    try {
      let response = getCachedLicense(cacheKey);

      if (!response) {
        const license = await findLicense((l) => predicate(l, value));

        if (!license) {
          return res.status(404).json(NOT_READY_RESPONSE);
        }

        response = toLookupResponse(license);
        setCachedLicense(cacheKey, response);
      }

      return res.json(response);
    } catch (err) {
      console.error('[License Lookup] Error fetching license:', err.message);
      return res.status(500).json(LOOKUP_ERROR_RESPONSE);
    }
  };
}

router.get('/by-payment-intent/:pi_id', createLookupHandler({
  paramName: 'pi_id',
  idPattern: ID_PATTERNS.payment_intent,
  cachePrefix: 'pi',
  invalidLabel: 'payment_intent id',
  predicate: (license, value) => license.stripe_payment_intent_id === value,
  rateLimitKey: 'pi',
}));

router.get('/by-session/:session_id', createLookupHandler({
  paramName: 'session_id',
  idPattern: ID_PATTERNS.session,
  cachePrefix: 'cs',
  invalidLabel: 'session_id',
  predicate: (license, value) => license.stripe_session_id === value,
  rateLimitKey: 'cs',
}));

module.exports = router;
