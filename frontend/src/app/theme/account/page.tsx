"use client";

import { useState, useEffect } from "react";
import {
  BookOpen, MessageCircle, Download, ExternalLink, CheckCircle, Package,
  User, LogOut, Copy, Check, KeyRound, Zap, ChevronRight, Loader2,
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
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-[#3a0ca3] transition-colors ml-2"
    >
      {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied" : "Copy"}
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
        body: JSON.stringify({ licenseKey: licenseKey.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid license key");
      localStorage.setItem("vexel_license_key", licenseKey.trim());
      onLogin(data.license);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 flex items-center justify-center px-4">
      <Particles color="#3a0ca3" quantity={80} ease={20} className="absolute inset-0" />
      <div className="relative z-10 w-full max-w-sm">
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-xl p-8 space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#3a0ca3]/10 flex items-center justify-center">
                <KeyRound className="h-4 w-4 text-[#3a0ca3]" />
              </div>
              <span className="text-sm font-bold text-slate-900">Vexel Themes</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Your license portal</h1>
            <p className="text-sm text-slate-500">Enter your license key to access downloads and support.</p>
          </div>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 block">License Key</label>
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-3 text-sm text-slate-800 bg-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#3a0ca3]/30 focus:border-[#3a0ca3] transition-colors font-mono tracking-wider"
                required
              />
            </div>
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                <p className="text-xs text-red-700 font-medium">{error}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={loading || !licenseKey.trim()}
              className="w-full h-11 rounded-xl bg-[#3a0ca3] text-white text-sm font-semibold hover:bg-[#2d0980] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-lg shadow-[#3a0ca3]/20"
            >
              {loading ? "Verifying…" : "Access Dashboard"}
            </button>
          </form>
          <p className="text-center text-xs text-slate-400">
            Need help?{" "}
            <Link href="/theme/support" className="text-[#3a0ca3] font-medium hover:underline">
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const [license, setLicense] = useState<AccountLicense | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  async function handleDownloadV1() {
    const key = localStorage.getItem("vexel_license_key");
    if (!key) return;
    setDownloading(true);
    try {
      const res = await fetch("/api/customer/download", {
        headers: { "X-License-Key": key },
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "vexel-v1.zip";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Download failed. Please contact support.");
    } finally {
      setDownloading(false);
    }
  }

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
          if (data.success) setLicense(data.license);
          else localStorage.removeItem("vexel_license_key");
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  function handleSignOut() {
    localStorage.removeItem("vexel_license_key");
    setLicense(null);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <div className="w-4 h-4 border-2 border-[#3a0ca3]/30 border-t-[#3a0ca3] rounded-full animate-spin" />
          Loading…
        </div>
      </main>
    );
  }

  if (!license) return <LoginGate onLogin={setLicense} />;

  const plan = license.plan ? license.plan.charAt(0).toUpperCase() + license.plan.slice(1) : "Standard";

  return (
    <main className="min-h-screen bg-slate-50 pt-20 pb-16 px-4">
      <div className="mx-auto max-w-3xl space-y-4">

        {/* Header row */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-900">My Account</h1>
            <p className="text-xs text-slate-400 mt-0.5">Vexel {plan} · License portal</p>
          </div>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-red-500 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                href={link.href}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:border-[#3a0ca3]/30 hover:text-[#3a0ca3] transition-colors shadow-sm"
              >
                <Icon className="h-4 w-4 shrink-0" />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* License card */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-[#3a0ca3]" />
              <h2 className="text-sm font-bold text-slate-700">License</h2>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
              license.active
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-slate-100 border-slate-200 text-slate-500"
            }`}>
              {license.active && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
              {license.active ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 border border-slate-200 px-3.5 py-2.5">
              <span className="text-xs text-slate-400">Key</span>
              <div className="flex items-center">
                <span className="text-xs font-mono text-slate-800">{license.key}</span>
                <CopyButton value={license.key} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5 space-y-0.5">
                <p className="text-slate-400">Plan</p>
                <p className="font-semibold text-slate-800">{plan}</p>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5 space-y-0.5">
                <p className="text-slate-400">Activated</p>
                <p className="font-semibold text-slate-800">{formatDate(license.created_at)}</p>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5 space-y-0.5">
                <p className="text-slate-400">Updates</p>
                <p className="font-semibold text-emerald-600 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Lifetime</p>
              </div>
            </div>
          </div>
        </div>

        {/* Downloads */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-4 w-4 text-[#3a0ca3]" />
            <h2 className="text-sm font-bold text-slate-700">Downloads</h2>
          </div>
          <div className="space-y-2">
            {/* V2 */}
            <div className="flex items-center justify-between rounded-xl border border-[#3a0ca3]/20 bg-[#3a0ca3]/5 px-4 py-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-900">Vexel V2</p>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">Coming Soon</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Content protection · 3D cards · Premium fonts</p>
              </div>
              <button disabled className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed">
                <Download className="h-3.5 w-3.5" /> Download
              </button>
            </div>
            {/* V1 */}
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-700">Vexel V1</p>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-500">Stable</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Current release · Full feature set</p>
              </div>
              <button
                onClick={handleDownloadV1}
                disabled={downloading}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#3a0ca3] text-white text-xs font-semibold hover:bg-[#2d0980] transition-colors shadow shadow-[#3a0ca3]/20 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {downloading
                  ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Downloading…</>
                  : <><Download className="h-3.5 w-3.5" /> Download</>
                }
              </button>
            </div>
          </div>
        </div>

        {/* Changelog */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-4 w-4 text-[#3a0ca3]" />
            <h2 className="text-sm font-bold text-slate-700">Recent Updates</h2>
          </div>
          <div className="space-y-4">
            {UPDATES.map((update) => (
              <div key={update.version} className="flex gap-3">
                <div className="shrink-0 pt-0.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#3a0ca3]/10 text-[#3a0ca3] text-[10px] font-bold font-mono">
                    {update.version}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">{update.date}</p>
                  <ul className="space-y-1">
                    {update.notes.map((note, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                        <ChevronRight className="h-3 w-3 shrink-0 mt-0.5 text-slate-300" />
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
