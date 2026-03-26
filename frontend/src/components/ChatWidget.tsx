"use client";

import { useState } from "react";
import { MessageCircle, X, Send, Check } from "lucide-react";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/support/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: phone.trim(), message: message.trim() }),
      });
      if (!res.ok) throw new Error("Failed");
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setOpen(false);
    if (sent) {
      setTimeout(() => { setSent(false); setName(""); setPhone(""); setMessage(""); }, 400);
    }
  }

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-20 left-4 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#3a0ca3] to-[#4f46e5] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <img src="/diamond-logo.svg" alt="Vexel" className="w-5 h-5 object-contain brightness-0 invert" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Vexel Support</p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  <span className="text-white/70 text-xs">Someone is here</span>
                </div>
              </div>
            </div>
            <button onClick={handleClose} className="text-white/70 hover:text-white transition-colors p-1">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4">
            {sent ? (
              <div className="py-6 flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Check className="h-6 w-6 text-emerald-600" />
                </div>
                <p className="font-semibold text-slate-900">Message sent!</p>
                <p className="text-slate-500 text-sm">We&apos;ll get back to you shortly.</p>
                <button onClick={handleClose} className="mt-1 text-xs text-[#3a0ca3] hover:underline">Close</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <p className="text-slate-600 text-sm">Enter your details and we&apos;ll get back to you.</p>

                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3a0ca3]/30 bg-slate-50"
                />

                <input
                  type="tel"
                  placeholder="Phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3a0ca3]/30 bg-slate-50"
                />

                <textarea
                  placeholder="How can we help you?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3a0ca3]/30 bg-slate-50 resize-none"
                />

                {error && <p className="text-red-500 text-xs">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#3a0ca3] hover:bg-[#2d0980] text-white text-sm font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                >
                  {loading ? "Sending…" : <><Send className="h-4 w-4" /> Start Chat</>}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-4 left-4 z-50 w-13 h-13 bg-[#3a0ca3] hover:bg-[#2d0980] text-white rounded-full shadow-lg shadow-[#3a0ca3]/40 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        aria-label="Chat with support"
        style={{ width: 52, height: 52 }}
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>
    </>
  );
}
