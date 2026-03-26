'use strict';

jest.mock('../../src/services/kvService');
jest.mock('../../src/services/storeService');
jest.mock('../../src/middleware/rateLimit');

const request = require('supertest');
const { kvGetLicenses } = require('../../src/services/kvService');
const { getStore } = require('../../src/services/storeService');
const app = require('../../index');

const testLicenses = [
  {
    id: 1,
    license_key: 'AAAA-BBBB-CCCC-DDDD',
    domain: 'my-store.myshopify.com',
    permanent_domain: 'my-store.myshopify.com',
    plan: 'LITE',
    active: 1,
    created_at: '2024-01-01T00:00:00.000Z',
    expires_at: null,
    last_verified_at: null,
    request_count: 0,
    notes: '',
    store_name: 'My Store',
  },
  {
    id: 2,
    license_key: 'EXPR-EXPR-EXPR-EXPI',
    domain: 'expired-store.myshopify.com',
    plan: 'LITE',
    active: 1,
    expires_at: new Date(Date.now() - 60000).toISOString(),
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  kvGetLicenses.mockResolvedValue(testLicenses);
  getStore.mockReturnValue({ licenses: testLicenses, request_log: [], remote_content: [], tickets: [] });
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  test('returns 200 and license details for a valid key', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ licenseKey: 'AAAA-BBBB-CCCC-DDDD' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.license.key).toBe('AAAA-BBBB-CCCC-DDDD');
    expect(res.body.license.plan).toBe('LITE');
  });

  test('returns 401 for an unknown license key', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ licenseKey: 'ZZZZ-ZZZZ-ZZZZ-ZZZZ' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  test('returns 401 for an expired license', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ licenseKey: 'EXPR-EXPR-EXPR-EXPI' });

    expect(res.status).toBe(401);
  });

  test('returns 400 for an invalid key format (too short)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ licenseKey: '!!' });

    expect(res.status).toBe(400);
  });

  test('returns 400 when licenseKey is missing from request body', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});

    expect(res.status).toBe(400);
  });
});

// ─── POST /api/auth/check-admin ───────────────────────────────────────────────

describe('POST /api/auth/check-admin', () => {
  test('returns { isAdmin: true } for the correct admin key', async () => {
    const res = await request(app)
      .post('/api/auth/check-admin')
      .send({ adminKey: process.env.ADMIN_KEY });

    expect(res.status).toBe(200);
    expect(res.body.isAdmin).toBe(true);
  });

  test('returns { isAdmin: false } for a wrong admin key', async () => {
    const res = await request(app)
      .post('/api/auth/check-admin')
      .send({ adminKey: 'wrong-key' });

    expect(res.status).toBe(200);
    expect(res.body.isAdmin).toBe(false);
  });

  test('returns 400 when adminKey is missing', async () => {
    const res = await request(app)
      .post('/api/auth/check-admin')
      .send({});

    expect(res.status).toBe(400);
  });
});
