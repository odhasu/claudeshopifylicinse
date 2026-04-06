# OGResell Server — Skills & How-Tos

Reference for working on this server. What each part does and how to work on it correctly.

## How to add a new API endpoint

1. Open `index.js`
2. Add your route — `app.get('/api/your-route', async (req, res) => { ... })`
3. If it needs admin access, check the ADMIN_KEY header first
4. If it needs persistent storage, use Upstash Redis — not /tmp, not in-memory variables
5. Push to GitHub — Vercel redeploys automatically

## How to work with Upstash Redis

The server uses Upstash Redis via REST API (no npm package needed — just fetch).

```javascript
// Read tickets
const raw = await upstashCmd(['GET', 'vexel_tickets']);
const tickets = raw ? JSON.parse(raw) : [];

// Save tickets
await upstashCmd(['SET', 'vexel_tickets', JSON.stringify(tickets)]);
```

The `upstashCmd` function is already defined in index.js. Use it for any data that needs to survive server restarts.

## How to update the frontend (pricing, docs, etc.)

The frontend is a Next.js static export inside `frontend/`.

1. Edit files in `frontend/src/`
2. Data files are in `frontend/src/lib/` — edit plans.ts for pricing, docs-content.ts for articles
3. Components are in `frontend/src/components/`
4. **Never add files to `frontend/src/app/api/`** — API routes break the static export
5. Push to GitHub — Vercel rebuilds the frontend automatically

## How the license validation works

When loader.js on the theme calls `/api/validate`:

1. Server receives the license key + domain
2. Looks up the key in SQLite database
3. Checks: does it exist? is it active? does the domain match? is it expired?
4. **Valid** → returns 200 with section HTML and settings
5. **Invalid** → returns 403 with `{ message: "...", footerHtml: "..." }`

The `footerHtml` in the 403 response gets injected into the page footer by loader.js so the page doesn't look completely broken.

## How to access the admin dashboard

URL: your-vercel-url.vercel.app/dashboard

Requires the ADMIN_KEY set in Vercel environment variables. Use it to:
- View and manage all licenses
- See support tickets
- Download theme packages for customers

## Key files

| File | What it does |
|------|--------------|
| index.js | Main server — all routes, license validation, Redis integration |
| src/ | Source modules |
| dashboard/ | Admin dashboard static files |
| frontend/src/lib/plans.ts | Pricing plan data (names, prices, features) |
| frontend/src/lib/docs-content.ts | All 29 article HTML contents |
| frontend/src/components/ChatWidget.tsx | Floating support chat component |
| frontend/src/components/ui/pricing.tsx | Pricing cards (Lite + Pro) |

## After every change

```
git add .
git commit -m "short description of what changed"
git push
```

Vercel detects the push and redeploys. Usually live within 60 seconds.
