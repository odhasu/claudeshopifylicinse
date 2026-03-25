"use client";

import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Star, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useRef } from "react";
import confetti from "canvas-confetti";
import NumberFlow from "@number-flow/react";

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
  title = "Simple, Transparent Pricing",
  description = "Choose the plan that works for you.\nAll plans include lifetime access & free updates.",
}: PricingProps) {
  const [isMonthly, setIsMonthly] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const switchRef = useRef<HTMLButtonElement>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  async function handlePurchaseClick(planName: 'LITE' | 'PRO') {
    setLoadingPlan(planName);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planName }),
      });
      const data = await res.json();
      if (!res.ok) { setToastMsg(data.error || 'Something went wrong'); return; }
      window.location.href = data.url;
    } catch {
      setToastMsg('Failed to start checkout. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  }

  const isOneTime = plans.every((p) => p.period === "one time");

  const handleToggle = (checked: boolean) => {
    setIsMonthly(!checked);
    if (checked && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      confetti({
        particleCount: 60,
        spread: 70,
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight,
        },
        colors: ["#3a0ca3", "#7b2ff7", "#c084fc", "#e9d5ff"],
        ticks: 200,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
        shapes: ["circle"],
      });
    }
  };

  return (
    <div className="container mx-auto py-20 px-4">
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl text-slate-900">
          {title}
        </h2>
        <p className="text-slate-500 text-lg whitespace-pre-line">
          {description}
        </p>
      </div>

      {!isOneTime && (
        <div className="flex justify-center items-center mb-10 gap-3">
          <span className="font-medium text-slate-600">Monthly</span>
          <Label>
            <Switch
              ref={switchRef as React.Ref<HTMLButtonElement>}
              checked={!isMonthly}
              onCheckedChange={handleToggle}
            />
          </Label>
          <span className="font-semibold text-slate-800">
            Annual <span className="text-[#3a0ca3]">(Save 20%)</span>
          </span>
        </div>
      )}

      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-sm font-medium px-5 py-3 rounded-full shadow-xl animate-fade-in">
          {toastMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {plans.map((plan, index) => (
          <motion.div
            key={index}
            initial={{ y: 50, opacity: 0 }}
            whileInView={
              isDesktop
                ? {
                    y: plan.isPopular ? -16 : 0,
                    opacity: 1,
                    scale: plan.isPopular ? 1.0 : 0.97,
                  }
                : { opacity: 1, y: 0 }
            }
            viewport={{ once: true }}
            transition={{
              duration: 1.6,
              type: "spring",
              stiffness: 100,
              damping: 30,
              delay: 0.2 + index * 0.1,
            }}
            className={cn(
              "rounded-2xl border bg-white text-center lg:flex lg:flex-col lg:justify-center relative flex flex-col overflow-hidden",
              plan.isPopular
                ? "border-[#3a0ca3] border-2 shadow-2xl shadow-[#3a0ca3]/20"
                : "border-slate-200 shadow-lg shadow-slate-200/60",
              !plan.isPopular && "mt-5"
            )}
          >
            {/* Pro card: purple gradient header */}
            {plan.isPopular ? (
              <div className="bg-[#3a0ca3] px-6 pt-6 pb-5 text-center relative">
                <span className="absolute top-4 right-4 inline-flex items-center gap-1 bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  <Star className="h-3 w-3 fill-current" />
                  Populair
                </span>
                <div className="mb-2">
                  <p className="text-2xl font-extrabold tracking-wide text-white uppercase">
                    {plan.name}
                  </p>
                </div>
                {plan.displayName && (
                  <h3 className="text-xl font-bold text-white mt-1">{plan.displayName}</h3>
                )}
              </div>
            ) : null}

            <div className={cn("flex-1 flex flex-col", plan.isPopular ? "p-6" : "p-6")}>
              {!plan.isPopular && (
                <>
                  <p className="text-2xl font-extrabold tracking-wide text-slate-900 uppercase mb-2">
                    {plan.name}
                  </p>
                  {plan.displayName && (
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.displayName}</h3>
                  )}
                </>
              )}

              <div className="flex items-end justify-center gap-1 mt-2">
                <span className="text-5xl font-bold tracking-tight text-slate-900">
                  <NumberFlow
                    value={isMonthly ? Number(plan.price) : Number(plan.yearlyPrice)}
                    format={{
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }}
                    transformTiming={{ duration: 500, easing: "ease-out" }}
                    willChange
                    className="tabular-nums"
                  />
                </span>
                <span className="text-sm font-medium text-slate-400 mb-2">
                  / {plan.period}
                </span>
              </div>

              {!isOneTime && (
                <p className="text-xs text-slate-400 mt-1">
                  {isMonthly ? "billed monthly" : "billed annually"}
                </p>
              )}

              <ul className="mt-6 space-y-2.5 text-left">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-[#3a0ca3] mt-0.5 flex-shrink-0" />
                    <span className="text-slate-600 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <hr className="w-full my-5 border-slate-100" />

              {plan.href.includes('#purchase') ? (
                <button
                  onClick={() => handlePurchaseClick(plan.name as 'LITE' | 'PRO')}
                  disabled={!!loadingPlan}
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "w-full text-base font-semibold tracking-tight transition-all duration-200",
                    "hover:ring-2 hover:ring-[#3a0ca3] hover:ring-offset-1",
                    plan.isPopular
                      ? "bg-[#3a0ca3] text-white border-[#3a0ca3] hover:bg-[#2d0980] hover:border-[#2d0980] hover:text-white"
                      : "bg-white text-slate-900 hover:bg-[#3a0ca3] hover:text-white hover:border-[#3a0ca3]",
                    loadingPlan === plan.name && "opacity-70 cursor-not-allowed"
                  )}
                >
                  {loadingPlan === plan.name ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Redirecting…
                    </span>
                  ) : plan.buttonText}
                </button>
              ) : (
                <Link
                  href={plan.href}
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "w-full text-base font-semibold tracking-tight transition-all duration-200",
                    "hover:ring-2 hover:ring-[#3a0ca3] hover:ring-offset-1",
                    plan.isPopular
                      ? "bg-[#3a0ca3] text-white border-[#3a0ca3] hover:bg-[#2d0980] hover:border-[#2d0980] hover:text-white"
                      : "bg-white text-slate-900 hover:bg-[#3a0ca3] hover:text-white hover:border-[#3a0ca3]"
                  )}
                >
                  {plan.buttonText}
                </Link>
              )}

              <p className="mt-4 text-xs text-slate-400 leading-relaxed">
                {plan.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Compare all features link */}
      <div className="flex justify-center mt-6">
        <Link
          href="/theme/pricing"
          className="text-sm font-medium text-[#3a0ca3] hover:underline inline-flex items-center gap-1"
        >
          Compare all features →
        </Link>
      </div>
    </div>
  );
}
