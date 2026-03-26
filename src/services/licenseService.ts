import crypto from 'crypto';
import vxChecksum from '../utils/checksum';
import normalizeDomain from '../utils/domainNorm';
import { getStore, saveStore, nextId } from './storeService';
import { kvGetLicenses, kvSaveLicenses } from './kvService';
import type { License, LicenseCreateData, ValidationResult } from '../types';

export function generateLicenseKey(): string {
  const segments: string[] = [];
  for (let i = 0; i < 3; i++) {
    segments.push(crypto.randomBytes(2).toString('hex').toUpperCase());
  }
  const checksum = vxChecksum(segments[0], segments[1], segments[2]);
  segments.push(checksum);
  return segments.join('-');
}

function buildLicenseRecord(data: LicenseCreateData, licenseKey: string): License {
  return {
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
    notes: data.notes || '',
  };
}

export async function validateLicense(licenseKey: string, domain: string): Promise<ValidationResult> {
  try {
    const licenses = await kvGetLicenses();
    const license = licenses.find(l => l.license_key === licenseKey && l.active);
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

    // Update in persistent storage
    const updatedIndex = licenses.findIndex(l => l.license_key === licenseKey);
    if (updatedIndex !== -1) {
      licenses[updatedIndex] = license;
      await kvSaveLicenses(licenses);
    }

    return { valid: true, license };
  } catch (e: unknown) {
    console.error('[License] validateLicense error:', (e as Error).message);
    // Fallback: check local store
    const store = getStore();
    const license = store.licenses.find(l => l.license_key === licenseKey && l.active);
    if (!license) return { valid: false, reason: 'invalid_key' };
    if (license.expires_at && new Date(license.expires_at) < new Date()) {
      return { valid: false, reason: 'expired' };
    }
    return { valid: true, license };
  }
}

export function logRequest(licenseKey: string, domain: string, ip: string, userAgent: string, status: string): void {
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

export async function createLicense(data: LicenseCreateData): Promise<License> {
  try {
    const licenses = await kvGetLicenses();

    // Idempotency guard for payment events to prevent duplicate licenses on retries.
    if (data.stripe_session_id) {
      const existingBySession = licenses.find((item) => item.stripe_session_id === data.stripe_session_id);
      if (existingBySession) return existingBySession;
    }
    if (data.stripe_payment_intent_id) {
      const existingByPi = licenses.find((item) => item.stripe_payment_intent_id === data.stripe_payment_intent_id);
      if (existingByPi) return existingByPi;
    }

    let license: License | undefined;
    let created = false;
    for (let i = 0; i < 5; i++) {
      const licenseKey = generateLicenseKey();
      const duplicate = licenses.some((item) => item.license_key === licenseKey);
      if (duplicate) continue;
      license = buildLicenseRecord(data, licenseKey);
      licenses.push(license);
      created = true;
      break;
    }

    if (!created || !license) {
      throw new Error('Failed to allocate unique license key');
    }

    await kvSaveLicenses(licenses);

    // Also update local store for fallback
    const store = getStore();
    store.licenses.push(license);
    saveStore();

    return license;
  } catch (e: unknown) {
    console.error('[License] createLicense error:', (e as Error).message);
    // Fallback: create in local store only
    const store = getStore();

    if (data.stripe_session_id) {
      const existingBySession = store.licenses.find((item) => item.stripe_session_id === data.stripe_session_id);
      if (existingBySession) return existingBySession;
    }
    if (data.stripe_payment_intent_id) {
      const existingByPi = store.licenses.find((item) => item.stripe_payment_intent_id === data.stripe_payment_intent_id);
      if (existingByPi) return existingByPi;
    }

    let license: License | undefined;
    let created = false;
    for (let i = 0; i < 5; i++) {
      const licenseKey = generateLicenseKey();
      const duplicate = store.licenses.some((item) => item.license_key === licenseKey);
      if (duplicate) continue;
      license = buildLicenseRecord(data, licenseKey);
      store.licenses.push(license);
      created = true;
      break;
    }

    if (!created || !license) {
      throw new Error('Failed to allocate unique license key in fallback storage');
    }

    saveStore();
    return license;
  }
}
