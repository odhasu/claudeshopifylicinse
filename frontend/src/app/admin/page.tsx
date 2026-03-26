"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Inbox, Key, LogOut, RefreshCw, Plus, Trash2, CheckCircle,
  Clock, XCircle, ChevronDown, ChevronRight, Send, Eye,
  LayoutDashboard, Copy, Check, AlertCircle
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type TicketStatus = "open" | "in-progress" | "closed";

interface Reply { id: number; message: string; sent_at: string; }
interface Ticket {
  id: number; name: string; email: string; message: string;
  status: TicketStatus; read: boolean; replies: Reply[];
  created_at: string; updated_at: string;
}
interface License {
  id: number; license_key: string; domain: string; store_name: string;
  plan: string; active: number | boolean; created_at: string;
  last_verified_at: string | null; request_count: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string | null) {
  if (!iso) return "Never";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function StatusBadge({ status }: { status: TicketStatus }) {
  const map: Record<TicketStatus, { label: string; cls: string; icon: React.ElementType }> = {
    open:        { label: "Open",        cls: "bg-blue-50 text-blue-700 border-blue-200",   icon: AlertCircle },
    "in-progress": { label: "In Progress", cls: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
    closed:      { label: "Closed",      cls: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle },
  };
  const { label, cls, icon: Icon } = map[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      <Icon size={11} /> {label}
    </span>
  );
}

function CopyBtn({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={async () => { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="ml-1 text-slate-400 hover:text-slate-700 transition-colors">
      {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
    </button>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: (key: string) => void }) {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/admin/stats", {
        headers: { "X-Admin-Key": key.trim() },
      });
      if (res.status === 401) throw new Error("Invalid admin key");
      if (!res.ok) throw new Error("Server error");
      sessionStorage.setItem("vx_admin_key", key.trim());
      onLogin(key.trim());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3a0ca3] mb-4">
            <LayoutDashboard size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Panel</h1>
          <p className="text-sm text-slate-500 mt-1">Vexel Themes</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Admin Key</label>
            <input
              type="password"
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="Enter admin key"
              required
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3a0ca3] focus:border-transparent"
            />
          </div>
          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3a0ca3] hover:bg-[#2d0980] text-white text-sm font-semibold rounded-lg py-2.5 transition-colors disabled:opacity-50"
          >
            {loading ? "Checking…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Tickets Tab ──────────────────────────────────────────────────────────────

function TicketsTab({ adminKey }: { adminKey: string }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [replyText, setReplyText] = useState<Record<number, string>>({});
  const [sending, setSending] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | TicketStatus>("all");

  const headers = { "X-Admin-Key": adminKey };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tickets", { headers });
      const data = await res.json();
      setTickets(data.tickets || []);
      setUnread(data.unread || 0);
    } finally { setLoading(false); }
  }, [adminKey]);

  useEffect(() => { load(); }, [load]);

  async function markRead(id: number) {
    await fetch(`/api/admin/tickets/${id}`, {
      method: "PUT", headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ read: true }),
    });
    setTickets(ts => ts.map(t => t.id === id ? { ...t, read: true } : t));
    setUnread(u => Math.max(0, u - 1));
  }

  async function setStatus(id: number, status: TicketStatus) {
    await fetch(`/api/admin/tickets/${id}`, {
      method: "PUT", headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setTickets(ts => ts.map(t => t.id === id ? { ...t, status } : t));
  }

  async function sendReply(ticket: Ticket) {
    const msg = replyText[ticket.id]?.trim();
    if (!msg) return;
    setSending(ticket.id);
    try {
      const res = await fetch(`/api/admin/tickets/${ticket.id}/reply`, {
        method: "POST", headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      setTickets(ts => ts.map(t => t.id === ticket.id
        ? { ...t, replies: [...t.replies, data.reply], status: t.status === "open" ? "in-progress" : t.status }
        : t
      ));
      setReplyText(r => ({ ...r, [ticket.id]: "" }));
      // Open email client to actually send the reply
      const subject = encodeURIComponent("Re: Your Vexel Support Request");
      const body = encodeURIComponent(`Hi ${ticket.name},\n\n${msg}\n\n— Vexel Support`);
      window.open(`mailto:${ticket.email}?subject=${subject}&body=${body}`);
    } finally { setSending(null); }
  }

  const filtered = filter === "all" ? tickets : tickets.filter(t => t.status === filter);

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-slate-400">
      <RefreshCw size={20} className="animate-spin mr-2" /> Loading tickets…
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Support Tickets</h2>
          <p className="text-sm text-slate-500 mt-0.5">{tickets.length} total · {unread} unread</p>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {(["all", "open", "in-progress", "closed"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize ${
              filter === f ? "bg-[#3a0ca3] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {f === "all" ? `All (${tickets.length})` : f === "open" ? `Open (${tickets.filter(t => t.status === "open").length})` : f === "in-progress" ? `In Progress (${tickets.filter(t => t.status === "in-progress").length})` : `Closed (${tickets.filter(t => t.status === "closed").length})`}
          </button>
        ))}
      </div>

      {/* Ticket list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Inbox size={36} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">No tickets {filter !== "all" && `with status "${filter}"`}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(ticket => (
            <div key={ticket.id} className={`rounded-xl border transition-all ${ticket.read ? "border-slate-200 bg-white" : "border-[#3a0ca3]/20 bg-indigo-50/30"}`}>
              {/* Ticket row */}
              <button
                className="w-full flex items-center gap-3 px-5 py-4 text-left"
                onClick={() => {
                  setExpanded(expanded === ticket.id ? null : ticket.id);
                  if (!ticket.read) markRead(ticket.id);
                }}
              >
                {/* Unread dot */}
                <div className={`h-2 w-2 rounded-full flex-shrink-0 ${ticket.read ? "bg-transparent" : "bg-[#3a0ca3]"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-slate-900">{ticket.name}</span>
                    <span className="text-xs text-slate-400">{ticket.email}</span>
                    {ticket.replies.length > 0 && (
                      <span className="text-xs text-slate-400">· {ticket.replies.length} {ticket.replies.length === 1 ? "reply" : "replies"}</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 truncate mt-0.5">{ticket.message}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <StatusBadge status={ticket.status} />
                  <span className="text-xs text-slate-400 hidden sm:block">{fmtDate(ticket.created_at)}</span>
                  {expanded === ticket.id ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
                </div>
              </button>

              {/* Expanded view */}
              {expanded === ticket.id && (
                <div className="border-t border-slate-100 px-5 py-5 space-y-5">
                  {/* Customer info */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">From</p>
                      <p className="font-medium text-slate-800">{ticket.name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Email</p>
                      <p className="font-medium text-slate-800 flex items-center gap-1">
                        <a href={`mailto:${ticket.email}`} className="text-[#3a0ca3] hover:underline">{ticket.email}</a>
                        <CopyBtn value={ticket.email} />
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Submitted</p>
                      <p className="font-medium text-slate-800">{fmtDate(ticket.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Status</p>
                      <select
                        value={ticket.status}
                        onChange={e => setStatus(ticket.id, e.target.value as TicketStatus)}
                        className="text-xs font-semibold border border-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#3a0ca3]"
                      >
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>

                  {/* Original message */}
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Message</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{ticket.message}</p>
                  </div>

                  {/* Previous replies */}
                  {ticket.replies.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Previous Replies</p>
                      {ticket.replies.map(r => (
                        <div key={r.id} className="rounded-xl bg-indigo-50 border border-indigo-100 p-4">
                          <p className="text-xs text-slate-400 mb-2">{fmtDate(r.sent_at)}</p>
                          <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{r.message}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply box */}
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Reply to {ticket.name}</p>
                    <textarea
                      rows={4}
                      value={replyText[ticket.id] || ""}
                      onChange={e => setReplyText(r => ({ ...r, [ticket.id]: e.target.value }))}
                      placeholder={`Write your reply to ${ticket.name}…`}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3a0ca3] focus:border-transparent resize-none"
                    />
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-slate-400">Saves reply + opens your email client to send</p>
                      <button
                        onClick={() => sendReply(ticket)}
                        disabled={!replyText[ticket.id]?.trim() || sending === ticket.id}
                        className="inline-flex items-center gap-1.5 bg-[#3a0ca3] hover:bg-[#2d0980] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-40"
                      >
                        <Send size={13} />
                        {sending === ticket.id ? "Sending…" : "Send Reply"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Licenses Tab ─────────────────────────────────────────────────────────────

function LicensesTab({ adminKey }: { adminKey: string }) {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ domain: "", store_name: "", plan: "lite", username: "" });
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "revoked">("all");
  const [planFilter, setPlanFilter] = useState<"all" | string>("all");

  const headers = { "X-Admin-Key": adminKey };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/licenses", { headers });
      const data = await res.json();
      setLicenses(data.licenses || []);
    } finally { setLoading(false); }
  }, [adminKey]);

  useEffect(() => { load(); }, [load]);

  async function createLicense(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true); setNewKey(null);
    try {
      const res = await fetch("/api/admin/licenses", {
        method: "POST", headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setNewKey(data.license_key);
      setForm({ domain: "", store_name: "", plan: "lite", username: "" });
      await load();
    } finally { setCreating(false); }
  }

  async function revoke(key: string) {
    if (!confirm(`Revoke license ${key}?`)) return;
    setRevoking(key);
    try {
      await fetch(`/api/admin/licenses/${key}`, { method: "DELETE", headers });
      setLicenses(ls => ls.map(l => l.license_key === key ? { ...l, active: 0 } : l));
    } finally { setRevoking(null); }
  }

  // Filter and search licenses
  const filteredLicenses = licenses.filter(license => {
    // Status filter
    if (statusFilter === "active" && !license.active) return false;
    if (statusFilter === "revoked" && license.active) return false;

    // Plan filter
    if (planFilter !== "all" && license.plan !== planFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesKey = license.license_key.toLowerCase().includes(query);
      const matchesDomain = license.domain?.toLowerCase().includes(query);
      const matchesCustomer = license.username?.toLowerCase().includes(query);
      const matchesStore = license.store_name?.toLowerCase().includes(query);
      if (!matchesKey && !matchesDomain && !matchesCustomer && !matchesStore) return false;
    }

    return true;
  });

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-slate-400">
      <RefreshCw size={20} className="animate-spin mr-2" /> Loading licenses…
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Licenses</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {licenses.filter(l => l.active).length} active · {licenses.length} total
          </p>
        </div>
        <button
          onClick={() => { setShowCreate(!showCreate); setNewKey(null); }}
          className="inline-flex items-center gap-1.5 bg-[#3a0ca3] hover:bg-[#2d0980] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={14} /> New License
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 mb-6">
          <h3 className="font-semibold text-slate-800 mb-4 text-sm">Create New License</h3>
          {newKey && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle size={15} className="text-green-600 flex-shrink-0" />
              <p className="text-sm font-medium text-green-800 font-mono break-all">{newKey}</p>
              <CopyBtn value={newKey} />
            </div>
          )}
          <form onSubmit={createLicense} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Domain *</label>
              <input required value={form.domain} onChange={e => setForm(f => ({ ...f, domain: e.target.value }))}
                placeholder="mystore.myshopify.com" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3a0ca3]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Customer Name</label>
              <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                placeholder="John Doe" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3a0ca3]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Store Name</label>
              <input value={form.store_name} onChange={e => setForm(f => ({ ...f, store_name: e.target.value }))}
                placeholder="My Cool Store" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3a0ca3]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Plan</label>
              <select value={form.plan} onChange={e => setForm(f => ({ ...f, plan: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3a0ca3]">
                <option value="lite">Lite</option>
                <option value="pro">Pro</option>
                <option value="unlimited">Unlimited</option>
              </select>
            </div>
            <div className="sm:col-span-2 flex justify-end gap-2">
              <button type="button" onClick={() => setShowCreate(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={creating}
                className="inline-flex items-center gap-1.5 bg-[#3a0ca3] hover:bg-[#2d0980] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
                <Plus size={14} /> {creating ? "Creating…" : "Create License"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and filters */}
      <div className="mb-6 space-y-4">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by license key, domain, customer, or store…"
          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3a0ca3] focus:border-transparent"
        />
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex gap-2">
            {(["all", "active", "revoked"] as const).map(s => {
              const counts = {
                all: licenses.length,
                active: licenses.filter(l => l.active).length,
                revoked: licenses.filter(l => !l.active).length,
              };
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize ${
                    statusFilter === s ? "bg-[#3a0ca3] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {s} ({counts[s]})
                </button>
              );
            })}
          </div>
          <select
            value={planFilter}
            onChange={e => setPlanFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3a0ca3] focus:border-transparent"
          >
            <option value="all">All Plans</option>
            <option value="lite">Lite</option>
            <option value="pro">Pro</option>
            <option value="unlimited">Unlimited</option>
          </select>
          {(searchQuery || statusFilter !== "all" || planFilter !== "all") && (
            <p className="text-xs text-slate-500 ml-auto ml-2">
              Showing {filteredLicenses.length} of {licenses.length} licenses
            </p>
          )}
        </div>
      </div>

      {/* License table */}
      <div className="rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">License Key</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Domain</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Plan</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Created</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Requests</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLicenses.map(license => (
                <tr key={license.id} className={`hover:bg-slate-50 transition-colors ${!license.active ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-slate-700 flex items-center gap-1">
                      {license.license_key.length > 20
                        ? license.license_key.slice(0, 9) + "…"
                        : license.license_key}
                      <CopyBtn value={license.license_key} />
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700 text-xs">{license.domain || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                      license.plan === "pro" || license.plan === "unlimited"
                        ? "bg-purple-50 text-purple-700 border border-purple-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}>{license.plan}</span>
                  </td>
                  <td className="px-4 py-3">
                    {license.active
                      ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700"><span className="h-1.5 w-1.5 rounded-full bg-green-500" />Active</span>
                      : <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400"><span className="h-1.5 w-1.5 rounded-full bg-slate-400" />Revoked</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{fmtDate(license.created_at)}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{license.request_count || 0}</td>
                  <td className="px-4 py-3">
                    {license.license_key !== "og" && license.active ? (
                      <button
                        onClick={() => revoke(license.license_key)}
                        disabled={revoking === license.license_key}
                        className="text-red-400 hover:text-red-600 transition-colors"
                        title="Revoke license"
                      >
                        {revoking === license.license_key
                          ? <RefreshCw size={14} className="animate-spin" />
                          : <Trash2 size={14} />}
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
              {filteredLicenses.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400 text-sm">
                    {searchQuery || statusFilter !== "all" || planFilter !== "all"
                      ? "No licenses match your filters"
                      : "No licenses yet"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────

type Tab = "tickets" | "licenses";

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("tickets");
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const saved = sessionStorage.getItem("vx_admin_key");
    if (saved) setAdminKey(saved);
  }, []);

  // Poll unread count
  useEffect(() => {
    if (!adminKey) return;
    const poll = async () => {
      try {
        const res = await fetch("/api/admin/tickets/unread-count", { headers: { "X-Admin-Key": adminKey } });
        if (res.ok) { const d = await res.json(); setUnread(d.unread || 0); }
      } catch {}
    };
    poll();
    const id = setInterval(poll, 30000);
    return () => clearInterval(id);
  }, [adminKey]);

  function logout() {
    sessionStorage.removeItem("vx_admin_key");
    setAdminKey(null);
  }

  if (!adminKey) return <LoginScreen onLogin={setAdminKey} />;

  const NAV: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "tickets", label: "Tickets", icon: Inbox },
    { id: "licenses", label: "Licenses", icon: Key },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#3a0ca3] flex items-center justify-center">
              <LayoutDashboard size={15} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Vexel</p>
              <p className="text-xs text-slate-400">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === id
                  ? "bg-[#3a0ca3] text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon size={16} />
              {label}
              {id === "tickets" && unread > 0 && (
                <span className={`ml-auto text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center ${
                  activeTab === "tickets" ? "bg-white/20 text-white" : "bg-[#3a0ca3] text-white"
                }`}>
                  {unread}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-slate-200">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-8 py-8">
          {activeTab === "tickets" && <TicketsTab adminKey={adminKey} />}
          {activeTab === "licenses" && <LicensesTab adminKey={adminKey} />}
        </div>
      </main>
    </div>
  );
}
