# Vexel Frontend

Next.js static export — the customer-facing store for Vexel.

## Build & deploy

```bash
# 1. Edit source files
frontend/src/

# 2. Build
cd frontend && npm run build

# 3. Copy output to site/
cp -r frontend/out/* site/

# 4. Push — Vercel auto-deploys from site/
git add . && git commit -m "..." && git push
```

Source changes alone do nothing until you build and copy to `site/`.

## Rules

- No API routes in `frontend/src/app/api/` — breaks static export
- All backend calls go to the Express server in `index.js`

## Key files

| File | What |
|------|------|
| `src/app/theme/page.tsx` | Homepage |
| `src/app/theme/docs/page.tsx` | Docs page |
| `src/app/theme/support/page.tsx` | Support page |
| `src/components/ui/pricing.tsx` | Pricing cards |
| `src/components/ui/hero-section.tsx` | Hero + stats |
| `src/components/ui/vexel-logo.tsx` | Logo |
| `src/lib/plans.ts` | Plan data (Lite / Pro) |
| `src/lib/docs-content.ts` | 29 article HTMLs |

## Pages

- `/theme/` — homepage (hero, features, pricing, FAQ, footer)
- `/theme/docs/` — 29 articles across 6 categories
- `/theme/support/` — contact form, Sam, 8AM–8PM CET
- `/theme/account/` — customer license management
- `/admin/` — admin dashboard (licenses, tickets, downloads)
