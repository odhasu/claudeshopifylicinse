'use client';

import { useState, useEffect } from 'react';

const STEPS = [
  { label: 'Pick Background', sub: 'Choose from curated backgrounds' },
  { label: 'Drop Product',    sub: 'Add your product in one click' },
  { label: 'Style Text',      sub: 'Bold fonts that match your brand' },
];

const BG_IMAGES = [
  { src: 'https://assets.scaled.info/api/img/img_01kggq8ce85s92z7xvf6b22by2?w=960', alt: 'Dark Waves' },
  { src: 'https://assets.scaled.info/api/img/img_01kggqcjjyw4ag9ntcmw7rxk1k?w=960', alt: 'Royal Symmetry' },
  { src: 'https://assets.scaled.info/api/img/img_01kggwg190mdbsm6v3nkfez2a3?w=960', alt: 'Midnight Crest' },
  { src: 'https://assets.scaled.info/api/img/img_01kgjphypq3xxjkarw065hjhyh?w=960', alt: 'Futuristic' },
  { src: 'https://assets.scaled.info/api/img/img_01kggq96vt9zgeez3tqh3gqsrq?w=960', alt: 'Grainy Clouds' },
];

const FONT_STYLES = ['Bebas Neue', 'Montserrat', 'Playfair'];

export function ImageGenDemo() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 2200);
    return () => clearInterval(id);
  }, []);

  const stepIndex = tick % STEPS.length;          // 0 → 1 → 2 → 0 …
  const bgIndex   = Math.floor(tick / STEPS.length) % BG_IMAGES.length;
  const bg = BG_IMAGES[bgIndex];

  return (
    <div className="rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden bg-white">
      {/* Image canvas */}
      <div className="relative aspect-square bg-black overflow-hidden">
        {/* background layer */}
        <img
          key={bg.src}
          src={bg.src}
          alt={bg.alt}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
        />

        {/* Step 1 overlay: pick-background indicator */}
        {stepIndex === 0 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
            <div className="flex gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm">
              {BG_IMAGES.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === bgIndex ? 'bg-white scale-125' : 'bg-white/40'}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Step 2 overlay: product icon */}
        {stepIndex === 1 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-28 h-28 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-2xl animate-in fade-in zoom-in duration-500">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-14 h-14 drop-shadow-lg" aria-hidden="true">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>
          </div>
        )}

        {/* Step 3 overlay: text style picker */}
        {stepIndex === 2 && (
          <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
            <div className="m-3 p-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <p className="text-white/60 text-[10px] font-medium mb-2 uppercase tracking-widest">Font Style</p>
              <div className="flex gap-2">
                {FONT_STYLES.map((f, i) => (
                  <div
                    key={f}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${i === 0 ? 'bg-[#3a0ca3] text-white ring-2 ring-white/40' : 'bg-white/10 text-white/70'}`}
                  >
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Step indicator bar */}
      <div className="p-3 sm:p-4 space-y-3 border-t border-slate-100">
        <div className="flex items-center justify-center gap-2">
          {STEPS.map((s, i) => {
            const isActive  = i === stepIndex;
            const isDone    = i < stepIndex;
            return (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold transition-all duration-300 ${
                    isActive
                      ? 'bg-[#3a0ca3] text-white ring-2 ring-[#3a0ca3]/30 scale-110'
                      : isDone
                      ? 'bg-[#3a0ca3]/20 text-[#3a0ca3]'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isDone ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3" aria-hidden="true">
                      <path d="M20 6 9 17l-5-5"/>
                    </svg>
                  ) : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-6 sm:w-8 h-0.5 rounded-full transition-colors duration-500 ${isDone ? 'bg-[#3a0ca3]/40' : 'bg-slate-200'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Active step label */}
        <div className="h-12 sm:h-14 relative overflow-hidden rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col items-center justify-center gap-0.5">
          <p className="text-sm font-semibold text-slate-800 transition-all duration-300">
            {STEPS[stepIndex].label}
          </p>
          <p className="text-xs text-slate-400">{STEPS[stepIndex].sub}</p>
        </div>
      </div>
    </div>
  );
}
