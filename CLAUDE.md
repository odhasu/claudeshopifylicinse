# Vexel Store

The store where Oscar sells his Shopify theme to resellers. Like usekenso.com but for Vexel.

Live: claudecodethemeshopify.vercel.app
Repo: github.com/odhasu/claudeshopifylicinse
Owner: Oscar (odhasu / 0xlouiss is his alt account)

## How it works

- Express.js server on Vercel (serverless)
- Frontend is Next.js static export — edit source in `frontend/src/`, build it, copy `frontend/out/` to `site/`, then push
- Vercel serves from `site/` — source changes alone do nothing until you build and copy
- Vercel redeploys automatically on push to main

## Build steps (every time you edit frontend)

1. Edit files in `frontend/src/`
2. Run `npm run build` in `frontend/`
3. Copy `frontend/out/*` to `site/`
4. Git add, commit, push

## Rules

- Never store data in /tmp — use Upstash Redis
- No API routes in frontend/src/app/api/ — breaks static export
- Support person name: Sam
- Support hours: 8AM–8PM CET, Mon–Sun
- Talk plain language, no jargon
- Don't add things Oscar didn't ask for

## What's built

- Homepage: hero, stats ($300K+ / 10K+ / 4.9 rating), 6 feature cards, creators marquee, image generator demo, AI customizer demo, pricing, FAQ, footer
- Pricing: Lite $179 (1 store), Pro $379 (5 stores) — Stripe links coming later
- Docs: 29 articles across 6 categories + floating chat widget (name, phone, message)
- Support page: Sam as support person, 8AM–8PM CET, contact form, FAQ cards
- Admin dashboard: licenses, tickets, theme downloads
- License validation: theme's loader.js pings /api/validate on every page load
- Tickets: Upstash Redis (not /tmp)

## Storage

- Licenses: SQLite
- Tickets: Upstash Redis (UPSTASH_REDIS_REST_URL or KV_REST_API_URL)

## Key folders

- `frontend/src/` — React/Next.js source
- `frontend/out/` — build output
- `site/` — what Vercel serves (copy of out/)
- `dashboard/` — admin panel
- `index.js` — Express server

## Resellers using the theme

- omar.resells1 (Instagram) — more handles coming
- keanusvendors.com, flippavendors.com, resellersrealm.shop, piaresells.com — these are Kenso's customers, used as reference

## What needs work

- Docs page needs fixes
- Creators marquee: needs real reseller profiles
- Phone mockups in "Used by Biggest Names" section: need real screenshots
- Refund/terms/privacy pages: not built yet
- Purchase buttons: need Stripe links (Oscar will add)
