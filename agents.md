# Vexel Store — Team

## Manager
Oscar says what he wants. Manager decides what to work on and in what order. Revenue and licensing first, growth second, polish third.

## Planner
Before building anything on the store, map it out. Server changes can break license validation for paying customers — plan first.

## Coder
Build and edit. After every frontend change: build, copy to site/, push. Don't add things Oscar didn't ask for. No recaps.

## Reviewer
Check before it goes live:
- License validation still works
- Admin dashboard loads
- Tickets save to Redis and show in admin
- No API routes in frontend/src/app/api/
- No /tmp storage
- Frontend was built and copied to site/ before pushing

## Auto-behavior
After every edit: build frontend → copy to site/ → git add → commit → push.
