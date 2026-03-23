"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { MessageCircle, BookOpen, MessageSquare, ChevronDown } from "lucide-react";
import { insertSupportMessage } from "@/lib/supabase";

// ─── Data ────────────────────────────────────────────────────────────────────

const STEPS = [
  {
    step: "Step 1",
    icon: MessageSquare,
    title: "Open the chat",
    description:
      "Click the chat icon in the bottom-right corner of any Vexel page to start a live session with our support team.",
  },
  {
    step: "Step 2",
    icon: MessageCircle,
    title: "Get a text reply",
    description:
      "A real human will respond within minutes during business hours — no bots, no scripted replies.",
  },
  {
    step: "Step 3",
    icon: BookOpen,
    title: "Problem solved",
    description:
      "We'll walk you through the fix step-by-step or point you to the exact docs section you need.",
  },
];

const FAQS = [
  {
    title: "How do I download my theme?",
    body: "After purchase you'll receive an email with a download link. You can also find it any time in your Account dashboard under Purchases.",
  },
  {
    title: "How do I activate my license?",
    body: "Open your theme's settings panel, navigate to License, and paste the key from your confirmation email. One key activates one site.",
  },
  {
    title: "Can I request customizations?",
    body: "Yes — chat with us and describe what you need. Smaller tweaks are often free; larger custom builds are quoted on a project basis.",
  },
];

const FOOTER_GROUPS = [
  {
    label: "Contact & Support",
    links: [
      { text: "Live Chat", href: "/theme/error" },
      { text: "Email Support", href: "/theme/error" },
      { text: "Documentation", href: "/theme/docs" },
    ],
  },
  {
    label: "Legal & Policies",
    links: [
      { text: "Terms of Service", href: "/theme/error" },
      { text: "Privacy Policy", href: "/theme/error" },
      { text: "Refund Policy", href: "/theme/error" },
    ],
  },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function FooterAccordion({ label, links }: { label: string; links: { text: string; href: string }[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-slate-200 py-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-sm font-semibold text-slate-800"
      >
        {label}
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <ul className="mt-3 space-y-2 pl-1">
          {links.map((l) => (
            <li key={l.text}>
              <Link href={l.href} className="text-sm text-slate-500 hover:text-slate-800 transition-colors">
                {l.text}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SupportPage() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      await insertSupportMessage(formData.name, formData.email, formData.message);
      setSubmitStatus({ 
        type: 'success', 
        message: 'Message sent! We\'ll get back to you within 24 hours.' 
      });
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error('Error sending message:', error);
      setSubmitStatus({ 
        type: 'error', 
        message: 'Failed to send message. Please try again or email support@vexel.com directly.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="pt-36 pb-20 px-6 text-center">
        {/* Green pill */}
        <div className="inline-flex items-center gap-2 rounded-full bg-[#f0fdf4] border border-green-200 px-4 py-1.5 text-sm font-medium text-green-700 mb-6">
          <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
          Live support available
        </div>

        {/* H1 */}
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight mb-5">
          Real support from{" "}
          <span className="text-[#3a0ca3]">real people</span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-xl mx-auto text-lg text-[#64748b] leading-relaxed mb-10">
          Skip the ticket queue. Chat directly with our team and get a real
          answer — usually in under 15 minutes.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="#contact-form"
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white text-sm font-semibold px-7 py-3 hover:bg-slate-700 transition-colors"
          >
            <MessageCircle size={16} />
            Send us a message →
          </a>
          <Link
            href="/theme/docs"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 text-slate-800 text-sm font-semibold px-7 py-3 hover:bg-slate-50 transition-colors"
          >
            <BookOpen size={16} />
            Browse docs
          </Link>
        </div>
      </section>

      {/* ── Steps ────────────────────────────────────────────────────────── */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {STEPS.map(({ step, icon: Icon, title, description }) => (
            <div
              key={step}
              className="rounded-2xl border border-[#e2e8f0] bg-white p-7 flex flex-col gap-4"
            >
              {/* Icon */}
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[rgba(58,12,163,0.08)]">
                <Icon size={22} className="text-[#3a0ca3]" />
              </div>
              {/* Step label */}
              <span className="text-xs font-bold uppercase tracking-widest text-[#3a0ca3]">
                {step}
              </span>
              {/* Title */}
              <h3 className="text-lg font-bold text-slate-900 -mt-2">{title}</h3>
              {/* Body */}
              <p className="text-sm text-[#64748b] leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Contact Form ─────────────────────────────────────────────────── */}
      <section id="contact-form" className="py-16 px-6 max-w-2xl mx-auto">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Send us a message</h2>
          <p className="text-sm text-slate-500 mb-6">
            Fill out the form below and we'll get back to you within 24 hours.
          </p>

          {submitStatus && (
            <div className={`mb-6 p-4 rounded-lg ${
              submitStatus.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <p className="text-sm font-medium">{submitStatus.message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3a0ca3] focus:border-transparent outline-none transition-all"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3a0ca3] focus:border-transparent outline-none transition-all"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-2">
                Message
              </label>
              <textarea
                id="message"
                required
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#3a0ca3] focus:border-transparent outline-none transition-all resize-none"
                placeholder="How can we help you?"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 text-white text-sm font-semibold px-6 py-3 hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────────── */}
      <section className="py-8 px-6 max-w-5xl mx-auto">
        <div className="rounded-2xl bg-[#13151f] px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10 text-center">
            <div className="py-6 sm:py-0 sm:px-8">
              <p className="text-3xl font-extrabold text-white">&lt;&nbsp;15 min</p>
              <p className="mt-1.5 text-sm text-slate-400">avg. response time</p>
            </div>
            <div className="py-6 sm:py-0 sm:px-8">
              <p className="text-3xl font-extrabold text-white">Mon – Sun</p>
              <p className="mt-1.5 text-sm text-slate-400">9 AM – 10 PM PST</p>
            </div>
            <div className="py-6 sm:py-0 sm:px-8">
              <p className="text-3xl font-extrabold text-white">1-on-1</p>
              <p className="mt-1.5 text-sm text-slate-400">via text chat</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Common questions (FAQ cards) ─────────────────────────────────── */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-10">
          Common questions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {FAQS.map(({ title, body }) => (
            <div
              key={title}
              className="rounded-2xl border border-[#e2e8f0] bg-white p-7 flex flex-col gap-3"
            >
              <h3 className="text-base font-bold text-slate-900">{title}</h3>
              <p className="text-sm text-[#64748b] leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Still need help CTA ──────────────────────────────────────────── */}
      <section className="py-8 px-6 max-w-3xl mx-auto">
        <div className="rounded-2xl bg-[#eef2ff] px-10 py-12 text-center flex flex-col items-center gap-5">
          <h2 className="text-2xl font-extrabold text-slate-900">Still need help?</h2>
          <p className="text-sm text-[#64748b] max-w-sm leading-relaxed">
            Our team is online now and happy to assist you with anything — even
            the tricky stuff.
          </p>
          <a
            href="#contact-form"
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white text-sm font-semibold px-7 py-3 hover:bg-slate-700 transition-colors"
          >
            <MessageCircle size={16} />
            Send us a message →
          </a>
          <p className="text-xs text-[#64748b]">
            For billing or license questions, mention your order number in the message.
          </p>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="mt-16 border-t border-slate-100 px-6 py-10 max-w-3xl mx-auto">
        <div className="space-y-0">
          {FOOTER_GROUPS.map((group) => (
            <FooterAccordion key={group.label} label={group.label} links={group.links} />
          ))}
        </div>
        <p className="mt-8 text-center text-xs text-slate-400">
          © 2026 Vexel. All rights reserved.
        </p>
      </footer>

    </div>
  );
}
