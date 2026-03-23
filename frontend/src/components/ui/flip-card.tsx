'use client';

import { cn } from '@/lib/utils';
import { ArrowRight, Code2, Copy, Rocket, Zap } from 'lucide-react';
import Link from 'next/link';
import React, { useState, useRef } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';

export interface CardFlipProps {
  title?: string;
  subtitle?: string;
  description?: string;
  features?: string[];
  color?: string;
  icon?: React.ElementType;
  href?: string;
  cardIndex?: number;
}

export default function CardFlip({
  title = 'Build MVPs Fast',
  subtitle = 'Launch your idea in record time',
  description = 'Copy, paste, customize—and launch your MVP faster than ever.',
  features = ['Copy & Paste Ready', 'Developer-First', 'MVP Optimized', 'Zero Setup Required'],
  color = '#3a0ca3',
  icon: Icon = Rocket,
  href = '/theme/docs',
  cardIndex = 0,
}: CardFlipProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const touchStartRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartRef.current === null) return;
    const touchEnd = e.changedTouches[0].clientY;
    const diff = touchStartRef.current - touchEnd;
    
    // Detect swipe up or down to toggle flip
    if (Math.abs(diff) > 30) {
      setIsFlipped(!isFlipped);
    }
    touchStartRef.current = null;
  };

  return (
    <div
      style={{ ['--primary' as string]: color } as React.CSSProperties}
      className="group h-[360px] w-full max-w-[320px] [perspective:2000px] cursor-pointer"
      onMouseEnter={() => !isMobile && setIsFlipped(true)}
      onMouseLeave={() => !isMobile && setIsFlipped(false)}
      onClick={() => isMobile && setIsFlipped(!isFlipped)}
      onTouchStart={isMobile ? handleTouchStart : undefined}
      onTouchEnd={isMobile ? handleTouchEnd : undefined}
    >
      <div
        style={{ transform: isFlipped ? 'rotateY(180deg)' : 'none' }}
        className="relative h-full w-full [transform-style:preserve-3d] transition-[transform] duration-700"
      >
        {/* ── Front ── */}
        <div
          className={cn(
            'absolute inset-0 h-full w-full [backface-visibility:hidden]',
            'overflow-hidden rounded-2xl',
            'bg-gradient-to-br from-white via-slate-50 to-slate-100',
            'border border-slate-200 shadow-lg transition-all duration-700',
            'group-hover:shadow-xl',
            isFlipped ? 'opacity-0' : 'opacity-100',
          )}
        >
          {/* Tinted gradient overlay */}
          <div
            className="absolute inset-0 bg-gradient-to-br via-transparent to-blue-500/5 opacity-60"
            style={{ backgroundImage: `radial-gradient(circle at 30% 20%, ${color}18, transparent 60%)` }}
          />

          {/* Animated sliding code lines */}
          <div className="absolute inset-0 flex items-center justify-center pt-20">
            <div className="relative flex h-[100px] w-[200px] flex-col items-center justify-center gap-2">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-2 w-full rounded-sm opacity-0"
                  style={{
                    width: `${62 + (i * 13) % 38}%`,
                    marginLeft: `${(i * 7) % 20}%`,
                    background: `linear-gradient(to right, ${color}22, ${color}40, ${color}22)`,
                    animation: 'vexel-slideIn 3.5s ease-in-out infinite',
                    animationDelay: `${i * 0.35 + cardIndex * 0.65}s`,
                  }}
                />
              ))}

              {/* Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center shadow-md transition-all duration-500 group-hover:scale-105"
                  style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)`, boxShadow: `0 4px 16px ${color}33` }}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom text */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1.5">
                <h3 className="text-lg font-semibold leading-snug tracking-tight text-zinc-900 transition-all duration-500 ease-out group-hover:-translate-y-1">
                  {title}
                </h3>
                <p className="line-clamp-2 text-sm tracking-tight text-zinc-500 transition-all delay-[50ms] duration-500 ease-out group-hover:-translate-y-1">
                  {subtitle}
                </p>
              </div>
              <Zap className="h-5 w-5 shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" style={{ color }} />
            </div>
          </div>
        </div>

        {/* ── Back ── */}
        <div
          className={cn(
            'absolute inset-0 h-full w-full [transform:rotateY(180deg)] [backface-visibility:hidden]',
            'rounded-2xl p-5 flex flex-col',
            'bg-gradient-to-br from-white via-slate-50 to-slate-100',
            'border border-slate-200 shadow-lg transition-all duration-700',
            'group-hover:shadow-xl',
            !isFlipped ? 'opacity-0' : 'opacity-100',
          )}
        >
          <div
            className="absolute inset-0 rounded-2xl opacity-40"
            style={{ backgroundImage: `radial-gradient(circle at 70% 80%, ${color}18, transparent 60%)` }}
          />

          <div className="relative z-10 flex-1 space-y-4">
            {/* Title row */}
            <div className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
                style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
              >
                <Code2 className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold leading-snug tracking-tight text-zinc-900 group-hover:-translate-y-0.5 transition-transform duration-500">
                {title}
              </h3>
            </div>

            {/* Description */}
            <p className="text-sm tracking-tight text-zinc-500 leading-relaxed">
              {description}
            </p>

            {/* Feature list */}
            <div className="space-y-2.5">
              {features.map((feature, index) => {
                const icons = [Copy, Code2, Rocket, Zap];
                const FeatureIcon = icons[index % icons.length];
                return (
                  <div
                    key={feature}
                    className="flex items-center gap-3 text-sm text-zinc-700 transition-all duration-500"
                    style={{
                      transform: isFlipped ? 'translateX(0)' : 'translateX(-10px)',
                      opacity: isFlipped ? 1 : 0,
                      transitionDelay: `${index * 100 + 200}ms`,
                    }}
                  >
                    <div
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md"
                      style={{ background: `${color}18` }}
                    >
                      <FeatureIcon className="h-3 w-3" style={{ color }} />
                    </div>
                    <span className="font-medium">{feature}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTA row */}
          <div className="relative z-10 mt-auto border-t border-slate-200 pt-4">
            <Link
              href={href}
              className="group/start flex items-center justify-between rounded-lg p-2.5 border border-transparent transition-all duration-300 hover:scale-[1.02] cursor-pointer bg-slate-100"
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = `${color}14`; el.style.borderColor = `${color}33`; }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = ''; el.style.borderColor = ''; }}
            >
              <span className="text-sm font-semibold text-zinc-900">Explore feature</span>
              <ArrowRight className="h-4 w-4 transition-all duration-300 group-hover/start:translate-x-1" style={{ color }} />
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes vexel-slideIn {
          0%   { transform: translateX(-80px); opacity: 0; }
          40%  { transform: translateX(0);     opacity: 0.7; }
          100% { transform: translateX(80px);  opacity: 0; }
        }
      `}</style>
    </div>
  );
}
