import React from 'react';
import Link from 'next/link';
import { CreatorsMarquee } from '@/components/ui/creators-marquee';
import { Pricing } from '@/components/ui/pricing';
import type { PricingPlan } from '@/components/ui/pricing';
import { Footer } from '@/components/ui/footer-section';
import { HeroSection } from '@/components/ui/hero-section';
import { ImageGenDemo } from '@/components/ui/image-gen-demo';
import { AiCustomizerDemo } from '@/components/ui/ai-customizer-demo';
import { FaqAccordion } from '@/components/ui/faq-accordion';
import { FeaturesSection } from '@/components/ui/features-section';

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

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-[#3a0ca3]/20 selection:text-[#1e0657] overflow-x-hidden">

      <HeroSection />

      <FeaturesSection />

      {/* Creators */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 tracking-tight">
              Used by the Biggest Names in Reselling
            </h2>
            <p className="text-slate-500 text-base max-w-xl mx-auto">
              Top resellers on TikTok, Instagram, and Shopify trust Vexel to power their stores.
            </p>
          </div>
          <CreatorsMarquee />
          <p className="text-center text-slate-500 text-sm mt-6 mb-8">
            and 400+ other resellers...
          </p>
          <div className="flex justify-center">
            <a
              href="#purchase"
              className="group inline-flex items-center justify-center gap-3 shadow-xl shadow-[#3a0ca3]/20 transition duration-200 ease-out text-base font-semibold text-white bg-[#3a0ca3] rounded-2xl px-8 py-4 hover:bg-[#2d0980]"
            >
              Get Started
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/30 group-hover:bg-white/30 transition-colors">
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
                  className="h-4 w-4"
                >
                  <path d="M7 7h10v10" />
                  <path d="M7 17 17 7" />
                </svg>
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* Image Generator — single column: text above, full-width image below */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
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
                className="w-3.5 h-3.5 text-[#3a0ca3]"
                aria-hidden="true"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
              <span className="text-sm font-semibold text-[#1e0657]">Image Generator</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight mb-4 leading-[1.1]">
              Create Product
              <br className="hidden sm:block" />
              Images Instantly
            </h2>
            <p className="text-slate-600 text-lg sm:text-xl leading-relaxed max-w-lg">
              Pick a background, drop in your product, and style your text.
              Professional product images in three clicks — no Photoshop needed.
            </p>
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#3a0ca3] flex items-center justify-center flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-3 h-3"
                    aria-hidden="true"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </div>
                <span className="text-slate-600 font-medium text-sm sm:text-base">
                  Curated backgrounds for every niche
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#3a0ca3] flex items-center justify-center flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-3 h-3"
                    aria-hidden="true"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </div>
                <span className="text-slate-600 font-medium text-sm sm:text-base">
                  Drop in product icons with one click
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#3a0ca3] flex items-center justify-center flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-3 h-3"
                    aria-hidden="true"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </div>
                <span className="text-slate-600 font-medium text-sm sm:text-base">
                  Bold fonts that match your brand
                </span>
              </div>
            </div>
          </div>
          <div className="w-full">
            <ImageGenDemo />
          </div>
        </div>
      </section>

      {/* AI Customizer */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight mb-4 leading-[1.1]">
                Customize Your
                <br className="hidden sm:block" />
                Store in Seconds
              </h2>
              <p className="text-slate-600 text-lg sm:text-xl leading-relaxed max-w-lg">
                Describe any change you want and our AI applies it to your live
                store. No code, no developer, no waiting.
              </p>
            </div>
            <div>
              <AiCustomizerDemo />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="purchase" className="bg-slate-50 relative overflow-hidden">
        <Pricing
          plans={VEXEL_PLANS}
          title="Choose Your Plan"
          description="One time price. Yours for life."
        />
      </section>

      {/* FAQ */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
              Everything you need to know about our Shopify theme
            </p>
          </div>
          <FaqAccordion />
          <div className="mt-12 text-center p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Still have questions?
            </h3>
            <p className="text-slate-600 mb-6 text-base sm:text-[17px]">
              Can&apos;t find the answer you&apos;re looking for? Please reach out to our team.
            </p>
            <Link
              href="/theme/support"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#3a0ca3] text-white font-semibold hover:bg-[#2d0980] transition-colors shadow-lg shadow-[#3a0ca3]/20"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
