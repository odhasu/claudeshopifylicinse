"use client";

import { Pricing } from '@/components/ui/pricing';
import type { PricingPlan } from '@/components/ui/pricing';

const VEXEL_PLANS: PricingPlan[] = [
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
    buttonText: 'Get Vexel Lite',
    href: '/#purchase',
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
    description: 'Best value \u2014 includes hands-on setup & protection.',
    buttonText: 'Get Vexel Pro',
    href: '/#purchase',
    isPopular: true,
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-slate-50 pt-24 pb-16">
      <div className="text-center mb-4">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#3a0ca3]/10 text-[#3a0ca3] uppercase tracking-widest">
          Pricing
        </span>
      </div>
      <Pricing
        plans={VEXEL_PLANS}
        title="Plans &amp; Pricing"
        description="One-time payment. Lifetime access. No subscriptions."
      />
    </main>
  );
}

