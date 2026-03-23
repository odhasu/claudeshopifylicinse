'use client';
import React, { useState } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';

const accordionSections = [
  {
    label: 'Contact & Support',
    links: [
      { title: 'Contact Support', href: '/theme/support' },
      { title: 'Documentation', href: '/theme/docs' },
      { title: 'Account', href: '/theme/account' },
      { title: 'Compare Plans', href: '/theme/pricing' },
    ],
  },
  {
    label: 'Legal & Policies',
    links: [
      { title: 'Privacy Policy', href: '/theme/error' },
      { title: 'Terms of Service', href: '/theme/error' },
      { title: 'Refund Policy', href: '/theme/error' },
      { title: 'Disclosures', href: '/theme/error' },
    ],
  },
];

function AccordionSection({ label, links }: { label: string; links: { title: string; href: string }[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 last:border-b-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-4 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
        aria-expanded={open}
      >
        {label}
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <ul className="pb-4 space-y-2.5 pl-1">
          {links.map((link) => (
            <li key={link.title}>
              <Link
                href={link.href}
                className="text-sm text-slate-500 hover:text-[#3a0ca3] transition-colors"
              >
                {link.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Footer() {
  return (
    <footer className="relative w-full border-t border-slate-200 bg-slate-50 px-6 py-10">
      {/* subtle top glow */}
      <div className="absolute top-0 left-1/2 h-px w-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3a0ca3]/30 blur-sm" />

      <div className="mx-auto max-w-2xl">
        <AnimatedContainer>
          {accordionSections.map((section) => (
            <AccordionSection key={section.label} label={section.label} links={section.links} />
          ))}
        </AnimatedContainer>

        <AnimatedContainer delay={0.15} className="mt-8 space-y-1 text-center">
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} Vexel. All rights reserved.</p>
          <p className="text-xs text-slate-400">
          </p>
        </AnimatedContainer>
      </div>
    </footer>
  );
}

type ViewAnimationProps = {
  delay?: number;
  className?: ComponentProps<typeof motion.div>['className'];
  children: ReactNode;
};

function AnimatedContainer({ className, delay = 0.1, children }: ViewAnimationProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
      whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
