# OGResell Licensing Server — Project Context

This is the backend server for ogresells.com. Read this file every session before touching anything.

## What this repo is

An Express.js backend that powers the OGResell licensing system. When a customer visits ogresells.com, the Shopify theme's loader.js pings this server to validate their license. The server also runs an admin dashboard for Oscar and handles support tickets.

**Deployed on:** Vercel (serverless)
**Paired theme repo:** github.com/odhasu/claudecodethemeshopify

## Rules — always follow these

- After every file change: git add → git commit → git push (Vercel redeploys automatically on push)
- Never store persistent data in /tmp — it doesn't survive across Vercel serverless instances
- All persistent data goes through Upstash Redis (tickets) or SQLite (licenses)
- The frontend is a Next.js static export — no API routes can exist inside frontend/src/app/api/

## Architecture

```
index.js                  → Main Express server (license validation, admin API, ticket API)
src/                      → Server source files
dashboard/                → Admin dashboard HTML/JS (served as static files)
frontend/                 → Next.js static export (public-facing pages: pricing, docs, etc.)
  src/app/theme/          → Pages accessible at /theme/* (docs, pricing, support)
  src/components/         → React components
  src/lib/                → Data files (plans, docs content)
site/                     → Built frontend output (auto-generated, don't edit manually)
```

## Key endpoints

| Endpoint | What it does |
|----------|--------------|
| POST /api/validate | Validates a license key — called by loader.js on every page load |
| GET /api/admin/licenses | Lists all licenses (admin only) |
| POST /api/support/ticket | Creates a support ticket |
| GET /api/admin/tickets | Lists all support tickets (admin only) |
| GET /dashboard | Admin dashboard UI |

## Storage

### Licenses — SQLite
Stored in a SQLite database. Managed through the admin dashboard. Fields: license key, customer email, domain, plan (Lite/Pro), expiry, status.

### Support Tickets — Upstash Redis
Tickets are stored in Upstash Redis so they persist across Vercel serverless restarts. The env var is checked in two ways:
```
UPSTASH_REDIS_REST_URL  (set by Vercel marketplace)
KV_REST_API_URL         (alternative naming)
```
Both are checked — whichever is set gets used.

### Why not /tmp?
Vercel serverless functions can spin up multiple instances. Data saved to /tmp on one instance isn't visible on another. That's why tickets were getting lost — fixed by switching to Upstash Redis.

## Frontend (Next.js static export)

The frontend is built as a static site (`output: "export"` in next.config.js). This means:
- No server-side rendering
- No API routes inside frontend/src/app/api/ — these will break the build
- All data is either hardcoded in lib/ files or fetched client-side

**Key pages:**
- /theme/docs → Docs page with 29 articles + chat widget
- /theme/pricing → Pricing cards (Lite + Pro)
- /theme/support → Support page

**Key components:**
- ChatWidget.tsx → Floating support chat, bottom-left, submits to /api/support/ticket
- pricing.tsx → Lite and Pro pricing cards

**Key data files:**
- lib/plans.ts → Plan names, prices, features, button text
- lib/docs-content.ts → All 29 article HTML contents

## Changelog

### March 15 2026
- Added Upstash Redis for persistent ticket storage (fixed lost tickets bug)
- Updated 403 handler — now sends footerHtml in response for loader.js to inject
- Added ChatWidget component to docs page
- Fixed static export breaking due to API route in frontend/src/app/api/

### March 10 2026
- Built admin dashboard (licenses, tickets, theme downloads)
- Built support ticket system
- Added frontend with pricing and docs pages
- Deployed to Vercel

## Environment variables (set in Vercel dashboard)

| Variable | What it is |
|----------|------------|
| ADMIN_KEY | Secret key to access admin dashboard |
| UPSTASH_REDIS_REST_URL | Upstash Redis URL for ticket storage |
| UPSTASH_REDIS_REST_TOKEN | Upstash Redis auth token |
| PORT | Server port (default 3000, set by Vercel automatically) |

## Still to do
- Support page redesign (match Kenso support page style)
- Reseller management section in admin dashboard
- Changelog/updates page for customers
