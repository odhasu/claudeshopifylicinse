# API Documentation

Complete reference for the Vexel Themes backend API.

## Base URL

- **Production:** `https://claudecodethemeshopify.vercel.app`
- **Local Development:** `http://localhost:3000`

---

## Authentication

### Admin Key

Protected endpoints require the `X-Admin-Key` header.

```bash
curl -H "X-Admin-Key: your-admin-key" \
  https://api.example.com/api/admin/stats
```

The admin key is set via the `ADMIN_KEY` environment variable.

---

## Endpoints

### Licenses

#### POST `/api/admin/licenses`
**Create a new license**

Headers:
```
X-Admin-Key: <admin-key>
Content-Type: application/json
```

Request body:
```json
{
  "username": "store_owner",
  "domain": "example.myshopify.com",
  "permanent_domain": "example.com",
  "store_name": "Example Store",
  "plan": "LITE",
  "expires_at": "2025-12-31T23:59:59Z"
}
```

Response:
```json
{
  "license_key": "XXXX-XXXX-XXXX-XXXX",
  "domain": "example.myshopify.com",
  "plan": "LITE",
  "message": "License created successfully"
}
```

---

#### GET `/api/admin/licenses`
**List all licenses**

Headers:
```
X-Admin-Key: <admin-key>
```

Response:
```json
{
  "licenses": [
    {
      "id": 1,
      "license_key": "XXXX-XXXX-XXXX-XXXX",
      "domain": "store.myshopify.com",
      "permanent_domain": "store.com",
      "store_name": "My Store",
      "plan": "LITE",
      "active": 1,
      "created_at": "2025-03-26T10:00:00Z",
      "last_verified_at": null,
      "request_count": 42,
      "username": "john_doe",
      "customer_name": "John Doe",
      "notes": "Auto-created via Stripe checkout"
    }
  ]
}
```

---

#### DELETE `/api/admin/licenses/:key`
**Revoke a license**

Headers:
```
X-Admin-Key: <admin-key>
```

Response:
```json
{
  "message": "License revoked"
}
```

---

### Tickets (Support)

#### POST `/api/support/ticket`
**Submit a support ticket**

No authentication required. (Rate limited: 5 per IP address)

Request body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "How do I activate my license?"
}
```

Response:
```json
{
  "success": true,
  "ticket_id": 1234567890,
  "message": "Ticket submitted successfully"
}
```

---

#### GET `/api/admin/tickets`
**List all support tickets**

Headers:
```
X-Admin-Key: <admin-key>
```

Query parameters:
- `status`: Filter by status (open, in-progress, closed)
- `read`: Filter by read status (true/false)

Response:
```json
{
  "tickets": [
    {
      "id": 1234567890,
      "name": "John Doe",
      "email": "john@example.com",
      "message": "License activation help required",
      "status": "open",
      "read": false,
      "replies": [],
      "created_at": "2025-03-26T10:00:00Z",
      "updated_at": "2025-03-26T10:00:00Z"
    }
  ],
  "unread": 3
}
```

---

#### PUT `/api/admin/tickets/:id`
**Update ticket status/read status**

Headers:
```
X-Admin-Key: <admin-key>
Content-Type: application/json
```

Request body:
```json
{
  "status": "in-progress",
  "read": true
}
```

Response:
```json
{
  "ticket": {
    "id": 1234567890,
    "name": "John Doe",
    "status": "in-progress",
    "read": true,
    "updated_at": "2025-03-26T10:05:00Z"
  }
}
```

---

#### POST `/api/admin/tickets/:id/reply`
**Send a reply to a support ticket**

Headers:
```
X-Admin-Key: <admin-key>
Content-Type: application/json
```

Request body:
```json
{
  "message": "You can activate your license by going to Settings > License and entering your key."
}
```

Response:
```json
{
  "success": true,
  "reply": {
    "id": 1648937521000,
    "message": "You can activate your license...",
    "sent_at": "2025-03-26T10:05:00Z"
  }
}
```

**Note:** Email is automatically sent to the customer at `ticket.email`.

---

#### GET `/api/admin/tickets/unread-count`
**Get count of unread tickets**

Headers:
```
X-Admin-Key: <admin-key>
```

Response:
```json
{
  "unread": 3
}
```

---

### Render / Theme Content

#### POST `/api/render`
**Render theme sections**

Request body:
```json
{
  "licenseKey": "XXXX-XXXX-XXXX-XXXX",
  "domain": "store.myshopify.com",
  "sections": [
    {
      "type": "countdown",
      "elementId": "countdown-1",
      "settings": {
        "endDate": "2025-12-31",
        "message": "Order now!"
      }
    }
  ],
  "colors": {
    "primary": "#3a0ca3",
    "accent": "#7b2ff7"
  }
}
```

Response:
```html
<div id="countdown-1">
  <!-- Rendered countdown HTML -->
</div>
```

---

### Authentication

#### POST `/api/auth/login`
**Verify license key and get license details**

Request body:
```json
{
  "licenseKey": "XXXX-XXXX-XXXX-XXXX"
}
```

Response:
```json
{
  "success": true,
  "license": {
    "license_key": "XXXX-XXXX-XXXX-XXXX",
    "domain": "store.myshopify.com",
    "plan": "LITE",
    "active": true,
    "created_at": "2025-03-01T00:00:00Z",
    "request_count": 123
  }
}
```

---

### Stripe / Checkout

#### GET `/api/stripe/session`
**Get checkout session details**

Query parameters:
- `session_id`: Stripe session ID from redirect URL

Response:
```json
{
  "email": "customer@example.com",
  "plan": "LITE",
  "planName": "Vexel Lite",
  "customer_name": "John Doe"
}
```

---

#### GET `/api/stripe/payment-intent`
**Get payment intent details**

Query parameters:
- `payment_intent`: Stripe payment intent ID

Response:
```json
{
  "email": "customer@example.com",
  "plan": "LITE",
  "planName": "Vexel Lite"
}
```

---

### Licenses Lookup

#### GET `/api/licenses/by-session/:session_id`
**Get license by Stripe session ID**

Used by polling in checkout success page.

Response:
```json
{
  "license_key": "XXXX-XXXX-XXXX-XXXX",
  "plan": "LITE"
}
```

---

#### GET `/api/licenses/by-payment-intent/:pi_id`
**Get license by Stripe payment intent ID**

Response:
```json
{
  "license_key": "XXXX-XXXX-XXXX-XXXX",
  "plan": "LITE"
}
```

---

### Stats & Monitoring

#### GET `/api/admin/stats`
**Get dashboard statistics**

Headers:
```
X-Admin-Key: <admin-key>
```

Response:
```json
{
  "licenses": {
    "total": 42,
    "active": 40
  },
  "requests": {
    "today": 523,
    "failed_today": 2
  }
}
```

---

#### GET `/api/admin/logs`
**Get request logs**

Headers:
```
X-Admin-Key: <admin-key>
```

Query parameters:
- `limit`: Max logs to return (max 500, default 100)

Response:
```json
{
  "logs": [
    {
      "license_key": "XXXX-XXXX-XXXX-XXXX",
      "domain": "store.myshopify.com",
      "status": "success",
      "created_at": "2025-03-26T10:00:00Z"
    }
  ]
}
```

---

### Webhooks

#### POST `/api/webhooks/stripe`
**Stripe webhook endpoint**

This is automatically called by Stripe when payment events occur.

**Events handled:**
- `checkout.session.completed` - Creates license after successful checkout
- `payment_intent.succeeded` - Creates license after payment succeeds

**Signature verification:**
Incoming webhooks are verified using `STRIPE_WEBHOOK_SECRET`.

**Webhook registration:**
1. Go to https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://yourapp.com/api/webhooks/stripe`
3. Select events: `checkout.session.completed`, `payment_intent.succeeded`
4. Copy signing secret to `STRIPE_WEBHOOK_SECRET` env var

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request (validation error) |
| 401 | Unauthorized (invalid admin key) |
| 404 | Resource not found |
| 429 | Too many requests (rate limited) |
| 500 | Server error |

---

## Rate Limiting

- **Support tickets:** 5 per IP per hour
- **License checks:** 100 per minute per license key

---

## Request/Response Format

All APIs use JSON for request and response bodies.

Headers:
- `Content-Type: application/json` (for POST/PUT requests)
- `X-Admin-Key: <key>` (for protected endpoints)

---

## Monitoring & Debugging

### Vercel Logs

Check logs for webhook processing:
```
[Webhook] Processing checkout.session.completed: cs_...
[Webhook] License created: XXXX-XXXX-XXXX-XXXX for user@example.com (LITE)
[Webhook] Welcome email queued for user@example.com
```

### Testing Webhooks

Stripe Dashboard → Developers → Webhooks → Your endpoint → Send test event

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `STRIPE_SECRET_KEY` | Yes | Stripe API key for backend |
| `STRIPE_WEBHOOK_SECRET` | Yes | Webhook signing secret from Stripe |
| `RESEND_API_KEY` | No | Email sending API key |
| `KV_REST_API_URL` | Yes | Upstash Redis REST endpoint |
| `KV_REST_API_TOKEN` | Yes | Upstash Redis auth token |
| `ADMIN_KEY` | Yes | Secret key for admin endpoints |
| `NEXT_PUBLIC_STRIPE_KEY` | Yes | Stripe publishable key (public) |
| `NEXT_PUBLIC_API_URL` | No | Default empty (same origin) |

---

## Examples

### Create License via API

```bash
curl -X POST https://api.example.com/api/admin/licenses \
  -H "X-Admin-Key: your-admin-key" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "domain": "store.myshopify.com",
    "permanent_domain": "store.com",
    "store_name": "My Store",
    "plan": "LITE"
  }'
```

### Check License by Session (Polling)

```bash
curl https://api.example.com/api/licenses/by-session/cs_test_1234
```

### Send Support Reply

```bash
curl -X POST https://api.example.com/api/admin/tickets/1648937521000/reply \
  -H "X-Admin-Key: your-admin-key" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Thanks for your question! Here is the solution..."
  }'
```

---

## Support

For questions about the API, check the `/api/admin/` dashboard or review the source code in `src/routes/`.
