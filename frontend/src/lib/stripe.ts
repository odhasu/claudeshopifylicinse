import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
  typescript: true,
});

/** Price in USD cents for each plan */
export const PLAN_PRICES: Record<string, { amount: number; name: string }> = {
  LITE: { amount: 17900, name: 'Vexel Lite' },
  PRO: { amount: 37900, name: 'Vexel Pro' },
};
