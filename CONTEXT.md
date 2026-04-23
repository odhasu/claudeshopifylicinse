# Store — Context

## What it is
Vexel — where Oscar sells his Shopify theme to other resellers. Like usekenso.com but Vexel.

**Live:** claudecodethemeshopify.vercel.app  
**Repo:** github.com/odhasu/claudeshopifylicinse  
**Owner:** Oscar (odhasu / 0xlouiss)

---

## Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js, Express 4 (`index.js`) |
| Frontend | Next.js static export — edit `frontend/src/`, build, copy to `site/` |
| Licenses | SQLite + Upstash Redis (KV) |
| Subscriptions | Supabase (`subscriptions` table) — monthly plan users |
| Tickets / KV | Upstash Redis (`KV_REST_API_URL` or `UPSTASH_REDIS_REST_URL`) |
| Hosting | Vercel — serves from `site/`, auto-deploys on push to main |

---

## Pricing

| Plan | Price | What's included |
|------|-------|-----------------|
| Lite | $179 one-time | 1 store license |
| Pro | $379 one-time | 5 store licenses |

Stripe links: not yet live (Oscar will add them).

Monthly plan via Whop: webhook at `POST /api/whop-webhook` → Supabase → KV license sync.
Lifetime upgrade upsell in dashboard (needs `NEXT_PUBLIC_WHOP_LIFETIME_URL` env var).

---

## Support
- Person: Sam
- Hours: 8AM–8PM CET, Mon–Sun

---

## What's built

**Homepage:**
- Hero + stats ($300K+ combined customer sales / 10K+ orders / 4.9★)
- 6 feature cards
- Creators marquee (influencer handles + follower counts)
- Image generator demo
- AI customizer demo
- Pricing section (Lite / Pro cards)
- FAQ
- Footer

**Other pages:**
- `/theme/docs/` — 29 articles across 6 categories
- `/theme/support/` — contact form, FAQ cards
- `/theme/account/` — customer license management
- `/admin/` — admin dashboard (licenses, tickets, downloads)

---

## Key files

| File | What |
|------|------|
| `index.js` | Express server, all routes |
| `frontend/src/app/theme/page.tsx` | Homepage |
| `frontend/src/app/theme/docs/page.tsx` | Docs page |
| `frontend/src/app/theme/support/page.tsx` | Support page |
| `frontend/src/components/ui/pricing.tsx` | Pricing cards |
| `frontend/src/components/ui/hero-section.tsx` | Hero + stats |
| `frontend/src/components/ui/vexel-logo.tsx` | Logo (black diamond, no purple) |
| `frontend/src/lib/plans.ts` | Plan data |
| `frontend/src/lib/docs-content.ts` | 29 article HTMLs |
| `dashboard/` | Admin panel |
| `src/services/supabaseService.js` | Supabase client — subscription upsert/get |
| `src/routes/whopWebhook.js` | Whop webhook handler |
| `supabase/subscriptions.sql` | Run once in Supabase SQL editor to create table |

---

## License validation flow

1. Customer visits reseller store using Vexel theme
2. Theme's `loader.js` sends license key + domain to `POST /api/validate`
3. Server checks SQLite: exists? active? domain match? expired?
4. Valid → 200 + section HTML
5. Invalid → 403 + message + footerHtml (injected by loader.js)

---

## Resellers using the theme
- omar.resells1 (Instagram) — the only confirmed one so far
- keanusvendors.com, flippavendors.com, resellersrealm.shop, piaresells.com (Kenso's customers — used as reference)

---

## Competitor
usekenso.com — full breakdown in `KENSO.md`
