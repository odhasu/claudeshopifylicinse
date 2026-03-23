"use client";

import { AiCustomizerDemo } from '@/components/ui/ai-customizer-demo';

export function AiCustomizerSection() {
  return (
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
  );
}
