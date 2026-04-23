# Store — Build Status

## Done ✅

**Core infrastructure**
- Express.js backend on Vercel (serverless)
- Next.js static export pipeline (build → copy to site/ → push)
- SQLite license storage
- Upstash Redis ticket storage
- Admin dashboard (licenses, tickets, downloads, bulk create, renewal UI, expiry tab)
- License validation: `/api/validate` pinged on every theme page load
- Account page: customer license management
- Legal pages (basic)
- Supabase subscriptions table (`supabase/subscriptions.sql`) — source of truth for monthly plan users
- Whop webhook handler: `POST /api/whop-webhook` — handles membership.created / active / cancelled
- Monthly subscription → KV license sync (expires_at kept in step)
- `GET /api/customer/subscription` — returns plan/status/expiry by license key
- Account dashboard: subscription section + lifetime upsell card (monthly users only)
- Supabase MCP connected to Claude Code (`~/.claude/mcp.json`) for direct DB access

**Frontend pages**
- Homepage: hero, stats ($300K+ / 10K+ / 4.9★), 6 feature cards, creators marquee, image generator demo, AI customizer demo, pricing (Lite $179 / Pro $379), FAQ, footer
- Docs: 29 articles across 6 categories + floating chat widget
- Support: Sam, contact form, FAQ cards (8AM–8PM CET)

---

## In progress 🔧
- Mobile layout fixes — scoped and ready, dedicated session prepared (Apr 21)
- Whop webhook system built — needs Oscar to: run `supabase/subscriptions.sql`, add env vars in Vercel (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, WHOP_WEBHOOK_SECRET, NEXT_PUBLIC_WHOP_LIFETIME_URL), regenerate Supabase access token

---

## Todo 🔲

**Must do**
- Mobile layout — full audit and fix (next session)
- Fix ~3s lag/freeze on every click (undiagnosed)
- Docs page — needs fixes (reported broken)

**Needs content from Oscar**
- Stripe payment links (Lite + Pro)
- Real reseller profiles for creators marquee (only omar.resells1 so far)
- Real phone mockup screenshots for "Used by Biggest Names" section

**Nice to have**
- Refund / terms / privacy pages (not built)

---

## Last worked on

**Apr 23 2026** — Session work:
- Built Whop → webhook → Supabase → dashboard monthly subscription system
- New: `src/services/supabaseService.js`, `src/routes/whopWebhook.js`, `supabase/subscriptions.sql`
- Modified: `index.js`, `src/routes/customer.js`, `frontend/.../account/page.tsx`
- Account dashboard now shows subscription section (plan, status, expiry, stores) + lifetime upsell for monthly users
- Installed `@supabase/supabase-js` in backend
- Configured Supabase MCP in `~/.claude/mcp.json` — Claude can now query DB directly after restart
- Pending Oscar: run `supabase/subscriptions.sql` in Supabase, add env vars in Vercel, regenerate Supabase token

**Apr 21 2026** — Session work:
- Reorganized all .md files (rewrote README.md + frontend/README.md, deleted redundant agents.md, updated skills.md)
- Built full agent memory system: CONTEXT.md, BUILD.md, BUGS.md, RULES.md, AGENT.md, GOALS.md
- Trimmed CLAUDE.md — removed all duplicate content, now just an entry point to the 6 memory files
- Scoped next session: mobile layout full audit + fix, reference usekenso.com, design open to changes, copy stays as-is
- Configured `~/.claude/settings.json`: disabled Co-Authored-By in commits/PRs, set acceptEdits mode (no edit diff prompts)
- No code changes this session
