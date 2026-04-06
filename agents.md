# OGResell Server — Agents & Team

## The Team

### Manager
Oscar talks to the Manager about the business. The Manager decides what gets worked on in this repo — usually things that affect license validation, customer access, or revenue directly.

### Planner
Before touching the server, the Planner maps out the steps. Server changes can break license validation for all live customers — nothing gets built without a clear plan first.

### Coder
Builds and edits the server. After every change: git push. Vercel picks it up and redeploys automatically (usually takes 30–60 seconds).

### Reviewer
Checks server changes before they go live:
- License validation still works (POST /api/validate returns correct responses)
- Admin dashboard loads and shows correct data
- Support tickets save to Upstash Redis and show up in admin
- No API routes accidentally added inside frontend/src/app/api/ (breaks static build)
- No data being written to /tmp for persistence (won't survive serverless restarts)

## CoWork Plugins

**ogresell-team** — the four-role team (Manager, Planner, Coder, Reviewer)

**ogresell-cowork** — day-to-day skills including store-ops for managing licenses and resellers

## Auto-behavior

After every file edit: git add → commit → push to GitHub. Vercel redeploys automatically.
