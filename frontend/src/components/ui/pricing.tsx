"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export interface PricingPlan {
  name: string;
  displayName?: string;
  price: string;
  yearlyPrice: string;
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular: boolean;
}

interface PricingProps {
  plans: PricingPlan[];
  title?: string;
  description?: string;
}

export function Pricing({
  plans,
  title = "Choose Your Plan",
  description = "One time price. Yours for life.",
}: PricingProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  async function handlePurchaseClick(planName: string) {
    setLoadingPlan(planName);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planName }),
      });
      const data = await res.json();
      if (!res.ok) { setToastMsg(data.error || "Something went wrong"); return; }
      window.location.href = data.url;
    } catch {
      setToastMsg("Failed to start checkout. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div className="container mx-auto py-20 px-4">
      {/* Title */}
      <div className="text-center mb-12">
        <h2 className="text-5xl font-extrabold tracking-tight text-slate-900 mb-3">{title}</h2>
        <p className="text-slate-500 text-lg">{description}</p>
      </div>

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-sm font-medium px-5 py-3 rounded-full shadow-xl">
          {toastMsg}
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {plans.map((plan, index) => (
          <motion.div
            key={index}
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            {plan.isPopular ? (
              /* ── PRO card — blue gradient ── */
              <div className="rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/20 border border-blue-400/20">
                {/* Blue gradient top */}
                <div className="bg-gradient-to-br from-[#1a6fff] to-[#4040e8] px-6 pt-6 pb-7 relative">
                  {/* SAVE $200 badge */}
                  <span className="inline-flex items-center bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                    SAVE $200
                  </span>

                  {/* Name + 3D icon row */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-2xl font-extrabold text-white mb-1">
                        {plan.displayName || plan.name}
                      </h3>
                      {/* Price */}
                      <div className="flex items-end gap-1 mt-2">
                        <span className="text-5xl font-extrabold text-white tracking-tight">
                          ${plan.price}
                        </span>
                      </div>
                      <p className="text-white/70 text-sm mt-1">{plan.period}</p>
                      <p className="text-white/70 text-sm mt-0.5">{plan.description}</p>
                    </div>
                    {/* Diamond logo */}
                    <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/20 flex-shrink-0 mt-1 p-3">
                      <img src="/diamond-logo.svg" alt="Vexel" className="w-full h-full object-contain" />
                    </div>
                  </div>
                </div>

                {/* White bottom */}
                <div className="bg-white px-6 pt-6 pb-6 flex flex-col gap-5">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className={cn("flex items-start gap-2.5", idx === 0 && "font-semibold text-slate-900")}>
                        <Check className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <ProButton plan={plan} loadingPlan={loadingPlan} onPurchase={handlePurchaseClick} />
                </div>
              </div>
            ) : (
              /* ── LITE card — white ── */
              <div className="rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-lg shadow-slate-200/60">
                <div className="px-6 pt-6 pb-6 flex flex-col gap-5">
                  {/* LITE badge */}
                  <span className="inline-flex w-fit items-center bg-slate-100 text-slate-500 text-xs font-bold px-3 py-1 rounded-full">
                    LITE
                  </span>

                  {/* Name */}
                  <div>
                    <h3 className="text-2xl font-extrabold text-slate-900">
                      {plan.displayName || plan.name}
                    </h3>
                    {/* Price */}
                    <div className="flex items-end gap-1 mt-2">
                      <span className="text-5xl font-extrabold text-slate-900 tracking-tight">
                        ${plan.price}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mt-1">{plan.period}</p>
                    <p className="text-slate-400 text-sm mt-0.5">{plan.description}</p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check className="h-4 w-4 text-[#3a0ca3] mt-0.5 flex-shrink-0" />
                        <span className="text-slate-600 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <LiteButton plan={plan} loadingPlan={loadingPlan} onPurchase={handlePurchaseClick} />
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Compare all features link */}
      <div className="flex justify-center mt-6">
        <Link href="/theme/pricing" className="text-sm font-medium text-[#3a0ca3] hover:underline inline-flex items-center gap-1">
          Compare all features →
        </Link>
      </div>
    </div>
  );
}

function LiteButton({ plan, loadingPlan, onPurchase }: { plan: PricingPlan; loadingPlan: string | null; onPurchase: (name: string) => void }) {
  const isLoading = loadingPlan === plan.name;
  const cls = "w-full rounded-xl bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold py-3.5 transition-colors flex items-center justify-center gap-2";
  if (plan.href.includes("#purchase")) {
    return (
      <button onClick={() => onPurchase(plan.name)} disabled={isLoading} className={cls}>
        {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Redirecting…</> : plan.buttonText}
      </button>
    );
  }
  return <Link href={plan.href} className={cls}>{plan.buttonText}</Link>;
}

function ProButton({ plan, loadingPlan, onPurchase }: { plan: PricingPlan; loadingPlan: string | null; onPurchase: (name: string) => void }) {
  const isLoading = loadingPlan === plan.name;
  const cls = "w-full rounded-xl bg-[#1a6fff] hover:bg-[#1558e0] text-white text-sm font-semibold py-3.5 transition-colors flex items-center justify-center gap-2";
  if (plan.href.includes("#purchase")) {
    return (
      <button onClick={() => onPurchase(plan.name)} disabled={isLoading} className={cls}>
        {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Redirecting…</> : plan.buttonText}
      </button>
    );
  }
  return <Link href={plan.href} className={cls}>{plan.buttonText}</Link>;
}
