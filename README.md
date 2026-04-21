# Vexel Store

Where Oscar sells the Vexel Shopify theme to resellers.

Live: claudecodethemeshopify.vercel.app  
Repo: github.com/odhasu/claudeshopifylicinse

---

## How it works

- **Backend:** Express.js server (`index.js`) deployed as Vercel serverless functions
- **Frontend:** Next.js static export — source in `frontend/src/`, built to `frontend/out/`, copied to `site/`
- **Vercel serves from `site/`** — push `site/` changes to deploy

### Build process (every frontend change)

```bash
cd frontend && npm run build
cp -r out/* ../site/
git add . && git commit -m "..." && git push
```

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js, Express 4 |
| Frontend | Next.js (static export), React, Tailwind CSS, shadcn/ui |
| Licenses | SQLite |
| Tickets / KV | Upstash Redis |
| Deployment | Vercel |

---

## Environment variables

| Variable | Description |
|----------|-------------|
| `ADMIN_KEY` | Secret key for admin endpoints |
| `DB_PATH` | SQLite file path (default `/app/data/licenses.db`) |
| `KV_REST_API_URL` | Upstash Redis REST URL |
| `KV_REST_API_TOKEN` | Upstash Redis REST token |
| `NEXT_PUBLIC_API_URL` | URL of the Express backend |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins |

---

## Project structure

```
.
├── index.js              # Express server — all API routes
├── src/routes/           # Route handlers (admin, auth, licenses, support)
├── src/services/         # Business logic (license, email, KV)
├── src/middleware/        # Validation, rate limiting, admin auth
├── frontend/
│   ├── src/              # Next.js source (edit here)
│   ├── out/              # Build output (gitignored)
│   └── docs/             # Markdown docs articles
├── site/                 # What Vercel serves (copy of out/)
├── dashboard/            # Admin panel HTML
└── vercel.json           # Vercel config
```

---

## API routes

| Group | Prefix | Auth |
|-------|--------|------|
| License management | `/api/admin/licenses` | `X-Admin-Key` |
| Support tickets | `/api/admin/tickets` | `X-Admin-Key` |
| Dashboard stats | `/api/admin/stats` | `X-Admin-Key` |
| License verify | `/api/auth` | None |
| Ticket submit | `/api/support/ticket` | None (rate limited) |
| Theme validation | `/api/validate` | None |

---

## Rules

- Never store data in `/tmp` — use Upstash Redis
- No API routes in `frontend/src/app/api/` — breaks static export
- Support: Sam, 8AM–8PM CET, Mon–Sun
