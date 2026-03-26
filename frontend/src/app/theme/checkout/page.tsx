"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, Lock, ShieldCheck, Loader2, ArrowLeft, CreditCard } from "lucide-react";
import { loadStripe, type Stripe, type StripeElements } from "@stripe/stripe-js";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";

const PLANS: Record<string, { name: string; price: number; features: string[] }> = {
  LITE: {
    name: "Vexel Lite",
    price: 179,
    features: [
      "Full theme access",
      "AI product image generator",
      "Lifetime license",
      "Free future updates",
      "1 Shopify store",
      "Email support",
    ],
  },
  PRO: {
    name: "Vexel Pro",
    price: 379,
    features: [
      "Everything in Lite",
      "AI customizer & branding tools",
      "Priority support",
      "Unlimited stores",
      "Custom domain binding",
      "Early access to new features",
    ],
  },
};

export default function CheckoutPage() {
  const [plan, setPlan] = useState<"LITE" | "PRO">("PRO");
  const [status, setStatus] = useState<"loading" | "ready" | "submitting" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const stripeRef = useRef<Stripe | null>(null);
  const elementsRef = useRef<StripeElements | null>(null);
  const initStarted = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = (params.get("plan") || "PRO").toUpperCase() as "LITE" | "PRO";
    setPlan(PLANS[p] ? p : "PRO");
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || initStarted.current) return;
    initStarted.current = true;

    async function init() {
      try {
        const stripe = await loadStripe(PUBLISHABLE_KEY);
        if (!stripe) throw new Error("Failed to load Stripe");
        stripeRef.current = stripe;

        const res = await fetch("/api/stripe/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not start checkout");

        const elements = stripe.elements({
          clientSecret: data.clientSecret,
          appearance: {
            theme: "flat",
            variables: {
              colorPrimary: "#7c3aed",
              colorBackground: "rgba(255,255,255,0.06)",
              colorText: "#f1f5f9",
              colorTextSecondary: "#94a3b8",
              colorTextPlaceholder: "#64748b",
              colorDanger: "#f87171",
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontSizeBase: "15px",
              spacingUnit: "4px",
              borderRadius: "10px",
              gridRowSpacing: "16px",
            },
            rules: {
              ".Input": {
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "none",
                padding: "12px 14px",
                backgroundColor: "rgba(255,255,255,0.06)",
                backdropFilter: "blur(8px)",
                color: "#f1f5f9",
              },
              ".Input:focus": {
                border: "1px solid rgba(124,58,237,0.6)",
                boxShadow: "0 0 0 3px rgba(124,58,237,0.15)",
                backgroundColor: "rgba(255,255,255,0.10)",
              },
              ".Label": {
                fontWeight: "500",
                fontSize: "13px",
                color: "#cbd5e1",
                marginBottom: "6px",
              },
              ".Tab": {
                border: "1px solid rgba(255,255,255,0.12)",
                backgroundColor: "rgba(255,255,255,0.06)",
                color: "#94a3b8",
              },
              ".Tab:hover": {
                backgroundColor: "rgba(255,255,255,0.10)",
              },
              ".Tab--selected": {
                border: "1px solid rgba(124,58,237,0.6)",
                backgroundColor: "rgba(124,58,237,0.15)",
                color: "#c4b5fd",
              },
              ".TabIcon--selected": {
                fill: "#c4b5fd",
              },
              ".TabLabel--selected": {
                color: "#c4b5fd",
              },
            },
          },
        });
        elementsRef.current = elements;

        const paymentElement = elements.create("payment", { layout: "tabs" });
        paymentElement.mount("#stripe-payment-element");
        setStatus("ready");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load checkout";
        setErrorMsg(msg);
        setStatus("error");
      }
    }

    init();
  }, [mounted, plan]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripeRef.current || !elementsRef.current) return;
    setStatus("submitting");
    setErrorMsg(null);

    const { error } = await stripeRef.current.confirmPayment({
      elements: elementsRef.current,
      confirmParams: {
        return_url: `${window.location.origin}/theme/checkout/success`,
      },
    });

    if (error) {
      setErrorMsg(error.message || "Payment failed. Please try again.");
      setStatus("ready");
    }
  }

  const planInfo = PLANS[plan];
  const isSubmitting = status === "submitting";

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-600/15 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[600px] rounded-full bg-violet-800/10 blur-[80px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-white/[0.02] backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/theme"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Lock className="h-3.5 w-3.5" />
            Secured by Stripe
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2 space-y-6"
          >
            <Card className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md shadow-2xl">
              <div className="bg-gradient-to-br from-violet-600 to-indigo-600 px-6 py-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-violet-200 mb-1">
                  Your order
                </p>
                <h2 className="text-2xl font-bold text-white">{planInfo.name}</h2>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-extrabold text-white">${planInfo.price}</span>
                  <span className="text-violet-200 text-sm">one-time</span>
                </div>
              </div>

              <div className="px-6 py-5 space-y-3">
                {planInfo.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 h-4 w-4 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                      <Check className="h-2.5 w-2.5 text-violet-400" />
                    </div>
                    <span className="text-sm text-slate-300">{f}</span>
                  </div>
                ))}
              </div>

              <div className="px-6 pb-5 pt-1 border-t border-white/5">
                <div className="flex justify-between text-sm font-semibold text-white">
                  <span>Total</span>
                  <span>${planInfo.price}.00 USD</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">One-time payment · No subscription</p>
              </div>
            </Card>

            <div className="space-y-2.5">
              {[
                { icon: ShieldCheck, text: "256-bit SSL encryption" },
                { icon: Lock, text: "Payments handled by Stripe" },
                { icon: CreditCard, text: "Visa, Mastercard, American Express" },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-500 text-sm">
                  <Icon className="h-4 w-4 text-slate-600 flex-shrink-0" />
                  {text}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Payment Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-3"
          >
            <Card className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md shadow-2xl hover:border-violet-500/30 transition-all duration-300">
              <div className="p-6 lg:p-8">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white">Payment Details</h3>
                  <p className="text-sm text-slate-400 mt-1">Complete your purchase securely</p>
                </div>

                {status === "error" ? (
                  <div className="py-8 text-center">
                    <p className="text-red-400 text-sm mb-4">{errorMsg}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="text-violet-400 text-sm font-medium hover:underline"
                    >
                      Try again
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    {status === "loading" && (
                      <div className="flex items-center justify-center py-12 gap-3 text-slate-500 mb-6">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-sm">Loading payment form…</span>
                      </div>
                    )}

                    <div
                      id="stripe-payment-element"
                      className="mb-6"
                      style={{ display: status === "loading" ? "none" : "block" }}
                    />

                    {errorMsg && status === "ready" && (
                      <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                        {errorMsg}
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={status !== "ready"}
                      className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-violet-600/25 hover:shadow-violet-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                    >
                      {isSubmitting ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing…
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          Pay ${planInfo.price}.00
                        </span>
                      )}
                    </Button>

                    <p className="mt-4 text-center text-xs text-slate-500">
                      <Lock className="inline-block h-3 w-3 mr-1" />
                      Payments are secure and encrypted.{" "}
                      <Link href="/theme/docs" className="underline hover:text-slate-300">
                        Terms apply
                      </Link>
                      .
                    </p>
                  </form>
                )}
              </div>
            </Card>
          </motion.div>

        </div>
      </div>
    </main>
  );
}
