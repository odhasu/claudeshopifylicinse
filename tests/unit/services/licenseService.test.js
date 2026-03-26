'use strict';

// ─── Mocks (hoisted before imports) ─────────────────────────────────────────

const mockLicenses = [];

jest.mock('../../../src/services/kvService', () => ({
  kvGetLicenses: jest.fn(),
  kvSaveLicenses: jest.fn().mockResolvedValue(undefined),
  KV_ENABLED: false,
}));

jest.mock('../../../src/services/storeService', () => ({
  getStore: jest.fn(() => ({ licenses: mockLicenses, request_log: [] })),
  saveStore: jest.fn(),
  nextId: jest.fn(() => Math.floor(Math.random() * 100000) + 1000),
}));

// ─── Imports ─────────────────────────────────────────────────────────────────

const { generateLicenseKey, createLicense, validateLicense } = require('../../../src/services/licenseService');
const { kvGetLicenses, kvSaveLicenses } = require('../../../src/services/kvService');
const { getStore } = require('../../../src/services/storeService');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function resetMockLicenses(list = []) {
  mockLicenses.length = 0;
  list.forEach(l => mockLicenses.push(l));
  kvGetLicenses.mockResolvedValue([...mockLicenses]);
  getStore.mockReturnValue({ licenses: [...mockLicenses], request_log: [] });
}

beforeEach(() => {
  jest.clearAllMocks();
  resetMockLicenses();
  kvGetLicenses.mockResolvedValue([]);
  kvSaveLicenses.mockResolvedValue(undefined);
});

// ─── generateLicenseKey ───────────────────────────────────────────────────────

describe('generateLicenseKey', () => {
  test('returns a string in XXXX-XXXX-XXXX-XXXX format', () => {
    const key = generateLicenseKey();
    expect(key).toMatch(/^[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}$/);
  });

  test('generates unique keys on consecutive calls', () => {
    const keys = new Set();
    for (let i = 0; i < 20; i++) keys.add(generateLicenseKey());
    // Highly unlikely to have collisions — all 20 should be unique
    expect(keys.size).toBe(20);
  });

  test('the 4th segment is a valid checksum of the first three', () => {
    const vxChecksum = require('../../../src/utils/checksum');
    const key = generateLicenseKey();
    const [a, b, c, d] = key.split('-');
    expect(vxChecksum(a, b, c)).toBe(d);
  });
});

// ─── createLicense ────────────────────────────────────────────────────────────

describe('createLicense', () => {
  test('creates a license with the expected fields', async () => {
    kvGetLicenses.mockResolvedValue([]);

    const license = await createLicense({
      username: 'test-user',
      domain: 'mystore.myshopify.com',
      plan: 'LITE',
      email: 'buyer@example.com',
    });

    expect(license).toMatchObject({
      username: 'test-user',
      domain: 'mystore.myshopify.com',
      plan: 'LITE',
      email: 'buyer@example.com',
      active: 1,
    });
    expect(license.license_key).toMatch(/^[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}$/);
  });

  test('sets domain to "*" when not provided', async () => {
    kvGetLicenses.mockResolvedValue([]);
    const license = await createLicense({ plan: 'PRO', email: 'a@b.com' });
    expect(license.domain).toBe('*');
    expect(license.permanent_domain).toBe('*');
  });

  test('idempotency: returns the same license for a duplicate stripe_session_id', async () => {
    const existing = {
      id: 1,
      license_key: 'AAAA-BBBB-CCCC-DDDD',
      stripe_session_id: 'cs_test_abc123',
      plan: 'LITE',
      active: 1,
    };
    kvGetLicenses.mockResolvedValue([existing]);

    const result = await createLicense({
      email: 'other@example.com',
      plan: 'PRO',
      stripe_session_id: 'cs_test_abc123',
    });

    // Must return the existing license, not create a new one
    expect(result.license_key).toBe('AAAA-BBBB-CCCC-DDDD');
    expect(kvSaveLicenses).not.toHaveBeenCalled();
  });

  test('idempotency: returns the same license for a duplicate stripe_payment_intent_id', async () => {
    const existing = {
      id: 2,
      license_key: 'PPPP-QQQQ-RRRR-SSSS',
      stripe_payment_intent_id: 'pi_test_xyz789',
      plan: 'PRO',
      active: 1,
    };
    kvGetLicenses.mockResolvedValue([existing]);

    const result = await createLicense({
      email: 'new@example.com',
      plan: 'LITE',
      stripe_payment_intent_id: 'pi_test_xyz789',
    });

    expect(result.license_key).toBe('PPPP-QQQQ-RRRR-SSSS');
    expect(kvSaveLicenses).not.toHaveBeenCalled();
  });

  test('persists the new license by calling kvSaveLicenses', async () => {
    kvGetLicenses.mockResolvedValue([]);
    await createLicense({ plan: 'LITE', email: 'persist@example.com' });
    expect(kvSaveLicenses).toHaveBeenCalledTimes(1);
    const savedList = kvSaveLicenses.mock.calls[0][0];
    expect(Array.isArray(savedList)).toBe(true);
    expect(savedList).toHaveLength(1);
  });
});

// ─── validateLicense ──────────────────────────────────────────────────────────

describe('validateLicense', () => {
  const activeLicense = {
    id: 10,
    license_key: 'VVVV-WWWW-XXXX-YYYY',
    domain: 'test-store.myshopify.com',
    permanent_domain: 'test-store.myshopify.com',
    plan: 'PRO',
    active: 1,
    expires_at: null,
  };

  beforeEach(() => {
    kvGetLicenses.mockResolvedValue([activeLicense]);
    kvSaveLicenses.mockResolvedValue(undefined);
  });

  test('returns valid:true for a matching license key and domain', async () => {
    const result = await validateLicense('VVVV-WWWW-XXXX-YYYY', 'test-store.myshopify.com');
    expect(result.valid).toBe(true);
    expect(result.license.plan).toBe('PRO');
  });

  test('returns valid:false with reason "invalid_key" for an unknown key', async () => {
    const result = await validateLicense('ZZZZ-ZZZZ-ZZZZ-ZZZZ', 'test-store.myshopify.com');
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('invalid_key');
  });

  test('returns valid:false with reason "expired" for an expired license', async () => {
    const expired = {
      ...activeLicense,
      license_key: 'EXPR-EXPR-EXPR-EXPR',
      expires_at: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
    };
    kvGetLicenses.mockResolvedValue([expired]);

    const result = await validateLicense('EXPR-EXPR-EXPR-EXPR', 'test-store.myshopify.com');
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('expired');
  });

  test('returns valid:false with reason "domain_mismatch" for a wrong domain', async () => {
    const result = await validateLicense('VVVV-WWWW-XXXX-YYYY', 'different-store.myshopify.com');
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('domain_mismatch');
  });

  test('wildcard license (*) accepts any domain and binds it', async () => {
    const wildcard = { ...activeLicense, license_key: 'WILD-WILD-WILD-WILD', domain: '*', permanent_domain: '*' };
    kvGetLicenses.mockResolvedValue([wildcard]);

    const result = await validateLicense('WILD-WILD-WILD-WILD', 'new-store.myshopify.com');
    expect(result.valid).toBe(true);
  });

  test('increments request_count on a successful validation', async () => {
    const license = { ...activeLicense, request_count: 4 };
    kvGetLicenses.mockResolvedValue([license]);

    const result = await validateLicense('VVVV-WWWW-XXXX-YYYY', 'test-store.myshopify.com');
    expect(result.valid).toBe(true);
    const saved = kvSaveLicenses.mock.calls[0][0];
    const updatedLicense = saved.find(l => l.license_key === 'VVVV-WWWW-XXXX-YYYY');
    expect(updatedLicense.request_count).toBe(5);
  });

  test('falls back to local store when KV throws', async () => {
    kvGetLicenses.mockRejectedValue(new Error('KV unavailable'));
    getStore.mockReturnValue({
      licenses: [activeLicense],
      request_log: [],
    });

    const result = await validateLicense('VVVV-WWWW-XXXX-YYYY', 'test-store.myshopify.com');
    expect(result.valid).toBe(true);
  });
});
