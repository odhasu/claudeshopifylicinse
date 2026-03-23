

# Design Plan

## Current Mobile Navbar — Problems

```
┌──────────────────────────────────┐
│ 💎 Vexel              [☰ Menu]  │  ← header bar (h-16, good)
└──────────────────────────────────┘
│ 🏠 Home                       ● │  ← scaleY dropdown (feels abrupt)
│ 🏷 Pricing                      │
│ 📖 Docs                         │
│ 💬 Support                      │
│ 👤 Account                      │
│ ████ Get Started █████████████ │  ← flat, not premium enough
└──────────────────────────────────┘
```

## Proposed Mobile Navbar — Redesign

```
┌──────────────────────────────────┐
│ 💎 Vexel              [✕ Close] │  ← frosted glass header, logo left, icon right
└──────────────────────────────────┘
  ╔══════════════════════════════╗
  ║  🏠  Home              ●    ║  ← slide-down animation (not scaleY)
  ║  🏷  Pricing                ║  ← icons visible (currently hidden on mobile)
  ║  📖  Docs                   ║  ← active indicator: colored left border + bg
  ║  💬  Support                ║
  ║  👤  Account                ║
  ║  ━━━━━━━━━━━━━━━━━━━━━━━━  ║
  ║  ┌──────────────────────┐  ║
  ║  │  Get Started  →      │  ← branded purple CTA with arrow, rounded-xl
  ║  └──────────────────────┘  ║
  ╚══════════════════════════════╝
```

## Mobile Page-Level Improvements

| Section | Current Issue | Fix |
|---|---|---|
| **Hero** | `pt-32` top padding too large with 64px mobile nav | Reduce to `pt-24` |
| **Hero headline** | `text-5xl` on mobile can overflow narrow screens | Cap at `text-4xl` on `xs` |
| **Hero CTAs** | Stack fine, but secondary btn has too much padding | Tune `py-3.5` on mobile |
| **Stats row** | `grid-cols-3` gap tight on 320px screens | Add `text-xl` fallback |
| **Sections** | `py-20` is good but px sometimes too tight | Ensure `px-5` minimum |
| **Docs page** | Has its own nav — sidebar hidden on mobile | Already uses sidebar toggle |
| **Account page** | Dense card layout — should stack cleanly | Verify single-column stacking |
| **Footer** | Accordion is fine on mobile | Keep as-is |

## Design Tokens in Use

| Token | Value | Usage |
|---|---|---|
| `--primary` | `oklch(0.354 0.26 270)` ≈ `#3a0ca3` | CTA buttons, active states |
| `--background` | `oklch(1 0 0)` white | Navbar bg |
| `--border` | `oklch(0.922 0 0)` | Dividers |
| `--muted` | `oklch(0.97 0 0)` | Hover bg |
| `--muted-foreground` | `oklch(0.556 0 0)` | Secondary text |

# Implementation Plan

## Files to Change

| File | Changes |
|---|---|
| `src/components/ui/tubelight-navbar.tsx` | **Main focus** — restyle mobile nav: animation, icons, active state, CTA |
| `src/components/ui/hero-section.tsx` | Fix `pt-32` top padding for mobile nav height |
| `src/app/theme/page.tsx` | Minor: verify section padding on mobile |
| `src/app/globals.css` | Optionally remove/adjust the aggressive `min-h-[44px]` global rule that causes layout issues on nav items |

## Definition of Done

- [ ] Mobile navbar slides in smoothly (opacity + translateY, not scaleY), shows icons next to each nav item, has a polished branded CTA button at the bottom, and a frosted-glass header consistent with the desktop design language
- [ ] Hero section top padding accounts for the 64px mobile nav so content is never hidden behind it
- [ ] All pages (Home, Pricing, Docs, Support, Account) are verified to be usable and visually clean at 375px viewport width
