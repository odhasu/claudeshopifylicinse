"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";

interface SessionInfo {
  plan: string;
  planName?: string;
  email: string | null;
}

export default function CheckoutSuccessPage() {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // PaymentIntent-based checkout (new custom checkout page)
    const paymentIntentId = params.get("payment_intent");
    // Legacy: Stripe hosted checkout session
    const sessionId = params.get("session_id");

    if (!paymentIntentId && !sessionId) {
      setLoading(false);
      return;
    }

    const url = paymentIntentId
      ? `/api/stripe/payment-intent?payment_intent=${paymentIntentId}`
      : `/api/stripe/session?session_id=${sessionId}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.plan || data.planName) {
          setSession({
            plan: data.plan || data.planName || "Unknown",
            planName: data.planName,
            email: data.email || null,
          });
        }
        // Fire confetti on success
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.55 },
          colors: ["#3a0ca3", "#7b2ff7", "#c084fc", "#e9d5ff", "#ffffff"],
          ticks: 250,
          gravity: 1.1,
          decay: 0.93,
          startVelocity: 35,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
        {loading ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#3a0ca3]" />
            <p className="text-slate-500">Confirming your purchase…</p>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-5">
              <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Payment Successful!
            </h1>

            {session ? (
              <p className="text-slate-500 mb-6">
                Thank you for purchasing{" "}
                <span className="font-semibold text-slate-800">
                  {session.planName || `Vexel ${session.plan}`}
                </span>
                .{" "}
                {session.email && (
                  <>
                    A confirmation has been sent to{" "}
                    <span className="font-medium text-slate-700">
                      {session.email}
                    </span>
                    .
                  </>
                )}
              </p>
            ) : (
              <p className="text-slate-500 mb-6">
                Your purchase was successful. You can view your license in your
                account dashboard.
              </p>
            )}

            <div className="space-y-3">
              <Link
                href="/theme/account"
                className="inline-flex items-center justify-center gap-2 w-full rounded-lg bg-[#3a0ca3] text-white font-semibold py-3 px-4 hover:bg-[#2d0980] transition-colors"
              >
                Go to Account
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/theme"
                className="inline-flex items-center justify-center w-full rounded-lg border border-slate-200 text-slate-700 font-medium py-3 px-4 hover:bg-slate-50 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
