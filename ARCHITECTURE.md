# Vexel Themes - Project Architecture

High-level overview of the Vexel Themes monorepo structure and how components interact.

## Project Structure

```
claudeshopifylicinse/
├── frontend/              # Next.js + React frontend
│   ├── src/
│   │   ├── app/          # Next.js app router (pages)
│   │   │   ├── admin/    # Admin dashboard 
│   │   │   ├── theme/    # Theme pages
│   │   │   │   ├── account/    # License account/dashboard
│   │   │   │   ├── checkout/   # Stripe checkout
│   │   │   │   ├── support/    # Support form
│   │   │   │   └── pricing/    # Pricing page
│   │   │   └── ...
│   │   ├── components/   # Reusable React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utilities & services
│   │   └── styles/       # Global styles
│   ├── public/           # Static assets
│   ├── docs/             # Customer documentation (markdown)
│   ├── Shopify-theme/    # Shopify theme distribution
│   └── package.json      # Frontend dependencies
│
├── src/                   # Node.js backend (Express)
│   ├── routes/           # API endpoints
│   │   ├── admin.js      # Admin management APIs
│   │   ├── auth.js       # License verification
│   │   ├── licenses.js   # License utilities
│   │   ├── render.js     # Theme section rendering
│   │   ├── stripe.js     # Stripe webhooks & checkout
│   │   ├── support.js    # Support ticket APIs
│   │   └── loader.js     # Shopify section loaders
│   │
│   ├── services/         # Business logic
│   │   ├── licenseService.js    # License generation & validation
│   │   ├── stripeService.js     # Stripe integration
│   │   ├── emailService.js      # Email sending (Resend)
│   │   ├── kvService.js         # Redis/Upstash persistence
│   │   ├── storeService.js      # Local JSON store (fallback)
│   │   └── ...
│   │
│   ├── middleware/       # Express middleware
│   │   ├── validate.js   # Zod schema validation
│   │   ├── rateLimit.js  # Rate limiting
│   │   └── requireAdmin.js   # Admin key verification
│   │
│   ├── renderers/        # HTML renderers for theme
│   ├── utils/            # Shared utilities
│   └── ...
│
├── data/                 # Local data files
│   ├── store.json        # Fallback license database
│   └── ...
│
├── theme-dist/           # Built Shopify theme (output)
├── dashboard/            # Legacy dashboard (HTML)
├── site/                 # Static site export
│
├── index.js              # Main Express server
├── package.json          # Root dependencies
├── PURCHASE_AUTOMATION_SETUP.md        # Setup guide
├── PERFORMANCE_OPTIMIZATIONS.md        # Performance roadmap
├── API_DOCUMENTATION.md                # API reference
└── README.md                           # Project README
```

---

## Data Flow Architecture

### Customer Purchase Flow

```
┌─────────────────────────────────────────────────────────┐
│ 1. Customer on Pricing Page                             │
│    /theme/pricing → Selects plan (LITE/PRO)             │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Frontend: Create Checkout Session                     │
│    POST /api/stripe/checkout                            │
│    → Stripe session ID → Redirect to checkout           │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Stripe Hosted Checkout                               │
│    Customer enters payment info                         │
│    Stripe processes payment                             │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Payment Success → Redirect to Success Page           │
│    /theme/checkout/success?session_id=cs_...            │
│    Frontend starts polling: GET /api/licenses/by-session │
└──────────────────┬──────────────────────────────────────┘
                   │
    ┌──────────────┴──────────────┐
    │ (Parallel)                   │
    ↓                              ↓
┌────────────────────┐  ┌─────────────────────┐
│ 5a. Webhook Fires   │  │ 5b. Frontend Poll   │
│ POST /api/webhooks/ │  │ Retry 6x, 2s delay  │
│ stripe             │  │ (up to 12 seconds)  │
│ - Validates sig    │  │                      │
│ - Creates license  │  │                      │
│ - Sends email      │  │                      │
│ - Saves to Redis   │  │                      │
└────────┬───────────┘  └──────┬───────────────┘
         │                     │
         └─────────┬───────────┘
                   ↓
    ┌──────────────────────────────┐
    │ 6. License Ready             │
    │    Display key on success page
    │    Email sent to customer     │
    └──────────────────────────────┘
```

### Admin Support Ticket Flow

```
┌────────────────────────────────────────────┐
│ Customer submits support ticket            │
│ POST /api/support/ticket                   │
│ (rate limited: 5/hour per IP)              │
└────────────────┬─────────────────────────┘
                 ↓
     ┌───────────────────────┐
     │ Ticket stored:        │
     │ - Upstash Redis       │
     │ - Fallback: store.json│
     └───────────────────────┘
                 ↓
    ┌────────────────────────────┐
    │ Admin checks dashboard     │
    │ /admin → TicketsTab        │
    │ Lists unread tickets       │
    │ Admin replies with message │
    └────────────┬───────────────┘
                 ↓
    ┌────────────────────────────┐
    │ POST /api/admin/tickets/   │
    │ {id}/reply                 │
    └────────────┬───────────────┘
                 ↓
    ┌────────────────────────────────────┐
    │ Reply sent to customer via email   │
    │ sendTicketReplyEmail()             │
    │ - Uses Resend API                  │
    │ - HTML email template              │
    │ - Customer replies via email       │
    │   (optional: creates new ticket)   │
    └────────────────────────────────────┘
```

---

## Storage Architecture

### Primary Storage: Upstash Redis (KV)
**Used for:** Fast, persistent data accessed by production API

```
Redis Key-Value Store:
  licenses:all          → List of all active licenses
  store_cache           → Cached store data (5min TTL)
  tickets:all           → Support tickets
  sessions:*            → Stripe session → License mapping
```

### Fallback: Local JSON (data/store.json)
**Used for:** Development, migration, backup

```json
{
  "licenses": [ { license_key, domain, plan, ... } ],
  "request_log": [ { timestamp, status, ... } ],
  "remote_content": [ { css, html, js, ... } ]
}
```

### Cache Strategy
```
Request → Redis (primary)
         ↓
    (miss)→ JSON file (fallback)
         ↓
    (write to Redis with TTL)
```

---

## Security Architecture

### Authentication Layers

```
1. Admin Endpoints
   ├─ Require X-Admin-Key header
   ├─ Verified against ADMIN_KEY env variable
   └─ Returns 401 if missing/invalid

2. License Endpoints
   ├─ License key format: XXXX-XXXX-XXXX-XXXX
   ├─ Validated against Redis/store.json
   └─ Linked to Stripe session/payment intent

3. Webhook Security
   ├─ Stripe signature verification (Ed25519)
   ├─ STRIPE_WEBHOOK_SECRET from Stripe Dashboard
   └─ Returns 400 if signature invalid
```

### Data Validation

```
All inputs validated with Zod schemas:
  ├─ Support tickets
  ├─ License creation
  ├─ Admin actions
  └─ Render requests

Validation errors → 400 Bad Request
```

---

## Integration Points

### Stripe Integration
```
Frontend      → POST /api/stripe/checkout
              ← Stripe session + redirect URL

Stripe        → POST /api/webhooks/stripe (asynchronous)
              ← 200 OK
              
Backend       → Check Redis for license
Frontend      ← GET /api/licenses/by-session/{id}
              ← { license_key, plan }
```

### Email Integration (Resend)
```
Backend       → sendWelcomeEmail() on purchase
              → sendTicketReplyEmail() on admin reply
              
Resend API    → Sends HTML emails asynchronously
              → Can error without failing webhook
```

### Shopify Integration
```
Shopify Theme → Requests content at runtime
              ← GET /api/render
              
Backend       → Returns rendered HTML
              → Validates license key
              → Caches response
```

---

## Environment Configuration

### Required Variables
```
# Stripe
STRIPE_SECRET_KEY              # Backend API key
STRIPE_WEBHOOK_SECRET          # Webhook signing secret
NEXT_PUBLIC_STRIPE_KEY         # Frontend publishable key

# Email
RESEND_API_KEY                 # Email sending service

# Redis/Cache
KV_REST_API_URL                # Upstash Redis REST endpoint  
KV_REST_API_TOKEN              # Auth token

# Backend
ADMIN_KEY                       # Master admin authentication
PORT                           # Server port (default 3000)

# Optional
ALLOWED_ORIGINS                # CORS origins (comma-separated)
SITE_URL                       # Base URL for email links
RESEND_FROM_EMAIL              # Sender email address
```

---

## Deployment Architecture

### Frontend (Vercel)
```
Next.js App
  ├─ Auto-deploys on git push
  ├─ Builds static pages + API routes
  └─ Environment variables from Vercel dashboard
```

### Backend (Vercel)
```
Express Server
  ├─ Deployed as Vercel Serverless Functions
  ├─ Cold start: ~500ms
  ├─ Ephemeral /tmp filesystem
  └─ Falls back to Redis on startup
```

### Database (Upstash)
```
Redis KV Store
  ├─ 25MB free tier
  ├─ Auto-scaling
  ├─ < 10ms latency
  └─ Automatic backups
```

---

## Development Workflow

### Local Development
```bash
# Backend (Node.js)
npm run dev            # Starts Express on :3000

# Frontend (Next.js)
cd frontend
npm run dev            # Starts Next.js on :3001
```

### Testing with Stripe
```bash
# Use Stripe test mode
# Test card: 4242 4242 4242 4242
# Any future date + CVC

# Test webhook in Stripe Dashboard
# → Developers → Webhooks → Send test event
```

### Environment Setup
```
.env (ignored by git):
  Copy from .env.example
  Fill in your API keys
  Local development uses mock data
```

---

## Performance Characteristics

### Request Latency (Target)
```
GET /api/admin/tickets              → 100-200ms
GET /api/licenses/by-session/{id}   → 50-100ms (Redis hit)
POST /api/admin/tickets/{id}/reply  → 300-500ms
POST /api/webhooks/stripe           → 200-400ms
```

### Throughput
```
License verification:  ~1,000 req/sec per instance
Admin API:             ~500 req/sec per instance
Webhooks:              Queued (async processing)
```

### Storage
```
Typical data usage:
  - Redis: 5-10MB (for 1000 licenses + tickets)
  - JSON backup:  < 1MB
  - Logs: 50-100MB (on Vercel, auto-pruned)
```

---

## Monitoring & Observability

### Vercel Logs
```
Best for: Real-time event tracking
  [Webhook] Processing checkout.session.completed: cs_...
  [License] Created: XXXX-XXXX-XXXX-XXXX
  [Email] Welcome email sent to user@example.com
```

### Stripe Dashboard
```
Best for: Payment & webhook monitoring
  - Webhook event history + retry status
  - Payment processing success rate
  - Customer payment methods
```

### Upstash Console
```
Best for: Cache/database monitoring
  - Redis memory usage
  - Key operations count
  - Latency metrics
  - Backup status
```

---

## Future Improvements

See [PERFORMANCE_OPTIMIZATIONS.md](./PERFORMANCE_OPTIMIZATIONS.md) for:
- Memoization fixes
- Polling optimization
- Bundle size reduction
- Image optimization
- Cache improvements

---

## Contributing

When making changes:

1. **Frontend:** Update `/frontend/src/` → Deploy via Vercel
2. **Backend:** Update `/src/` → Auto-deploys on push
3. **Documentation:** Update `.md` files in root
4. **Environment:** Add to `.env.example` if new var needed

See individual READMEs for more details.
