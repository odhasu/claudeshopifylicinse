# Vexel Store — How Things Work

## Updating the frontend

1. Edit files in `frontend/src/`
2. Run `npm run build` in `frontend/`
3. Copy everything from `frontend/out/` to `site/`
4. Push to GitHub

Source changes alone don't show up on the live site. You must build and copy to site/ every time.

## Adding a new page

1. Create `frontend/src/app/theme/your-page/page.tsx`
2. Never add anything to `frontend/src/app/api/` — breaks the build
3. Build, copy to site/, push

## Adding an API endpoint

1. Open `index.js`
2. Add route
3. If it needs admin access, check ADMIN_KEY
4. If it needs storage, use Upstash Redis via `upstashCmd()`
5. Push — Vercel redeploys

## License validation flow

1. Customer visits a reseller store using the theme
2. Theme's loader.js sends license key + domain to POST /api/validate
3. Server checks SQLite: exists? active? domain match? expired?
4. Valid → 200 + section HTML
5. Invalid → 403 + message + footerHtml (loader.js injects it)

## Key files

| File | What |
|------|------|
| index.js | Express server, all routes |
| frontend/src/app/theme/page.tsx | Homepage |
| frontend/src/app/theme/docs/page.tsx | Docs page |
| frontend/src/app/theme/support/page.tsx | Support page |
| frontend/src/components/ui/pricing.tsx | Pricing cards |
| frontend/src/components/ui/hero-section.tsx | Hero + stats |
| frontend/src/components/ui/vexel-logo.tsx | Logo (black diamond, no purple) |
| frontend/src/lib/plans.ts | Plan data |
| frontend/src/lib/docs-content.ts | 29 article HTMLs |
| dashboard/ | Admin panel |
