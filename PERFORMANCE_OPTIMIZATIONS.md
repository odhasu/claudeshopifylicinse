# Performance Optimization Guide

This document outlines all identified performance bottlenecks and recommended optimizations for the Vexel Themes application.

## High-Priority Quick Wins (Immediate Impact)

### 1. **Admin Dashboard Filter Optimization** ✅ IDENTIFIED
**File:** `frontend/src/app/admin/page.tsx` (lines 177-210)  
**Issue:** Filter button labels recalculate `.filter()` operations on every render
**Severity:** High (O(n) complexity per button label)
**Impact:** Re-renders all tickets when filter changes

**Recommended Fix:**
```javascript
// Add useMemo to memoize filtered array
const filtered = useMemo(
  () => filter === "all" ? tickets : tickets.filter(t => t.status === filter),
  [filter, tickets]
);

// Add memoization for status counts
const statusCounts = useMemo(() => ({
  all: tickets.length,
  open: tickets.filter(t => t.status === "open").length,
  "in-progress": tickets.filter(t => t.status === "in-progress").length,
  closed: tickets.filter(t => t.status === "closed").length,
}), [tickets]);

// Add useCallback for filter handler
const handleFilterChange = useCallback((newFilter: TicketStatus) => {
  setFilter(newFilter);
}, []);
```
**Estimated Savings:** 20-30% fewer re-renders per filter change

---

### 2. **Checkout Success Page Polling** 🔴 CRITICAL
**File:** `frontend/src/app/theme/checkout/success/page.tsx` (lines 16-27)  
**Issue:** Uses fixed 2-second delays with only 6 attempts (12s max latency)
**Severity:** Critical - Poor UX waiting for license key
**Current:** 6 attempts × 2 seconds = 12 seconds maximum wait

**Recommended Fix - Exponential Backoff:**
```javascript
async function pollForLicense(id: string, type: "session" | "pi", maxAttempts = 10): Promise<string | null> {
  const url = type === "session"
    ? `${API_BASE}/api/licenses/by-session/${id}`
    : `${API_BASE}/api/licenses/by-payment-intent/${id}`;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const r = await fetch(url);
      if (r.ok) {
        const d = await r.json();
        if (d.license_key) return d.license_key;
      }
    } catch {
      // ignore network errors
    }

    if (attempt < maxAttempts - 1) {
      // Exponential backoff: 100ms, 200ms, 400ms, 800ms, 1.6s...
      const delay = Math.min(100 * Math.pow(2, attempt), 5000);
      await new Promise(res => setTimeout(res, delay));
    }
  }
  return null;
}
```
**Estimated Savings:** Average 50-60% faster license display, max 20s instead of 12s

---

### 3. **Store Service Redis/File Sync** 🔴 CRITICAL
**File:** `src/services/storeService.js` (lines 15-21)  
**Issue:** Synchronous file I/O on every license check; data loss risk on Vercel
**Severity:** Critical - Ephemeral file system on serverless
**Impact:** Can lose licenses/data on deployment

**Recommended Fix:**
```javascript
// Make Redis the primary store, file only backup
async function getStore() {
  try {
    const cached = await redis.get('store_cache');
    if (cached) return JSON.parse(cached);
  } catch (e) {
    console.warn('[Store] Redis read failed, falling back to file');
  }
  
  // Fallback to file for local development
  const store = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  
  // Async cache for 5 minutes
  redis.setex('store_cache', 300, JSON.stringify(store))
    .catch(e => console.warn('[Store] Cache write failed:', e));
  
  return store;
}
```
**Why:** Vercel's `/tmp` is ephemeral; survives only within request lifecycle

---

### 4. **Docs Pre-Compilation** ⚠️ HIGH
**Files:** `frontend/src/lib/docs-loader.ts`, `frontend/docs/`  
**Issue:** Synchronous file reads for every docs request; blocks event loop
**Severity:** High - Affects page load time

**Recommended Fix:**
1. Pre-compile markdown to JSON at build time
2. Import as static asset instead of reading files
3. Cache in Redis with long TTL (1 hour)

**Build Script Approach:**
```javascript
// scripts/build-docs.js
const fs = require('fs');
const path = require('path');
const docsDir = 'frontend/docs';

const docs = {};
fs.readdirSync(docsDir).forEach(file => {
  if (file.endsWith('.md')) {
    const content = fs.readFileSync(path.join(docsDir, file), 'utf8');
    docs[file.replace('.md', '')] = content;
  }
});

fs.writeFileSync('frontend/src/lib/docs.json', JSON.stringify(docs));
```

**Estimated Savings:** 100-200ms per docs request (eliminate FS I/O)

---

## Medium-Priority Optimizations

### 5. **React Component Memoization**
**Files:** `frontend/src/app/admin/page.tsx` (lines 221-242)  
**Issue:** Ticket list items re-render when parent state changes
**Fix:** Use `React.memo()` with custom equality check

```javascript
const TicketItem = memo(function TicketItem({ ticket, expanded, onToggle }) {
  return (/* JSX */);
}, (prev, next) => 
  prev.ticket.id === next.ticket.id && 
  prev.expanded === next.expanded
);
```
**Estimated Savings:** 30-40% fewer re-renders in large ticket lists

---

### 6. **useCallback for Event Handlers**
**Files:** Multiple (`admin/page.tsx`, `support/page.tsx`, `account/page.tsx`)  
**Issue:** Inline onClick handlers create new function references on every render
**Fix:** Wrap handlers in`useCallback` with minimal dependencies

**Example:**
```javascript
const handleFilterChange = useCallback((newFilter) => {
  setFilter(newFilter);
}, []);  // Empty deps if no external dependencies
```
**Estimated Savings:** 10-15% reduction in re-render cycles

---

### 7. **Lazy Load Images**
**Files:** All pages with images  
**Issue:** Only 1 instance of `loading="lazy"` found site-wide
**Fix:** Add lazy loading to all non-above-fold images

```jsx
// Before
<img src={url} alt="..." />

// After
<img src={url} alt="..." loading="lazy" />
<Image src={url} loading="lazy"  alt="..." />
```
**Estimated Savings:** 20-30% faster initial page load

---

### 8. **Dynamic Imports for Heavy Libraries**
**File:** `frontend/package.json`, import statements  
**Heavy Libraries:**
- `framer-motion` (40KB+ gzipped)
- `canvas-confetti` (10KB+)
- `stripe` JS SDK (full)

**Recommended Approach:**
```javascript
// Only load confetti on success page
const confetti = await import('canvas-confetti').then(m => m.default);

// Load Stripe only when needed
const { loadStripe } = await import('@stripe/stripe-js');
const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);
```
**Estimated Savings:** 15-20% bundle size reduction

---

### 9. **Image Optimization**
**Files:** All static images  
**Issue:** No evidence of image optimization pipeline
**Recommendations:**
- Use WebP format with PNG fallback
- Add responsive images with `srcset`
- Compress using `sharp` at build time

```jsx
<picture>
  <source srcSet={imageWebp} type="image/webp" />
  <img src={imagePng} loading="lazy" alt="..." />
</picture>
```

---

## Low-Priority / Long-term Improvements

### 10. **Request Deduplication**
**File:** `frontend/src/app/theme/docs/page.tsx`  
**Issue:** No caching for repeated article requests
**Fix:** Use  React Query or add in-memory cache

```javascript
const cacheRef = useRef(new Map());

const selectArticle = useCallback((slug: string) => {
  if (cacheRef.current.has(slug)) {
    setArticleData(cacheRef.current.get(slug));
    return;
  }
  // ... fetch
}, []);
```

---

### 11. **DOM Reflow Optimization**
**Files:** `particles.tsx` (line 91), `glowing-effect.tsx` (line 48)  
**Issue:** `getBoundingClientRect()` called in animation loops (60fps)
**Fix:** Cache on mount, update only on resize

```javascript
const cachedRect = useRef(null);

useEffect(() => {
  const updateRect = () => {
    cachedRect.current = canvasRef.current?.getBoundingClientRect();
  };
  
  updateRect();
  window.addEventListener('resize', updateRect);
  return () => window.removeEventListener('resize', updateRect);
}, []);

// In animation loop:
const rect = cachedRect.current; // Use cached value
```
**Estimated Savings:** 60+ FPS stability improvement

---

## Bundle Size Target

**Current Estimated Bundle Size:** 150-180KB gzipped  
**Target After Optimizations:** 120-140KB (15-20% reduction)

### Bundle Analysis
```bash
npm run build -- --analyze
```

### Breakdown:
- Framework + React: ~40KB
- UI Components: ~20KB
- Stripe SDK: ~25KB
- Framer Motion: ~40KB (candidate for lazy loading)
- Canvas Confetti: ~10KB (only on success page)
- Other: ~25KB

---

## Implementation Priority

### Phase 1 (This Week)
1. ✅ Fix admin dashboard memoization (15 min)
2. 🔴 Improve checkout polling (30 min) 
3. 🔴 Add Redis fallback to storeService (1 hour)

### Phase 2 (Next Week)
4. Pre-compile docs to JSON (2 hours)
5. Add React.memo to ticket list (30 min)
6. Add lazy loading to all images (1 hour)

### Phase 3 (Later)
7. Dynamic imports for heavy libraries (2 hours)
8. Request deduplication (2 hours)
9. DOM reflow optimization (1 hour)

---

## Measurement & Monitoring

### Key Metrics to Track
- **Time to Interactive (TTI):** <2.5s
- **First Contentful Paint (FCP):** <1.5s
- **Checkout Success Page Load:** <500ms (with license key)
- **Admin Dashboard Filter:** <100ms
- **Bundle Size:** <150KB gzipped

### Tools
```bash
# Lighthouse for core web vitals
npm run build && npx lighthouse https://your-domain.com

# Bundle analysis
npm run build -- --analyze

# Performance profiling
NODE_OPTIONS=--inspect npm run dev
```

---

## Notes

- All estimates are relative and depend on specific use case
- Actual gains should be measured with Lighthouse / WebPageTest
- Some optimizations (e.g., Redis caching) require infrastructure changes
- Consider lazy loading for non-critical routes
