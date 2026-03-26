'use strict';

jest.mock('../../src/services/kvService');
jest.mock('../../src/services/storeService');
jest.mock('../../src/middleware/rateLimit');
jest.mock('../../src/services/stripeService');

const request = require('supertest');
const { __stripeMock } = require('../../src/services/stripeService');
const app = require('../../index');

beforeEach(() => {
  jest.clearAllMocks();
  // Re-apply default resolved values after clearAllMocks resets them
  __stripeMock.paymentIntents.create.mockResolvedValue({
    id: 'pi_test_mock',
    client_secret: 'pi_test_mock_secret',
    status: 'requires_payment_method',
    metadata: { plan: 'LITE', planName: 'Vexel Lite' },
    receipt_email: null,
  });
  __stripeMock.paymentIntents.retrieve.mockResolvedValue({
    id: 'pi_test_retrieve_123456789',
    status: 'succeeded',
    metadata: { plan: 'LITE', planName: 'Vexel Lite' },
    receipt_email: 'test@example.com',
  });
  __stripeMock.checkout.sessions.create.mockResolvedValue({
    id: 'cs_test_mock',
    url: 'https://checkout.stripe.com/pay/cs_test_mock',
  });
  __stripeMock.checkout.sessions.retrieve.mockResolvedValue({
    id: 'cs_test_retrieve_abcdefghij',
    metadata: { plan: 'PRO' },
    customer_email: 'buyer@example.com',
    customer_details: { email: 'buyer@example.com' },
  });
});

// ─── POST /api/stripe/create-payment-intent ───────────────────────────────────

describe('POST /api/stripe/create-payment-intent', () => {
  test('returns 200 with clientSecret for a valid LITE plan', async () => {
    const res = await request(app)
      .post('/api/stripe/create-payment-intent')
      .send({ plan: 'LITE', email: 'buyer@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.clientSecret).toBe('pi_test_mock_secret');
    expect(res.body.plan).toBe('LITE');
    expect(res.body.amount).toBe(17900);
  });

  test('returns 200 with clientSecret for PRO plan', async () => {
    const res = await request(app)
      .post('/api/stripe/create-payment-intent')
      .send({ plan: 'PRO' });

    expect(res.status).toBe(200);
    expect(res.body.plan).toBe('PRO');
  });

  test('returns 400 for an invalid plan name', async () => {
    const res = await request(app)
      .post('/api/stripe/create-payment-intent')
      .send({ plan: 'PREMIUM' });

    expect(res.status).toBe(400);
  });

  test('returns 400 for an invalid email address', async () => {
    const res = await request(app)
      .post('/api/stripe/create-payment-intent')
      .send({ plan: 'LITE', email: 'not-an-email' });

    expect(res.status).toBe(400);
  });

  test('returns 500 when Stripe throws an error', async () => {
    __stripeMock.paymentIntents.create.mockRejectedValueOnce(new Error('Stripe API error'));

    const res = await request(app)
      .post('/api/stripe/create-payment-intent')
      .send({ plan: 'LITE' });

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});

// ─── POST /api/stripe/checkout ────────────────────────────────────────────────

describe('POST /api/stripe/checkout', () => {
  test('returns 200 with a Stripe checkout URL', async () => {
    const res = await request(app)
      .post('/api/stripe/checkout')
      .send({ plan: 'LITE' });

    expect(res.status).toBe(200);
    expect(res.body.url).toContain('checkout.stripe.com');
  });

  test('returns 400 for an invalid plan', async () => {
    const res = await request(app)
      .post('/api/stripe/checkout')
      .send({ plan: 'BASIC' });

    expect(res.status).toBe(400);
  });

  test('returns 500 when Stripe throws', async () => {
    __stripeMock.checkout.sessions.create.mockRejectedValueOnce(new Error('Stripe down'));

    const res = await request(app)
      .post('/api/stripe/checkout')
      .send({ plan: 'PRO' });

    expect(res.status).toBe(500);
  });
});

// ─── GET /api/stripe/session ──────────────────────────────────────────────────

describe('GET /api/stripe/session', () => {
  test('returns 200 with plan and email for a valid session_id', async () => {
    const res = await request(app)
      .get('/api/stripe/session?session_id=cs_test_retrieve_abcdefghij');

    expect(res.status).toBe(200);
    expect(res.body.plan).toBe('PRO');
    expect(res.body.email).toBe('buyer@example.com');
  });

  test('returns 400 for an invalid session_id format', async () => {
    const res = await request(app)
      .get('/api/stripe/session?session_id=not-a-valid-id');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid session_id');
  });

  test('returns 400 when session_id is missing', async () => {
    const res = await request(app).get('/api/stripe/session');

    expect(res.status).toBe(400);
  });
});

// ─── GET /api/stripe/payment-intent ──────────────────────────────────────────

describe('GET /api/stripe/payment-intent', () => {
  test('returns 200 with plan and status for a valid payment_intent', async () => {
    const res = await request(app)
      .get('/api/stripe/payment-intent?payment_intent=pi_test_retrieve_123456789');

    expect(res.status).toBe(200);
    expect(res.body.plan).toBe('LITE');
    expect(res.body.status).toBe('succeeded');
  });

  test('returns 400 for an invalid payment_intent format', async () => {
    const res = await request(app)
      .get('/api/stripe/payment-intent?payment_intent=invalid_id');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid payment_intent');
  });

  test('returns 400 when payment_intent query param is missing', async () => {
    const res = await request(app).get('/api/stripe/payment-intent');

    expect(res.status).toBe(400);
  });
});
