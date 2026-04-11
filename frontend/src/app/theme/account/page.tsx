"use client";

import { useState, useEffect } from "react";
import {
  BookOpen, MessageCircle, Download, ExternalLink, CheckCircle, Package,
  RefreshCw, User, ShoppingBag, AlertTriangle, X, ArrowRight, LogOut,
  Copy, Check, Eye, EyeOff, Trash2, KeyRound,
} from "lucide-react";
import Link from "next/link";
import { Particles } from "@/components/ui/particles";
import { UPDATES, QUICK_LINKS } from "@/lib/account-data";

interface AccountLicense {
  key: string;
  plan?: string;
  active: boolean;
  created_at: string | null;
  last_verified_at: string | null;
  permanent_domain?: string | null;
  domain?: string | null;
}

function formatDate(iso: string | null): string {
  if (!iso) return "Never";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-[#3a0ca3] transition-colors"
    >
      {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied" : label}
    </button>
  );
}

function LoginGate({ onLogin }: { onLogin: (licenseData: AccountLicense) => void }) {
  const [licenseKey, setLicenseKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseKey })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to login");
      
      localStorage.setItem("vexel_license_key", licenseKey);
      onLogin(data.license);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 flex items-center justify-center px-4">
      <Particles color="#3a0ca3" quantity={120} ease={20} className="absolute inset-0" />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[700px] -translate-y-1/3 rounded-full bg-[radial-gradient(ellipse,#c7d2fe55_0%,transparent_70%)]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[500px] translate-y-1/3 rounded-full bg-[radial-gradient(ellipse,#ede9fe44_0%,transparent_70%)]" />
      </div>
      <div className="relative z-10 w-full max-w-sm">
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-xl shadow-xl shadow-slate-900/5 p-8 space-y-6">
          <div className="flex items-center gap-2.5">
            <span className="text-lg font-bold text-slate-900 tracking-tight">Vexel Themes</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Access your license</h1>
            <p className="text-sm text-slate-500">Enter your license key to download the theme and get support.</p>
          </div>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 block">License Key</label>
              <input
                type="text" value={licenseKey} onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3a0ca3]/30 focus:border-[#3a0ca3] transition-colors font-mono"
                required
              />
            </div>
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-xs text-red-700 font-medium">{error}</p>
              </div>
            )}
            <button
              type="submit" disabled={loading}
              className="w-full h-11 rounded-lg bg-[#3a0ca3] text-white text-sm font-semibold hover:bg-[#2d0980] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-[#3a0ca3]/20"
            >
              {loading ? "Verifying…" : "Access Dashboard"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const [license, setLicense] = useState<AccountLicense | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedKey = localStorage.getItem("vexel_license_key");
    if (savedKey) {
      fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseKey: savedKey })
      })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setLicense(data.license);
        } else {
          localStorage.removeItem("vexel_license_key");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    } else {
      setTimeout(() => setLoading(false), 0);
    }
  }, []);

  function handleSignOut() {
    localStorage.removeItem("vexel_license_key");
    setLicense(null);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading…</p>
      </main>
    );
  }

  if (!license) return <LoginGate onLogin={setLicense} />;

  const plan = license.plan || "Standard";

  return (
    <main className="min-h-screen bg-slate-50 pt-20 pb-16 px-4">
      <div className="mx-auto max-w-4xl space-y-5">

        {/* Profile card */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 rounded-lg">
              <User className="h-5 w-5 text-[#3a0ca3]" />
            </div>
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">License Account</h2>
          </div>
          <div className="flex items-center gap-5">
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-slate-900 truncate font-mono">{license.key}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Vexel {plan} customer
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="shrink-0 px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:border-red-300 hover:text-red-600 transition-colors flex items-center gap-2"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* License Box */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 rounded-lg">
              <ShoppingBag className="h-5 w-5 text-[#3a0ca3]" />
            </div>
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">My License</h2>
          </div>
          
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">
                  Vexel {plan} Theme
                </span>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                license.active
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-slate-100 border-slate-200 text-slate-500"
              }`}>
                {license.active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                )}
                {license.active ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-start justify-between gap-2">
                <span className="text-slate-400 shrink-0 text-xs">License Key</span>
                <span className="flex items-center gap-2 font-mono text-xs text-slate-700 text-right break-all">
                  {license.key}
                  <CopyButton value={license.key} />
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-xs">Created At</span>
                <span className="text-xs">{formatDate(license.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-xs">Last Verified</span>
                <span className="text-xs">{formatDate(license.last_verified_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-xs">Active Store Domain</span>
                <span className="text-xs font-mono">{license.permanent_domain || license.domain}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status summary */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg">
              <Package className="h-5 w-5 text-[#3a0ca3]" />
            </div>
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">License Status</h2>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Updates</span>
              <span className="inline-flex items-center gap-1 text-[#3a0ca3] font-medium">
                <CheckCircle className="h-3.5 w-3.5" />
                Lifetime
              </span>
            </div>
            <div className="space-y-3 mt-4">
              {/* V2 — coming soon */}
              <div className="flex items-center justify-between rounded-xl border border-[#3a0ca3]/20 bg-[#3a0ca3]/5 px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-slate-900">Vexel V2 <span className="ml-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">Coming Soon</span></p>
                  <p className="text-xs text-slate-400 mt-0.5">Image protection, 3D cards, new sections & more</p>
                </div>
                <button disabled className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed">
                  <Download className="h-3.5 w-3.5" /> Download
                </button>
              </div>
              {/* V1 — available */}
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Vexel V1 <span className="ml-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-500">Legacy</span></p>
                  <p className="text-xs text-slate-400 mt-0.5">Current stable release</p>
                </div>
                <a href="/theme-v1.zip" download className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3a0ca3] text-white text-xs font-semibold hover:bg-[#2d0980] transition-colors shadow shadow-[#3a0ca3]/20">
                  <Download className="h-3.5 w-3.5" /> Download
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}

