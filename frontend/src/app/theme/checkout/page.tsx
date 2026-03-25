"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, Lock, ShieldCheck, Loader2, ArrowLeft, CreditCard } from "lucide-react";
import { loadStripe, type Stripe, type StripeElements } from "@stripe/stripe-js";

const PUBLISHABLE_KEY =
  "pk_live_51S2H2AB8UhzJlNR2iEnXOmNy2XxIv1LVg3n3XClYeGOGwsBou2Lltfsa7DfUSAoeYwKjJXsZv0lBn9YIBMslmqqu00g6PBe23t";

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

  // Read plan from URL client-side only (avoids SSR/hydration mismatch)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = (params.get("plan") || "PRO").toUpperCase() as "LITE" | "PRO";
    setPlan(PLANS[p] ? p : "PRO");
    setMounted(true);
  }, []);

  // Init Stripe only after plan is known
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
            theme: "stripe",
            variables: {
              colorPrimary: "#3a0ca3",
              colorBackground: "#ffffff",
              colorText: "#1e293b",
              colorTextSecondary: "#64748b",
              colorTextPlaceholder: "#94a3b8",
              colorDanger: "#dc2626",
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontSizeBase: "15px",
              spacingUnit: "4px",
              borderRadius: "8px",
              gridRowSpacing: "16px",
            },
            rules: {
              ".Input": {
                border: "1px solid #e2e8f0",
                boxShadow: "none",
                padding: "12px 14px",
              },
              ".Input:focus": {
                border: "1px solid #3a0ca3",
                boxShadow: "0 0 0 3px rgba(58, 12, 163, 0.08)",
              },
              ".Label": {
                fontWeight: "500",
                fontSize: "13px",
                color: "#374151",
                marginBottom: "6px",
              },
            },
          },
        });
        elementsRef.current = elements;

        // Mount into an always-empty div — React never renders children there
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

  // Render nothing until client-side mount to avoid hydration mismatch
  if (!mounted) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#3a0ca3]" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/theme"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors"
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

      <div className="max-w-5xl mx-auto px-4 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">

          {/* ── Order Summary ── */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-[#3a0ca3] px-6 py-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-purple-300 mb-1">
                  Your order
                </p>
                <h2 className="text-2xl font-bold text-white">{planInfo.name}</h2>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-extrabold text-white">${planInfo.price}</span>
                  <span className="text-purple-300 text-sm">one-time</span>
                </div>
              </div>

              <div className="px-6 py-5 space-y-3">
                {planInfo.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 h-4 w-4 rounded-full bg-[#3a0ca3]/10 flex items-center justify-center flex-shrink-0">
                      <Check className="h-2.5 w-2.5 text-[#3a0ca3]" />
                    </div>
                    <span className="text-sm text-slate-600">{f}</span>
                  </div>
                ))}
              </div>

              <div className="px-6 pb-5 pt-1 border-t border-slate-100">
                <div className="flex justify-between text-sm font-semibold text-slate-800">
                  <span>Total</span>
                  <span>${planInfo.price}.00 USD</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">One-time payment · No subscription</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {[
                { icon: ShieldCheck, text: "256-bit SSL encryption" },
                { icon: Lock, text: "Payments handled by Stripe" },
                { icon: CreditCard, text: "Visa, Mastercard, American Express" },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-500 text-sm">
                  <Icon className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* ── Payment Form ── */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Payment details</h3>

              {status === "error" ? (
                <div className="py-8 text-center">
                  <p className="text-red-600 text-sm mb-4">{errorMsg}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="text-[#3a0ca3] text-sm font-medium hover:underline"
                  >
                    Try again
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {/* Loading overlay shown above the (empty) Stripe mount target */}
                  {status === "loading" && (
                    <div className="flex items-center justify-center py-12 gap-3 text-slate-400 mb-6">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-sm">Loading payment form…</span>
                    </div>
                  )}

                  {/*
                    IMPORTANT: this div must always be in the DOM and always empty
                    from React's perspective. Stripe owns its content — React must
                    never render children here or it will conflict on unmount.
                  */}
                  <div
                    id="stripe-payment-element"
                    className="mb-6"
                    style={{ display: status === "loading" ? "none" : "block" }}
                  />

                  {errorMsg && status === "ready" && (
                    <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status !== "ready" && status !== "submitting"}
                    className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-[#3a0ca3] text-white font-semibold py-3.5 px-6 text-base hover:bg-[#2d0980] active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing…
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        Pay ${planInfo.price}.00
                      </>
                    )}
                  </button>

                  <p className="mt-4 text-center text-xs text-slate-400">
                    By completing your purchase you agree to our{" "}
                    <Link href="/theme/docs" className="underline hover:text-slate-600">
                      Terms of Service
                    </Link>
                    . No refunds on digital goods.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
