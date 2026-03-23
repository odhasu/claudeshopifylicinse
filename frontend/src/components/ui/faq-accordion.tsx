'use client';

import { useState } from 'react';

const FAQS = [
  {
    q: 'What exactly is this theme for?',
    a: 'Vexel is a premium Shopify theme built specifically for resellers of digital products — vendor links, software keys, game credits, and more. It includes 140+ conversion-focused features like AI chatbot, urgency tools, review widgets, and product image generator so your store looks and performs like a professional brand from day one.',
  },
  {
    q: 'I clicked "Get this store design" from another store. Is this the same theme they use?',
    a: 'Yes — if you saw the referral link on a store selling digital products and it brought you here, you\'re in the right place. Vexel powers thousands of reseller stores and is the most copied theme in the digital-product niche.',
  },
  {
    q: "What's included with the theme?",
    a: 'Every tier includes the full Vexel theme file (140+ features), the product image generator, the product list generator, complete documentation, and lifetime updates. Pro and Agency tiers add hands-on setup calls, unlimited store remakes if your account gets banned, community access, and priority support.',
  },
  {
    q: 'Do I need coding skills to use this theme?',
    a: 'Not at all. Vexel is built for non-coders. Every setting is controlled through Shopify\'s drag-and-drop editor, and our AI Customizer lets you describe changes in plain English and applies them automatically. If you get stuck, our step-by-step documentation and support team have you covered.',
  },
  {
    q: 'How long does setup take?',
    a: 'Most customers are live in under 15 minutes. Install the theme, follow the quick-start guide, connect your payment processor, and publish. Pro plan customers also get a dedicated 1-on-1 setup call to get everything perfect before launch.',
  },
  {
    q: 'What makes this theme different from free Shopify themes?',
    a: 'Free Shopify themes are built for general retail and lack the conversion tools resellers need: live viewer counts, urgency countdowns, AI chatbot, social proof widgets, and digital-product compliance features. Vexel includes all of that out of the box — no expensive apps required, saving you $200–$500/month in app fees.',
  },
  {
    q: 'Do I get updates and support?',
    a: 'Yes. All plans include lifetime theme updates delivered automatically through Shopify. You also get access to our documentation portal and email support. Pro customers get priority response times, and Agency customers receive a dedicated account manager.',
  },
  {
    q: 'What is your refund policy?',
    a: 'We offer a 7-day money-back guarantee. If you set up the theme and it\'s not the right fit, contact us within 7 days of purchase and we\'ll issue a full refund — no questions asked. After 7 days, all sales are final due to the digital nature of the product.',
  },
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {FAQS.map((faq, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={i}
            className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <button
              className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 group"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
            >
              <span className="text-lg font-semibold text-slate-900 pr-8 group-hover:text-[#3a0ca3] transition-colors">
                {faq.q}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#3a0ca3]' : 'text-slate-400'}`}
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}
            >
              <div className="px-6 pb-5 pt-0">
                <div className="h-px bg-slate-100 mb-4" />
                <p className="text-slate-600 leading-relaxed text-base">{faq.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
