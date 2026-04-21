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

**Frontend pages**
- Homepage: hero, stats ($300K+ / 10K+ / 4.9★), 6 feature cards, creators marquee, image generator demo, AI customizer demo, pricing (Lite $179 / Pro $379), FAQ, footer
- Docs: 29 articles across 6 categories + floating chat widget
- Support: Sam, contact form, FAQ cards (8AM–8PM CET)

---

## In progress 🔧
- Mobile layout fixes — scoped and ready, dedicated session prepared (Apr 21)

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

**Apr 21 2026** — Session work:
- Reorganized all .md files (rewrote README.md + frontend/README.md, deleted redundant agents.md, updated skills.md)
- Built full agent memory system: CONTEXT.md, BUILD.md, BUGS.md, RULES.md, AGENT.md, GOALS.md
- Scoped next session: mobile layout full audit + fix, reference usekenso.com, design open to changes, copy stays as-is
- No code changes this session
