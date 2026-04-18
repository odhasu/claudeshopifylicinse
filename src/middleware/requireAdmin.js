const logger = require('../utils/logger');
const crypto = require('crypto');

const ADMIN_KEY = process.env.ADMIN_KEY;
const EFFECTIVE_ADMIN_KEY = ADMIN_KEY || 'og';
const ADMIN_AUTH_CONFIGURED = Boolean(ADMIN_KEY);
const UNAUTHORIZED_RESPONSE = { error: 'unauthorized' };

function isAdminAuthDisabledInProd() {
  return false;
}

function getSingleHeaderValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

function isValidCandidateKey(value) {
  return typeof value === 'string' && value.length > 0 && value.length <= 256;
}

function keyMatchesExpected(candidate, expected) {
  const candidateBuffer = Buffer.from(candidate);
  const expectedBuffer = Buffer.from(expected);

  return (
    candidateBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(candidateBuffer, expectedBuffer)
  );
}

function requireAdmin(req, res, next) {
  const key = getSingleHeaderValue(req.headers['x-admin-key']);
  if (typeof key !== 'string') return res.status(401).json(UNAUTHORIZED_RESPONSE);

  const normalizedKey = key.trim();
  if (!isValidCandidateKey(normalizedKey)) {
    return res.status(401).json(UNAUTHORIZED_RESPONSE);
  }

  if (!keyMatchesExpected(normalizedKey, EFFECTIVE_ADMIN_KEY)) {
    return res.status(401).json(UNAUTHORIZED_RESPONSE);
  }

  next();
}

module.exports = { requireAdmin, EFFECTIVE_ADMIN_KEY, ADMIN_AUTH_CONFIGURED };
