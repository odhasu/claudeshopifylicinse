"use client";

import { FaqAccordion } from '@/components/ui/faq-accordion';

export function FaqSection() {
  return (
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
          <a
            href="/theme/support"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#3a0ca3] text-white font-semibold hover:bg-[#2d0980] transition-colors shadow-lg shadow-[#3a0ca3]/20"
          >
            Contact Support
          </a>
        </div>
      </div>
    </section>
  );
}
