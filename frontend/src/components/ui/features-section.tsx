'use client';

import React, { useRef } from 'react';
import type { ReactNode } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';
import { Bot, TrendingUp, ShoppingCart, ShieldCheck, Wand2, BadgeCheck } from 'lucide-react';
import CardFlip from '@/components/ui/flip-card';

const FEATURES = [
  {
    title: 'Sell While You Sleep',
    subtitle: 'Automated selling around the clock',
    description: 'AI chatbot answers customer questions 24/7. Handles objections and closes deals automatically while you focus on what matters.',
    features: ['AI Chatbot Included', '24/7 Automation', 'Handles Objections', 'Closes Deals for You'],
    color: '#3a0ca3',
    icon: Bot,
    href: '/theme/docs',
  },
  {
    title: 'Convert More Visitors',
    subtitle: 'Turn browsers into buyers',
    description: 'Built-in urgency tools, social proof, and checkout optimization designed to maximize your conversion rate from day one.',
    features: ['Urgency Timers', 'Social Proof Widgets', 'Checkout Optimizer', 'Scarcity Alerts'],
    color: '#3a0ca3',
    icon: TrendingUp,
    href: '/theme/docs',
  },
  {
    title: 'Boost Your AOV',
    subtitle: 'Make every order count more',
    description: 'Bundle builder with automatic discounts. Customers spend more when they can build deals and see real value stacked up.',
    features: ['Bundle Builder', 'Auto Discounts', 'Upsell Widgets', 'Cross-Sell Tools'],
    color: '#3a0ca3',
    icon: ShoppingCart,
    href: '/theme/docs',
  },
  {
    title: 'Build Trust Fast',
    subtitle: 'Look like a premium brand',
    description: 'Photo reviews, live viewer counts, recent purchase notifications, and trust badges that make first-time buyers feel safe.',
    features: ['Photo Reviews', 'Live Viewer Count', 'Purchase Popups', 'Trust Badges'],
    color: '#3a0ca3',
    icon: ShieldCheck,
    href: '/theme/docs',
  },
  {
    title: 'No Coding Required',
    subtitle: 'Set up in under 15 minutes',
    description: 'Drag-and-drop customization. Change colors, fonts, and layouts without touching a single line of code. Ever.',
    features: ['Drag & Drop Editor', 'One-Click Themes', 'Live Preview', 'Mobile Ready'],
    color: '#3a0ca3',
    icon: Wand2,
    href: '/theme/docs',
  },
  {
    title: 'Stay Compliant',
    subtitle: 'Built to keep your store safe',
    description: "Officially licensed for digital products. Built specifically so you don't get banned — even when competitors do.",
    features: ['TOS Compliant', 'Ban-Proof Design', 'Licensed Assets', 'Regular Audits'],
    color: '#3a0ca3',
    icon: BadgeCheck,
    href: '/theme/support',
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.4] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        {/* Section header */}
        <AnimatedContainer delay={0} className="text-center mb-16 sm:mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-200 shadow-sm mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 text-[#3a0ca3]"
              aria-hidden="true"
            >
              <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" />
              <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" />
              <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" />
            </svg>
            <span className="text-sm font-semibold text-[#1e0657]">
              Built for Your Success
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
            Everything A Reseller
            <br />
            Needs to Win
          </h2>
          <p className="text-slate-600 text-lg sm:text-xl lg:text-2xl max-w-3xl mx-auto font-medium leading-relaxed">
            Professional features that make you look like a million-dollar brand
          </p>
        </AnimatedContainer>

        {/* Flip card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 justify-items-center">
          {FEATURES.map((feature, i) => (
            <AnimatedContainer key={feature.title} delay={0.08 + i * 0.06} className="w-full flex justify-center">
              <CardFlip
                title={feature.title}
                subtitle={feature.subtitle}
                description={feature.description}
                features={feature.features}
                color={feature.color}
                icon={feature.icon}
                href={feature.href}
                cardIndex={i}
              />
            </AnimatedContainer>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── AnimatedContainer ────────────────────────────────────────────────────────
type ViewAnimationProps = {
  delay?: number;
  className?: string;
  children: ReactNode;
};

function AnimatedContainer({
  className,
  delay = 0.1,
  children,
}: ViewAnimationProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shouldReduceMotion || isInView ? 1 : 0,
        transform: shouldReduceMotion || isInView ? 'none' : 'translateY(20px)',
        transition: shouldReduceMotion ? undefined : `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}
