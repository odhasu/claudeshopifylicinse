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
- When starting a new improvement/design session, ask Oscar ~10 scoping questions first before writing a prompt or touching code

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

## Claude Code settings (already configured globally)

- `permissions.defaultMode: "acceptEdits"` — file edits auto-apply, no diff prompt shown
- `attribution.commit: ""` — no Co-Authored-By line in commits
- `viewMode: "focus"` — minimal tool output in chat
- Supabase MCP configured in `~/.claude/mcp.json` — Claude can query DB directly after restart

These are in `~/.claude/settings.json` and `~/.claude/mcp.json` (Oscar's machine). Don't re-add them to project settings.

## Env vars required in Vercel (not yet added)

- `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` — for Whop webhook + subscription endpoint
- `WHOP_WEBHOOK_SECRET` — Whop dashboard → webhook settings
- `NEXT_PUBLIC_WHOP_LIFETIME_URL` — Whop lifetime checkout link (needs rebuild when added)

## End of session

Update `BUILD.md` and `BUGS.md` before finishing.  
Trim anything in `CLAUDE.md` that's already covered by the other files — keep it as a lean entry point only.
