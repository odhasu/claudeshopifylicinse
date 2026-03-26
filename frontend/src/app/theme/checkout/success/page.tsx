"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, ArrowRight, Loader2, Copy, Check } from "lucide-react";
import confetti from "canvas-confetti";

interface SessionInfo {
  plan: string;
  planName?: string;
  email: string | null;
  licenseKey?: string | null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

async function pollForLicense(id: string, type: "session" | "pi", attempts = 8): Promise<string | null> {
  const url = type === "session"
    ? `${API_BASE}/api/licenses/by-session/${id}`
    : `${API_BASE}/api/licenses/by-payment-intent/${id}`;
  for (let i = 0; i < attempts; i++) {
    try {
      const r = await fetch(url);
      if (r.ok) {
        const d = await r.json();
        if (d.license_key) return d.license_key;
      }
    } catch {
      // ignore network errors during polling
    }
    if (i < attempts - 1) {
      // Exponential backoff with a cap keeps quick retries early but tolerates webhook lag.
      const delayMs = Math.min(400 * (2 ** i), 5000);
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
  return null;
}

export default function CheckoutSuccessPage() {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentIntentId = params.get("payment_intent");
    const sessionId = params.get("session_id");

    if (!paymentIntentId && !sessionId) {
      setLoading(false);
      return;
    }

    const url = paymentIntentId
      ? `${API_BASE}/api/stripe/payment-intent?payment_intent=${paymentIntentId}`
      : `${API_BASE}/api/stripe/session?session_id=${sessionId}`;

    fetch(url)
      .then((res) => res.json())
      .then(async (data) => {
        const info: SessionInfo = {
          plan: data.plan || data.planName || "Unknown",
          planName: data.planName,
          email: data.email || null,
          licenseKey: null,
        };

        // Poll for the license key (webhook may take a moment)
        if (paymentIntentId) {
          info.licenseKey = await pollForLicense(paymentIntentId, "pi");
        } else if (sessionId) {
          info.licenseKey = await pollForLicense(sessionId, "session");
        }

        setSession(info);

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

  function copyKey(key: string) {
    navigator.clipboard.writeText(key).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

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

            {/* License key box */}
            {session?.licenseKey ? (
              <div className="my-5 rounded-xl bg-slate-50 border border-slate-200 p-4 text-left">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
                  Your License Key
                </p>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-base font-bold text-[#3a0ca3] tracking-widest">
                    {session.licenseKey}
                  </span>
                  <button
                    onClick={() => copyKey(session.licenseKey!)}
                    className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-[#3a0ca3] transition-colors"
                  >
                    {copied ? (
                      <><Check className="h-3.5 w-3.5 text-emerald-500" /> Copied</>
                    ) : (
                      <><Copy className="h-3.5 w-3.5" /> Copy</>
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Also sent to your email. Enter this key in your Shopify theme settings.
                </p>
              </div>
            ) : (
              <div className="my-5 rounded-xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-500">
                Your license key will arrive by email shortly.
              </div>
            )}

            {session ? (
              <p className="text-slate-500 mb-6 text-sm">
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
              <p className="text-slate-500 mb-6 text-sm">
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
