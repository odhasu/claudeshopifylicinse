"use client";

import { CreatorsMarquee } from '@/components/ui/creators-marquee';

export function CreatorsSection() {
  return (
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
  );
}
