# Store — Bugs

## Active bugs

### 1. ~3s lag/freeze on every click
- **Status:** Not diagnosed
- **Symptom:** Every click on the site triggers a ~3 second freeze before anything happens
- **Impact:** High — kills conversion, terrible UX
- **Suspected cause:** Unknown — needs profiling. Possibly blocking JS on page load, heavy initial bundle, or something in the license check flow
- **Next step:** Open DevTools → Performance tab → record a click, identify what's blocking

### 2. Mobile layout broken
- **Status:** Active — dedicated session scoped (Apr 21), ready to fix next
- **Symptom:** Elements overlap or look off on phones
- **Impact:** High — most traffic is mobile
- **Approach confirmed:** Full audit of every page, fix breakpoints, reference usekenso.com, design open to changes, copy stays as-is, no new sections
- **Next step:** Open new session with the prepared prompt, start with reading current mobile styles

### 3. Docs page needs fixes
- **Status:** Known, not detailed
- **Symptom:** Something is broken or off on the docs page — needs investigation
- **Next step:** Open the docs page and audit what's wrong

---

## Build process reminder (easy to forget)

Editing `frontend/src/` does **nothing** until:
1. `cd frontend && npm run build`
2. `cp -r out/* ../site/`
3. `git push`

---

## Resolved bugs

_(move bugs here once fixed — include what the fix was)_
