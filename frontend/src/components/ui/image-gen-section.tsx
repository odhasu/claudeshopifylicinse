"use client";

import { ImageGenDemo } from '@/components/ui/image-gen-demo';

export function ImageGenSection() {
  return (
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
            {[
              'Curated backgrounds for every niche',
              'Drop in product icons with one click',
              'Bold fonts that match your brand',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
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
                <span className="text-slate-600 font-medium text-sm sm:text-base">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="w-full">
          <ImageGenDemo />
        </div>
      </div>
    </section>
  );
}
