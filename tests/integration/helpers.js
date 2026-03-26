'use strict';

// ─── Shared mock factories ────────────────────────────────────────────────────
//
// These factories are imported by integration test files to set up consistent
// mocks for all external services (KV, store, rate limiter, email, Stripe).
// Separating them here keeps individual test files focused on behaviour.

function makeKvServiceMock(overrides = {}) {
  return {
    kvGetLicenses: jest.fn().mockResolvedValue([]),
    kvSaveLicenses: jest.fn().mockResolvedValue(undefined),
    kvGetTickets: jest.fn().mockResolvedValue([]),
    kvSaveTickets: jest.fn().mockResolvedValue(undefined),
    kvRateLimitIncrement: jest.fn().mockResolvedValue(null),
    kvAcquireIdempotencyLock: jest.fn().mockResolvedValue(true),
    kvGetRuntimeStatus: jest.fn().mockReturnValue({ enabled: false }),
    KV_ENABLED: false,
    ...overrides,
  };
}

function makeStoreServiceMock(licenses = [], overrides = {}) {
  return {
    getStore: jest.fn(() => ({
      licenses,
      request_log: [],
      remote_content: [],
      tickets: [],
      _nextId: 1,
    })),
    saveStore: jest.fn(),
    nextId: jest.fn(() => 1),
    ensureRedisInitialized: jest.fn().mockResolvedValue(undefined),
    loadStore: jest.fn(),
    ...overrides,
  };
}

function makeEmailServiceMock() {
  return {
    sendWelcomeEmail: jest.fn().mockResolvedValue({ id: 'mock-email-id' }),
    sendTicketReply: jest.fn().mockResolvedValue(undefined),
  };
}

function makeStripeMock(overrides = {}) {
  return {
    paymentIntents: {
      create: jest.fn().mockResolvedValue({
        id: 'pi_test_mock',
        client_secret: 'pi_test_mock_secret',
        status: 'requires_payment_method',
        metadata: { plan: 'LITE', planName: 'Vexel Lite' },
        receipt_email: null,
      }),
      retrieve: jest.fn().mockResolvedValue({
        id: 'pi_test_retrieve',
        status: 'succeeded',
        metadata: { plan: 'LITE', planName: 'Vexel Lite' },
        receipt_email: 'test@example.com',
      }),
    },
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({
          id: 'cs_test_mock',
          url: 'https://checkout.stripe.com/pay/cs_test_mock',
        }),
        retrieve: jest.fn().mockResolvedValue({
          id: 'cs_test_retrieve',
          metadata: { plan: 'PRO' },
          customer_email: 'buyer@example.com',
        }),
      },
    },
    webhooks: {
      constructEvent: jest.fn(),
    },
    ...overrides,
  };
}

module.exports = { makeKvServiceMock, makeStoreServiceMock, makeEmailServiceMock, makeStripeMock };
