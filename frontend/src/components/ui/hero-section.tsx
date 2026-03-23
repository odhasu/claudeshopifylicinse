'use client';
import React, { useRef } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { SalesBadge } from '@/components/ui/sales-badge';

export function HeroSection() {
  return (
    <section className="relative pt-24 pb-20 sm:pt-40 sm:pb-32 lg:pt-48 lg:pb-40 overflow-hidden bg-slate-50">
      {/* Signature lavender/periwinkle radial gradient */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[700px] -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,#c7d2fe_0%,#ede9fe_40%,transparent_70%)]" />
      {/* subtle top-edge glow line */}
      <div className="absolute top-0 left-1/2 h-px w-1/3 -translate-x-1/2 rounded-full bg-[#3a0ca3]/30 blur-sm" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-8 max-w-5xl mx-auto">

          {/* Badge */}
          <AnimatedContainer delay={0} className="flex justify-center">
            <SalesBadge />
          </AnimatedContainer>

          {/* Headline */}
          <AnimatedContainer delay={0.18}>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-slate-900 leading-[1.05] tracking-tight">
              The <motion.span 
                className="text-[#3a0ca3]"
                animate={{ 
                  textShadow: [
                    '0 0 0px rgba(58, 12, 163, 0)',
                    '0 0 20px rgba(58, 12, 163, 0.8)',
                    '0 0 0px rgba(58, 12, 163, 0)'
                  ]
                }}
                transition={{ 
                  duration: 5, 
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >#1</motion.span> Shopify Theme For
              Resellers
            </h1>
          </AnimatedContainer>

          {/* Subheading */}
          <AnimatedContainer delay={0.34}>
            <p className="text-lg sm:text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto leading-snug sm:leading-normal font-medium">
              Join 1,000+ resellers building profitable businesses selling
              vendor links.
            </p>
          </AnimatedContainer>

          {/* CTA buttons */}
          <AnimatedContainer delay={0.5} className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <a
              className="group inline-flex items-center justify-center gap-3 shadow-xl shadow-[#3a0ca3]/20 transition duration-200 ease-out text-base font-semibold text-white bg-[#3a0ca3] rounded-2xl px-8 py-4 hover:bg-[#2d0980]"
              href="#purchase"
            >
              Use Vexel
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/30 group-hover:bg-white/30 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M7 7h10v10"/>
                  <path d="M7 17 17 7"/>
                </svg>
              </span>
            </a>
            <a
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-slate-600 bg-white border border-slate-200 shadow-sm rounded-2xl hover:bg-slate-50 hover:text-slate-900 transition-colors"
              href="https://discord.com/invite/hPCDXWpP4A"
            >
              Join Vexel Community
              <svg className="w-5 h-5 ml-2 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
              </svg>
            </a>
          </AnimatedContainer>

          {/* Trust items */}
          <AnimatedContainer delay={0.68} className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 pt-6 sm:pt-10 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-emerald-600">
                  <path d="M21.801 10A10 10 0 1 1 17 3.335"/>
                  <path d="m9 11 3 3L22 4"/>
                </svg>
              </div>
              <span className="font-medium text-slate-700">140+ Features</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#3a0ca3]/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-[#3a0ca3]">
                  <path d="M21.801 10A10 10 0 1 1 17 3.335"/>
                  <path d="m9 11 3 3L22 4"/>
                </svg>
              </div>
              <span className="font-medium text-slate-700">No coding</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-purple-600">
                  <path d="M21.801 10A10 10 0 1 1 17 3.335"/>
                  <path d="m9 11 3 3L22 4"/>
                </svg>
              </div>
              <span className="font-medium text-slate-700">One time Fee</span>
            </div>
          </AnimatedContainer>

          {/* Phone mockups + stats */}
          <AnimatedContainer delay={0.9} className="pt-12 sm:pt-16">
            <div className="text-center mb-10">
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                Used by the Biggest Names in Reselling
              </h3>
              <p className="text-slate-500 text-base sm:text-lg">
                Join successful resellers making 6-figures with our theme
              </p>
            </div>

            <PhonesWithScrollReveal />

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-4 sm:gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">$3.5M+</div>
                <div className="text-xs sm:text-sm text-slate-500 font-medium">Combined Sales</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">150K+</div>
                <div className="text-xs sm:text-sm text-slate-500 font-medium">Customers Served</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">4.9★</div>
                <div className="text-xs sm:text-sm text-slate-500 font-medium">Average Rating</div>
              </div>
            </div>
          </AnimatedContainer>

        </div>
      </div>
    </section>
  );
}

// ─── Scroll-driven phone reveal ───────────────────────────────────────────────
function PhonesWithScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });

  // Tilt flattens as the section scrolls into view
  const rotateX = useTransform(scrollYProgress, [0, 0.4], [22, 0]);
  const scale   = useTransform(scrollYProgress, [0, 0.4], [0.88, 1]);
  const translateY = useTransform(scrollYProgress, [0, 0.4], [40, 0]);

  return (
    <div ref={ref} style={{ perspective: '1200px' }}>
      <motion.div
        style={{ rotateX, scale, translateY }}
        className="relative flex justify-center items-end gap-2 sm:gap-4 md:gap-8 px-2 sm:px-4"
      >
        {/* Left phone */}
        <div className="relative w-1/3 max-w-[160px] sm:max-w-[180px] md:max-w-[200px]">
          <motion.div
            initial={{ rotateY: 22, rotateX: 4, translateZ: -60, scale: 0.88 }}
            whileHover={{ translateY: -14, scale: 0.93 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            style={{ filter: 'blur(0.4px)' }}
          >
            <PhoneMockup
              src="https://assets.scaled.info/api/img/img_01kfkme92a3h5x1s08fseqced9"
              alt="Top Reseller Store"
              ringColor="shadow-slate-400/30"
            />
          </motion.div>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-3/4 h-3 bg-black/10 rounded-full blur-xl" />
        </div>

        {/* Center phone (featured + bob) */}
        <div className="relative w-1/3 max-w-[180px] sm:max-w-[200px] md:max-w-[220px] mb-8 sm:mb-4 z-10">
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          >
            <motion.div
              initial={{ rotateY: 0, rotateX: 2, translateZ: 40, scale: 1.05 }}
              whileHover={{ translateY: -14, scale: 1.08 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
              <PhoneMockup
                src="https://assets.scaled.info/api/img/img_01kfkme927sq87xkdbn012j28r"
                alt="Featured #1 Reseller Store"
                ringColor="shadow-[#3a0ca3]/25"
                featured
              />
            </motion.div>
          </motion.div>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-full h-5 bg-black/15 rounded-full blur-xl" />
        </div>

        {/* Right phone */}
        <div className="relative w-1/3 max-w-[160px] sm:max-w-[180px] md:max-w-[200px]">
          <motion.div
            initial={{ rotateY: -22, rotateX: 4, translateZ: -60, scale: 0.88 }}
            whileHover={{ translateY: -14, scale: 0.93 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            style={{ filter: 'blur(0.4px)' }}
          >
            <PhoneMockup
              src="https://assets.scaled.info/api/img/img_01kfkme929wdwcv9sz1e7kpnwm"
              alt="Elite Reseller Store"
              ringColor="shadow-slate-400/30"
            />
          </motion.div>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-3/4 h-3 bg-black/10 rounded-full blur-xl" />
        </div>
      </motion.div>
    </div>
  );
}

// ─── Phone mockup helper ───────────────────────────────────────────────────────
function PhoneMockup({
  src,
  alt,
  ringColor,
  featured = false,
}: {
  src: string;
  alt: string;
  ringColor?: string;
  featured?: boolean;
}) {
  return (
    <div className="relative">
      <div
        className={`relative rounded-[1.5rem] sm:rounded-[2rem] p-[3px] sm:p-1 shadow-2xl bg-[#6e6e73] ${ringColor ?? ''} ${featured ? 'ring-4 ring-[#3a0ca3]/10' : ''}`}
      >
        <div className="relative bg-black rounded-[1.4rem] sm:rounded-[1.85rem] p-[2px] sm:p-[3px]">
          {/* Side buttons */}
          <div className="absolute -right-[2px] sm:-right-[3px] top-[22%] w-[2px] sm:w-[3px] h-[12%] bg-[#5e5e63] rounded-r-full" />
          <div className="absolute -left-[2px] sm:-left-[3px] top-[18%] w-[2px] sm:w-[3px] h-[6%] bg-[#5e5e63] rounded-l-full" />
          <div className="absolute -left-[2px] sm:-left-[3px] top-[26%] w-[2px] sm:w-[3px] h-[10%] bg-[#5e5e63] rounded-l-full" />
          <div className="absolute -left-[2px] sm:-left-[3px] top-[38%] w-[2px] sm:w-[3px] h-[10%] bg-[#5e5e63] rounded-l-full" />
          <div className="relative aspect-[9/19.5] rounded-[1.25rem] sm:rounded-[1.7rem] overflow-hidden bg-black">
            {/* Camera pill */}
            <div className="absolute top-2 sm:top-3 left-1/2 -translate-x-1/2 w-[27%] h-[3.2%] bg-black rounded-full z-20">
              <div className="absolute right-[10%] top-1/2 -translate-y-1/2 h-[55%] aspect-square rounded-full bg-[#0d0d1a] ring-1 ring-[#2a2a3a]/50">
                <div className="absolute inset-[8%] rounded-full bg-[#1a1a2e] ring-1 ring-[#3a3a4a]/30" />
                <div className="absolute inset-[20%] rounded-full bg-[#0f0f1a]" />
                <div className="absolute inset-[25%] rounded-full bg-[#4a4a6a]/40" />
                <div className="absolute top-[18%] left-[22%] w-[18%] h-[18%] rounded-full bg-white/20 blur-[0.5px]" />
              </div>
            </div>
            <img src={src} alt={alt} className="w-full h-full object-cover object-top" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── AnimatedContainer (same pattern as footer) ────────────────────────────────
type ViewAnimationProps = {
  delay?: number;
  className?: ComponentProps<typeof motion.div>['className'];
  children: ReactNode;
};

function AnimatedContainer({ className, delay = 0.1, children }: ViewAnimationProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ filter: 'blur(6px)', translateY: -12, opacity: 0 }}
      animate={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
      transition={{ delay, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
