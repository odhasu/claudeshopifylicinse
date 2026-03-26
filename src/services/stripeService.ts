import type Stripe from 'stripe';
import type { PlanPrice } from '../types';

const STRIPE_SECRET_KEY = process.env.STRIPE_MODE === 'live'
  ? process.env.STRIPE_SECRET_KEY
  : (process.env.TEST_STRIPE_KEY || process.env.STRIPE_SECRET_KEY);
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export const PLAN_PRICES: Record<string, PlanPrice> = {
  LITE: { amount: 17900, name: 'Vexel Lite', plan: 'LITE' },
  PRO:  { amount: 37900, name: 'Vexel Pro',  plan: 'PRO'  },
};

export function getStripe(): Stripe {
  if (!STRIPE_SECRET_KEY) throw new Error('No Stripe key set — add TEST_STRIPE_KEY or STRIPE_SECRET_KEY to your env');
  console.log(`[Stripe] Using ${process.env.STRIPE_MODE === 'live' ? 'LIVE' : 'TEST'} key`);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const StripeLib = require('stripe') as typeof import('stripe').default;
  return new StripeLib(STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion });
}
