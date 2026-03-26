'use strict';

jest.mock('../../src/services/kvService');
jest.mock('../../src/services/storeService');
jest.mock('../../src/middleware/rateLimit');

const request = require('supertest');
const { kvGetLicenses } = require('../../src/services/kvService');
const { getStore } = require('../../src/services/storeService');
const app = require('../../index');

const mockLicenses = [
  {
    id: 1,
    license_key: 'LKUP-LKUP-LKUP-LKUP',
    stripe_payment_intent_id: 'pi_test_lookup_12345678',
    stripe_session_id: 'cs_test_lookup_abcdefghij',
    plan: 'LITE',
    email: 'lookup@example.com',
    created_at: '2024-06-01T00:00:00.000Z',
    active: 1,
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  kvGetLicenses.mockResolvedValue(mockLicenses);
  getStore.mockReturnValue({ licenses: mockLicenses, request_log: [], remote_content: [], tickets: [] });
});

// ─── GET /api/licenses/by-payment-intent/:pi_id ───────────────────────────────

describe('GET /api/licenses/by-payment-intent/:pi_id', () => {
  test('returns 200 with license details for a valid payment_intent id', async () => {
    const res = await request(app)
      .get('/api/licenses/by-payment-intent/pi_test_lookup_12345678');

    expect(res.status).toBe(200);
    expect(res.body.license_key).toBe('LKUP-LKUP-LKUP-LKUP');
    expect(res.body.plan).toBe('LITE');
    expect(res.body.email).toBe('lookup@example.com');
  });

  test('returns 404 when no license matches the payment_intent id', async () => {
    const res = await request(app)
      .get('/api/licenses/by-payment-intent/pi_test_notfound_12345');

    expect(res.status).toBe(404);
  });

  test('returns 400 for an invalid payment_intent id format', async () => {
    const res = await request(app)
      .get('/api/licenses/by-payment-intent/not-a-pi-id');

    expect(res.status).toBe(400);
  });
});

// ─── GET /api/licenses/by-session/:session_id ────────────────────────────────

describe('GET /api/licenses/by-session/:session_id', () => {
  test('returns 200 with license details for a valid session_id', async () => {
    const res = await request(app)
      .get('/api/licenses/by-session/cs_test_lookup_abcdefghij');

    expect(res.status).toBe(200);
    expect(res.body.license_key).toBe('LKUP-LKUP-LKUP-LKUP');
    expect(res.body.plan).toBe('LITE');
  });

  test('returns 404 when no license matches the session_id', async () => {
    const res = await request(app)
      .get('/api/licenses/by-session/cs_test_notfound_1234567890');

    expect(res.status).toBe(404);
  });

  test('returns 400 for an invalid session_id format', async () => {
    const res = await request(app)
      .get('/api/licenses/by-session/bad-session-id');

    expect(res.status).toBe(400);
  });
});
