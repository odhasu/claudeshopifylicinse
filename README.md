# Vexel Themes — Shopify Theme Licensing & Protection System

A full-stack platform for selling, licensing, and protecting Shopify themes. It provides dynamic theme-section rendering (content is only served to stores with a valid license), a Stripe-powered checkout flow, an admin dashboard, and a customer support system.

---

## Table of Contents

- [Features](#features)
- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
  - [Docker](#docker)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [License](#license)

---

## Features

- **Theme Protection** — Shopify section HTML is rendered server-side only for stores that present a valid license key.
- **License Management** — Create, revoke, bulk-create, renew, and export licenses via a REST API and admin UI.
- **Stripe Checkout** — Full purchase flow with webhook-based license provisioning, supporting LITE and PRO plans.
- **Email Notifications** — Welcome emails and support replies via [Resend](https://resend.com/).
- **Support Ticket System** — Customers submit tickets; admins reply from the dashboard (rate-limited to 5 submissions/hour per IP).
- **Admin Dashboard** — React/Next.js UI for managing licenses, tickets, stats, and observability metrics.
- **Multi-tier Plans** — Configurable LITE / PRO plans with different feature gates.
- **Redis Caching** — Upstash Redis as the primary KV store with a local JSON fallback for development.

---

## Architecture Overview

```
┌─────────────────────┐        ┌──────────────────────┐
│  Shopify Storefront │        │  Customer Browser    │
│  (theme sections)   │        │  (Next.js frontend)  │
└────────┬────────────┘        └──────────┬───────────┘
         │ POST /api/render               │ /theme/*
         ▼                                ▼
┌─────────────────────────────────────────────────────┐
│              Express API  (index.js / src/)          │
│                                                     │
│  /api/auth          /api/licenses   /api/render     │
│  /api/stripe        /api/support    /api/admin      │
└──────────┬──────────────────────────────────────────┘
           │
     ┌─────▼──────┐    ┌──────────────┐    ┌────────┐
     │ Upstash    │    │ Stripe       │    │ Resend │
     │ Redis (KV) │    │ (Payments)   │    │ (Email)│
     └────────────┘    └──────────────┘    └────────┘
```

**Purchase Flow**

1. Customer browses `/theme/pricing` and selects a plan.
2. Frontend calls Stripe to create a checkout session.
3. Stripe webhook (`POST /api/webhooks/stripe`) fires after payment.
4. Backend creates a license and sends a welcome email.
5. Frontend polls `GET /api/licenses/by-session/:session_id` until the license is ready.
6. License key is shown on `/theme/checkout/success`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend Runtime | Node.js ≥ 18, Express 4 |
| Frontend | Next.js 16, React 19, Tailwind CSS 4, shadcn/ui |
| Database | Upstash Redis (primary), SQLite / local JSON (fallback) |
| Payments | Stripe (checkout, webhooks) |
| Email | Resend |
| Security | Helmet, Zod validation, rate limiting |
| Deployment | Vercel, Railway, Docker |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- A [Stripe](https://stripe.com) account (test keys are fine for development)
- An [Upstash Redis](https://upstash.com/) database (free tier works)
- A [Resend](https://resend.com/) account for emails

### Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Express server port (default `3000`) |
| `NODE_ENV` | Yes | `production` or `development` |
| `ADMIN_KEY` | Yes | Secret key for admin endpoints (min 32 chars) |
| `DB_PATH` | No | SQLite file path (default `/app/data/licenses.db`) |
| `ALLOWED_ORIGINS` | No | Comma-separated CORS origins |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key (`sk_test_...` or `sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret (`whsec_...`) |
| `PUBLIC_BASE_URL` | Yes | Frontend base URL (for Stripe redirect) |
| `RESEND_API_KEY` | Yes | Resend API key (`re_...`) |
| `RESEND_FROM_EMAIL` | Yes | Sender address verified in Resend |
| `KV_REST_API_URL` | Yes | Upstash Redis REST URL |
| `KV_REST_API_TOKEN` | Yes | Upstash Redis REST token |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes (frontend) | Stripe publishable key |
| `NEXT_PUBLIC_API_URL` | Yes (frontend) | URL of the Express backend |

### Running Locally

```bash
# 1. Install backend dependencies
npm install

# 2. Start the Express backend (with hot reload)
npm run dev          # http://localhost:3000

# 3. In a second terminal — install and start the Next.js frontend
cd frontend
npm install
npm run dev          # http://localhost:3001
```

> **Stripe webhooks in development:** Use the [Stripe CLI](https://stripe.com/docs/stripe-cli) to forward events to your local server:
> ```bash
> stripe listen --forward-to localhost:3000/api/webhooks/stripe
> ```

### Docker

```bash
# Build
docker build -t vexel-themes .

# Run
docker run -p 3000:3000 \
  --env-file .env \
  vexel-themes
```

---

## Project Structure

```
.
├── src/
│   ├── routes/          # Express route handlers
│   │   ├── admin.js     # License & ticket management
│   │   ├── auth.js      # License verification
│   │   ├── licenses.js  # License lookup utilities
│   │   ├── render.js    # Dynamic theme rendering
│   │   ├── stripe.js    # Stripe webhooks & checkout
│   │   ├── support.js   # Customer support tickets
│   │   └── loader.js    # Shopify section loaders
│   ├── services/        # Business logic (license, email, KV, Stripe…)
│   ├── middleware/       # Validation, rate limiting, admin auth
│   ├── renderers/       # HTML/CSS/JS renderers for theme sections
│   └── utils/           # Logger, checksum, domain normalisation…
│
├── frontend/            # Next.js customer & admin UI
│   ├── src/app/
│   │   ├── admin/       # Admin dashboard
│   │   └── theme/       # Customer-facing pages (pricing, checkout, account…)
│   ├── Shopify-theme/   # Shopify theme source files
│   └── supabase/        # Optional database migrations
│
├── dashboard/           # Legacy HTML dashboard
├── index.js             # Express server entry point
├── build.js             # Theme build script
├── Dockerfile
├── railway.json         # Railway deployment config
└── vercel.json          # Vercel deployment config
```

---

## API Reference

Full details are available in [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md). Key endpoint groups:

| Group | Prefix | Auth |
|---|---|---|
| License management | `/api/admin/licenses` | `X-Admin-Key` header |
| Support tickets | `/api/admin/tickets` | `X-Admin-Key` header |
| Dashboard stats | `/api/admin/stats` | `X-Admin-Key` header |
| License verification | `/api/auth` | None (public) |
| License lookup | `/api/licenses` | None (public) |
| Theme rendering | `/api/render` | None (public) |
| Stripe checkout | `/api/stripe` | None (public) |
| Stripe webhooks | `/api/webhooks/stripe` | Stripe signature |
| Support ticket submit | `/api/support/ticket` | None (rate limited) |

### Quick Examples

```bash
# Verify a license
curl -X POST https://your-api.example.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"licenseKey": "VX-XXXX-XXXX-XXXX", "domain": "yourstore.myshopify.com"}'

# List all licenses (admin)
curl https://your-api.example.com/api/admin/licenses \
  -H "X-Admin-Key: your-admin-key"

# Get dashboard stats (admin)
curl https://your-api.example.com/api/admin/stats \
  -H "X-Admin-Key: your-admin-key"
```

---

## Deployment

### Vercel (recommended for frontend + serverless backend)

The repository includes `vercel.json` at the root and inside `frontend/`. Push to your connected GitHub repository and Vercel will deploy automatically.

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy backend
vercel --prod

# Deploy frontend
cd frontend && vercel --prod
```

### Railway (recommended for the Express backend)

A `railway.json` config is included. Connect your GitHub repository in the Railway dashboard and set the required environment variables.

### Docker / Self-hosted

```bash
docker build -t vexel-themes .
docker run -d -p 3000:3000 --env-file .env vexel-themes
```

---

## License

This project is proprietary software. All rights reserved.
