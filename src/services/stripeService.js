const STRIPE_SECRET_KEY = process.env.STRIPE_MODE === 'live'
  ? process.env.STRIPE_SECRET_KEY
  : (process.env.TEST_STRIPE_KEY || process.env.STRIPE_SECRET_KEY);
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

const PLAN_PRICES = {
  LITE: { amount: 17900, name: 'Vexel Lite', plan: 'LITE' },
  PRO:  { amount: 37900, name: 'Vexel Pro',  plan: 'PRO'  },
};

function getStripe() {
  if (!STRIPE_SECRET_KEY) throw new Error('No Stripe key set — add TEST_STRIPE_KEY or STRIPE_SECRET_KEY to your env');
  console.log(`[Stripe] Using ${process.env.STRIPE_MODE === 'live' ? 'LIVE' : 'TEST'} key`);
  const Stripe = require('stripe');
  return new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' });
}

module.exports = { getStripe, STRIPE_WEBHOOK_SECRET, PLAN_PRICES };
