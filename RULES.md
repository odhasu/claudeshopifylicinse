# Store — Session Rules

## Hard rules (never break these)

- **Never store data in `/tmp`** — use Upstash Redis
- **No API routes in `frontend/src/app/api/`** — breaks static export; all backend logic goes in `index.js`
- **Always build before pushing frontend changes** — edit → `npm run build` → copy `out/*` to `site/` → push
- **Server changes risk breaking license validation** — plan before touching `index.js` or any auth/validate route
- **Never add what Oscar didn't ask for** — no extra features, no speculative additions

## Communication rules

- No recaps or summaries at end of responses
- Plain language, no jargon
- Be direct — no filler
- Only ask Oscar when it's a real business decision

## Code rules

- No hardcoded values — use env vars or config
- Don't add error handling for impossible scenarios
- Don't add extra abstraction layers for one-time operations
- Match the existing code style

## Per-session checklist

Before pushing any change, verify:
- [ ] No new API routes in `frontend/src/app/api/`
- [ ] No `/tmp` usage
- [ ] Frontend was built (`npm run build`) and copied to `site/`
- [ ] License validation still works (`/api/validate`)
- [ ] Admin dashboard still loads
- [ ] Tickets still save to Redis

## End of session

Update `BUILD.md` and `BUGS.md` before finishing.
