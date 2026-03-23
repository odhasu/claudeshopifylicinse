'use client';

import { useState, useEffect, useRef } from 'react';

const MESSAGES = [
  { role: 'user', text: 'Make my header a dark purple gradient' },
  { role: 'ai',   text: 'Done — your header now has a purple-to-indigo gradient.', badge: 'Patch applied' },
  { role: 'user', text: 'Add a glow effect on the buy button' },
  { role: 'ai',   text: 'Added a subtle pulsing glow around your buy button.', badge: 'Patch applied' },
] as const;

const TYPEWRITER_SPEED = 28; // ms per character

function useTypewriter(text: string, active: boolean) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    if (!active) { setDisplayed(''); return; }
    setDisplayed('');
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, TYPEWRITER_SPEED);
    return () => clearInterval(id);
  }, [text, active]);
  return displayed;
}

function AiMessage({ text, badge, visible }: { text: string; badge: string; visible: boolean }) {
  const typed = useTypewriter(text, visible);
  return (
    <div className={`flex items-start gap-2.5 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="w-6 h-6 rounded-full bg-[#3a0ca3] flex items-center justify-center shrink-0 mt-0.5 shadow-sm shadow-[#3a0ca3]/30">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3" aria-hidden="true">
          <path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>
        </svg>
      </div>
      <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-3.5 py-2.5 max-w-[80%]">
        <p className="text-sm text-slate-700 leading-relaxed">
          {typed}
          {typed.length < text.length && visible && (
            <span className="inline-block w-0.5 h-3.5 bg-[#3a0ca3] ml-0.5 animate-pulse align-middle" />
          )}
        </p>
        {typed === text && (
          <div className="flex items-center gap-1 mt-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[11px] text-emerald-600 font-medium">{badge}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function UserMessage({ text, visible }: { text: string; visible: boolean }) {
  return (
    <div className={`flex justify-end transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="bg-[#3a0ca3] rounded-2xl rounded-tr-sm px-3.5 py-2.5 max-w-[80%]">
        <p className="text-sm text-white leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

const REVEAL_DELAYS = [300, 1200, 3000, 3900]; // ms offset for each message to appear

export function AiCustomizerDemo() {
  const [visibleCount, setVisibleCount] = useState(0);
  const hasStarted = useRef(false);

  // Restart the animation every 8 s
  useEffect(() => {
    function runSequence() {
      hasStarted.current = true;
      setVisibleCount(0);
      REVEAL_DELAYS.forEach((delay, i) => {
        setTimeout(() => setVisibleCount(i + 1), delay);
      });
    }
    runSequence();
    const id = setInterval(runSequence, 9000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden bg-white flex flex-col h-[360px] sm:h-[380px]">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-50/80 border-b border-slate-200 shrink-0">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-300"/>
          <div className="w-2.5 h-2.5 rounded-full bg-slate-300"/>
          <div className="w-2.5 h-2.5 rounded-full bg-slate-300"/>
        </div>
        <span className="text-xs font-medium text-slate-400 ml-2">AI Customizer</span>
      </div>

      {/* Message area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
        {MESSAGES.map((msg, i) => {
          const visible = i < visibleCount;
          if (msg.role === 'user') {
            return <UserMessage key={i} text={msg.text} visible={visible} />;
          }
          return (
            <AiMessage
              key={i}
              text={msg.text}
              badge={msg.badge}
              visible={visible}
            />
          );
        })}
      </div>

      {/* Input bar */}
      <div className="px-4 sm:px-5 pb-3 sm:pb-4 pt-2 border-t border-slate-100 shrink-0">
        <div className="flex items-center gap-3 px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50/50">
          <span className="text-sm text-slate-400 flex-1 select-none">Try it — describe a change...</span>
          <div className="w-8 h-8 rounded-lg bg-[#3a0ca3] flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
              <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/>
              <path d="m21.854 2.147-10.94 10.939"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
