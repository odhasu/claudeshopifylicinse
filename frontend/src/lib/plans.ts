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
      '1 store license — transfer to a new store if banned',
      'Product image generator',
      'Product list generator',
      'Built-in setup support',
      'Complete documentation',
      'Lifetime updates',
    ],
    description: 'Everything you need to launch',
    displayName: 'Vexel Lite',
    buttonText: 'Get Started →',
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
      '1-on-1 full store setup',
      '5 store licenses — use on 5 stores at the same time',
      'Private Vexel community',
    ],
    description: 'Scale without limits',
    displayName: 'Vexel Pro',
    buttonText: 'Get Started →',
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
