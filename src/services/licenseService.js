const crypto = require('crypto');
const vxChecksum = require('../utils/checksum');
const normalizeDomain = require('../utils/domainNorm');
const { getStore, saveStore, nextId } = require('./storeService');

function generateLicenseKey() {
  const segments = [];
  for (let i = 0; i < 3; i++) {
    segments.push(crypto.randomBytes(2).toString('hex').toUpperCase());
  }
  const checksum = vxChecksum(segments[0], segments[1], segments[2]);
  segments.push(checksum);
  return segments.join('-');
}

function validateLicense(licenseKey, domain) {
  const store = getStore();
  const license = store.licenses.find(l => l.license_key === licenseKey && l.active);
  if (!license) return { valid: false, reason: 'invalid_key' };
  if (license.expires_at && new Date(license.expires_at) < new Date()) {
    return { valid: false, reason: 'expired' };
  }

  if (license.domain === '*') {
    if (domain && normalizeDomain(domain) !== '') {
      license.domain = normalizeDomain(domain);
      license.permanent_domain = normalizeDomain(domain);
    }
  } else {
    const normalizedDomain = normalizeDomain(domain);
    const licenseDomain = normalizeDomain(license.domain);
    const permanentDomain = normalizeDomain(license.permanent_domain);

    if (normalizedDomain !== licenseDomain && normalizedDomain !== permanentDomain) {
      return { valid: false, reason: 'domain_mismatch', expected: licenseDomain };
    }
  }

  license.last_verified_at = new Date().toISOString();
  license.request_count = (license.request_count || 0) + 1;
  saveStore();
  return { valid: true, license };
}

function logRequest(licenseKey, domain, ip, userAgent, status) {
  const store = getStore();
  store.request_log.unshift({
    id: nextId(),
    license_key: licenseKey,
    domain,
    ip,
    user_agent: userAgent,
    status,
    created_at: new Date().toISOString()
  });
  if (store.request_log.length > 1000) store.request_log = store.request_log.slice(0, 1000);
  saveStore();
}

function createLicense(data) {
  const store = getStore();
  const licenseKey = generateLicenseKey();
  const license = {
    id: nextId(),
    license_key: licenseKey,
    username: data.username || '',
    domain: data.domain || '*',
    permanent_domain: data.permanent_domain || data.domain || '*',
    store_name: data.store_name || '',
    plan: data.plan || 'standard',
    active: 1,
    created_at: new Date().toISOString(),
    expires_at: data.expires_at || null,
    last_verified_at: null,
    request_count: 0,
    email: data.email || null,
    customer_name: data.customer_name || null,
    stripe_session_id: data.stripe_session_id || null,
    stripe_payment_intent_id: data.stripe_payment_intent_id || null,
    notes: data.notes || ''
  };
  store.licenses.push(license);
  saveStore();
  return license;
}

module.exports = { generateLicenseKey, validateLicense, logRequest, createLicense };
