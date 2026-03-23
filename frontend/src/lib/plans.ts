import type { PricingPlan } from '@/components/ui/pricing';

/** Shared plan definitions used in the landing page and /theme/pricing. */
export const VEXEL_PLANS: PricingPlan[] = [
  {
    name: 'LITE',
    price: '179',
    yearlyPrice: '179',
    period: 'one time',
    features: [
      'Full theme with 140+ features',
      '1 store license',
      'Product image generator',
      'Product list generator',
      'Built-in setup support',
      'Complete documentation',
      'Lifetime updates',
    ],
    description: 'Everything you need to launch your first store.',
    displayName: 'Vexel Lite',
    buttonText: 'Purchase Now',
    href: '#purchase',
    isPopular: false,
  },
  {
    name: 'PRO',
    price: '379',
    yearlyPrice: '379',
    period: 'one time',
    features: [
      'Everything in Lite, plus:',
      '1-on-1 full store setup call',
      'Unlimited store remakes if banned',
      'Private Vexel community access',
      'Priority support',
      'Done-for-you product listings',
    ],
    description: 'Best value — includes hands-on setup & protection.',
    displayName: 'Vexel Pro',
    buttonText: 'Purchase Now',
    href: '#purchase',
    isPopular: true,
  },
];

/** Slightly different copy used on the standalone /theme/pricing page. */
export const VEXEL_PLANS_PRICING_PAGE: PricingPlan[] = [
  {
    ...VEXEL_PLANS[0],
    buttonText: 'Get Vexel Lite',
    href: '/#purchase',
  },
  {
    ...VEXEL_PLANS[1],
    buttonText: 'Get Vexel Pro',
    href: '/#purchase',
  },
];
