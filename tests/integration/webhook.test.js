'use strict';

jest.mock('../../src/services/kvService');
jest.mock('../../src/services/storeService');
jest.mock('../../src/middleware/rateLimit');
jest.mock('../../src/services/emailService');
jest.mock('../../src/services/stripeService');

const request = require('supertest');
const { kvGetLicenses, kvSaveLicenses, kvAcquireIdempotencyLock } = require('../../src/services/kvService');
const { getStore } = require('../../src/services/storeService');
const { sendWelcomeEmail } = require('../../src/services/emailService');
const { __stripeMock } = require('../../src/services/stripeService');
const app = require('../../index');

// Shared in-memory license list, mutated per test to simulate DB state
const sharedLicenses = [];

function buildWebhookPayload(event) {
  return Buffer.from(JSON.stringify(event), 'utf8');
}

beforeEach(() => {
  jest.clearAllMocks();
  sharedLicenses.length = 0;

  kvGetLicenses.mockImplementation(() => Promise.resolve([...sharedLicenses]));
  kvSaveLicenses.mockImplementation((list) => {
    sharedLicenses.length = 0;
    list.forEach(l => sharedLicenses.push(l));
    return Promise.resolve();
  });
  kvAcquireIdempotencyLock.mockResolvedValue(true);
  getStore.mockReturnValue({ licenses: sharedLicenses, request_log: [], remote_content: [], tickets: [] });
  sendWelcomeEmail.mockResolvedValue({ id: 'mock-email-id' });
  __stripeMock.webhooks.constructEvent.mockReset();
});

// ─── Signature guard ──────────────────────────────────────────────────────────

describe('POST /api/webhooks/stripe — signature guard', () => {
  test('returns 400 when the stripe-signature header is missing', async () => {
    const res = await request(app)
      .post('/api/webhooks/stripe')
      .set('Content-Type', 'application/json')
      .send(buildWebhookPayload({ type: 'checkout.session.completed' }));

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/signature/i);
  });

  test('returns 400 when stripe signature verification fails', async () => {
    __stripeMock.webhooks.constructEvent.mockImplementationOnce(() => {
      throw new Error('No signatures found matching the expected signature.');
    });

    const res = await request(app)
      .post('/api/webhooks/stripe')
      .set('Content-Type', 'application/json')
      .set('stripe-signature', 't=1,v1=badsig')
      .send(buildWebhookPayload({ id: 'evt_bad', type: 'checkout.session.completed' }));

    expect(res.status).toBe(400);
  });
});

// ─── checkout.session.completed ──────────────────────────────────────────────

describe('POST /api/webhooks/stripe — checkout.session.completed', () => {
  const sessionEvent = {
    id: 'evt_checkout_001',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_new_session_001',
        customer_details: { email: 'customer@example.com', name: 'Alice Smith' },
        metadata: { plan: 'LITE' },
      },
    },
  };

  test('creates a license and returns received:true', async () => {
    __stripeMock.webhooks.constructEvent.mockReturnValueOnce(sessionEvent);

    const res = await request(app)
      .post('/api/webhooks/stripe')
      .set('Content-Type', 'application/json')
      .set('stripe-signature', 't=123,v1=validsig')
      .send(buildWebhookPayload(sessionEvent));

    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);
    expect(kvSaveLicenses).toHaveBeenCalled();
    const saved = kvSaveLicenses.mock.calls[0][0];
    expect(saved[0].email).toBe('customer@example.com');
    expect(saved[0].plan).toBe('LITE');
  });

  test('sends a welcome email after creating the license', async () => {
    __stripeMock.webhooks.constructEvent.mockReturnValueOnce(sessionEvent);

    await request(app)
      .post('/api/webhooks/stripe')
      .set('Content-Type', 'application/json')
      .set('stripe-signature', 't=123,v1=validsig')
      .send(buildWebhookPayload(sessionEvent));

    expect(sendWelcomeEmail).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'customer@example.com', plan: 'LITE' })
    );
  });

  test('skips creation for a duplicate session (idempotency)', async () => {
    // Pre-populate the licenses list to simulate duplicate detection
    sharedLicenses.push({
      id: 99,
      license_key: 'DUPL-DUPL-DUPL-DUPL',
      stripe_session_id: 'cs_test_new_session_001',
      plan: 'LITE',
      active: 1,
    });

    __stripeMock.webhooks.constructEvent.mockReturnValueOnce(sessionEvent);

    const res = await request(app)
      .post('/api/webhooks/stripe')
      .set('Content-Type', 'application/json')
      .set('stripe-signature', 't=123,v1=validsig')
      .send(buildWebhookPayload(sessionEvent));

    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);
    expect(kvSaveLicenses).not.toHaveBeenCalled();
  });
});

// ─── payment_intent.succeeded ─────────────────────────────────────────────────

describe('POST /api/webhooks/stripe — payment_intent.succeeded', () => {
  const piEvent = {
    id: 'evt_pi_001',
    type: 'payment_intent.succeeded',
    data: {
      object: {
        id: 'pi_test_new_pi_001234',
        receipt_email: 'pibuyer@example.com',
        metadata: { plan: 'PRO', customer_name: 'Bob Jones' },
      },
    },
  };

  test('creates a license for a valid PaymentIntent event', async () => {
    __stripeMock.webhooks.constructEvent.mockReturnValueOnce(piEvent);

    const res = await request(app)
      .post('/api/webhooks/stripe')
      .set('Content-Type', 'application/json')
      .set('stripe-signature', 't=456,v1=validsig2')
      .send(buildWebhookPayload(piEvent));

    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);
    expect(kvSaveLicenses).toHaveBeenCalled();
    const saved = kvSaveLicenses.mock.calls[0][0];
    expect(saved[0].plan).toBe('PRO');
    expect(saved[0].email).toBe('pibuyer@example.com');
  });

  test('skips creation for a duplicate PaymentIntent (idempotency)', async () => {
    sharedLicenses.push({
      id: 100,
      license_key: 'PIID-PIID-PIID-PIID',
      stripe_payment_intent_id: 'pi_test_new_pi_001234',
      plan: 'PRO',
      active: 1,
    });

    __stripeMock.webhooks.constructEvent.mockReturnValueOnce(piEvent);

    const res = await request(app)
      .post('/api/webhooks/stripe')
      .set('Content-Type', 'application/json')
      .set('stripe-signature', 't=456,v1=validsig2')
      .send(buildWebhookPayload(piEvent));

    expect(res.status).toBe(200);
    expect(kvSaveLicenses).not.toHaveBeenCalled();
  });
});

// ─── Unhandled event types ────────────────────────────────────────────────────

describe('POST /api/webhooks/stripe — unhandled event types', () => {
  test('returns received:true without creating a license', async () => {
    const unknownEvent = {
      id: 'evt_unknown_001',
      type: 'customer.subscription.created',
      data: { object: {} },
    };
    __stripeMock.webhooks.constructEvent.mockReturnValueOnce(unknownEvent);

    const res = await request(app)
      .post('/api/webhooks/stripe')
      .set('Content-Type', 'application/json')
      .set('stripe-signature', 't=789,v1=validsig3')
      .send(buildWebhookPayload(unknownEvent));

    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);
    expect(kvSaveLicenses).not.toHaveBeenCalled();
  });
});
