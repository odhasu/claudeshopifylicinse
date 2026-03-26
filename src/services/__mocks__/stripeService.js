'use strict';

// Manual Jest mock for src/services/stripeService.js
// Provides a configurable Stripe SDK stand-in so no real API calls are made.

const _stripeMockInstance = {
  paymentIntents: {
    create: jest.fn().mockResolvedValue({
      id: 'pi_test_mock',
      client_secret: 'pi_test_mock_secret',
      status: 'requires_payment_method',
      metadata: { plan: 'LITE', planName: 'Vexel Lite' },
      receipt_email: null,
    }),
    retrieve: jest.fn().mockResolvedValue({
      id: 'pi_test_retrieve_123456789',
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
        id: 'cs_test_retrieve_abcdefghij',
        metadata: { plan: 'PRO' },
        customer_email: 'buyer@example.com',
        customer_details: { email: 'buyer@example.com' },
      }),
    },
  },
  webhooks: {
    constructEvent: jest.fn(),
  },
};

const getStripe = jest.fn(() => _stripeMockInstance);

const STRIPE_WEBHOOK_SECRET = 'whsec_test_placeholder';

const PLAN_PRICES = {
  LITE: { amount: 17900, name: 'Vexel Lite', plan: 'LITE' },
  PRO:  { amount: 37900, name: 'Vexel Pro',  plan: 'PRO'  },
};

// Expose the mock instance so individual tests can configure it via:
//   require('../../src/services/stripeService').__stripeMock.paymentIntents.create.mockResolvedValueOnce(...)
module.exports = { getStripe, STRIPE_WEBHOOK_SECRET, PLAN_PRICES, __stripeMock: _stripeMockInstance };
