# Purchase Automation Setup Guide

This document explains how the automatic license creation system works and what needs to be configured for it to function properly.

## How It Works

When a customer completes a purchase:

1. **Payment Captured** → Stripe processes the payment
2. **Webhook Triggered** → Stripe sends webhook event to `/api/webhooks/stripe`
3. **License Generated** → System creates unique license key automatically
4. **Email Sent** → Welcome email with license key sent to customer
5. **Frontend Confirmation** → Success page polls API and displays license key

## Prerequisites & Configuration

### 1. **Stripe Webhook Registration** ⚠️ CRITICAL

The webhook endpoint **must be registered** in your Stripe Dashboard:

#### Steps:
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **Webhooks**
3. Click **Add endpoint**
4. Enter endpoint URL: `https://claudecodethemeshopify.vercel.app/api/webhooks/stripe`
   - Or your custom domain + `/api/webhooks/stripe`
5. Select events to listen for:
   - ✅ `checkout.session.completed`
   - ✅ `payment_intent.succeeded`
6. Click **Add endpoint**
7. Copy the **Signing secret** (starts with `whsec_`)
8. Add to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

**Without this, webhooks will not fire and no licenses will be created.**

---

### 2. **Environment Variables** (Vercel Project Settings)

Required variables for automatic license creation:

| Variable | Value | Purpose |
|----------|-------|---------|
| `STRIPE_SECRET_KEY` | Your Stripe Secret Key | Authenticate with Stripe API |
| `STRIPE_WEBHOOK_SECRET` | Webhook Signing Secret | Verify webhooks are from Stripe |
| `RESEND_API_KEY` | Resend API Key | Send welcome emails with license key |
| `KV_REST_API_URL` | Upstash Redis URL | Store licenses persistently |
| `KV_REST_API_TOKEN` | Upstash Redis Token | Authenticate with Redis |

Optional:
- `RESEND_FROM_EMAIL` - Sender email (defaults to `noreply@vexel.app`)
- `SITE_URL` - Base URL for links in emails (defaults to vercel app URL)
- `PUBLIC_BASE_URL` - Canonical public origin used for Stripe success/cancel redirects
- `CHECKOUT_ALLOWED_ORIGINS` - Comma-separated allowlist for checkout request origins (recommended in production)

#### To Add Variables:
1. Go to your Vercel Project → **Settings** → **Environment Variables**
2. Add each variable
3. Redeploy for changes to take effect

---

## Testing the Automation

### Manual Test (Stripe Dashboard)

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click your webhook endpoint
3. Click **Send test event**
4. Select `checkout.session.completed`
5. Modify the test data:
   ```json
   {
     "object": {
       "id": "cs_test_123456",
       "customer_details": {
         "email": "test@example.com",
         "name": "Test Customer"
       },
       "metadata": {
         "plan": "PRO"
       }
     }
   }
   ```
6. Click **Send test event**

#### Verify Success:
- ✅ Check Vercel logs for: `[Webhook] License created: XXXX-XXXX-XXXX-XXXX`
- ✅ License appears in `/api/admin/licenses/` (if ADMIN_KEY set)
- ✅ Welcome email sent to `test@example.com`

---

### Real Purchase Test

1. Go to https://claudecodethemeshopify.vercel.app/theme/pricing
2. Click **Purchase** on any plan
3. Use Stripe test card: `4242 4242 4242 4242` (exp: any future date, CVC: any 3 digits)
4. Complete checkout
5. ✅ Success page should show license key within 1-2 seconds
6. ✅ Check email inbox for welcome email with license key

---

## Debugging Issues

### Issue: "License not ready yet" on success page

**Cause:** Webhook took >10 seconds to process (rare)

**Solution:** Wait 10-15 seconds, refresh the page, or check email for the key

---

### Issue: No email received

**Cause:** `RESEND_API_KEY` not set in environment variables

**Solution:**
1. Add `RESEND_API_KEY` to Vercel environment variables
2. Redeploy: `git push`
3. License is still created (email is optional)

---

### Issue: Webhook not firing ("License not ready yet" always)

**Causes:**
1. Webhook endpoint not registered in Stripe Dashboard
2. Wrong endpoint URL registered
3. `STRIPE_WEBHOOK_SECRET` not set or incorrect

**Solution:**
1. Verify webhook in Stripe Dashboard exists and is active
2. Check Stripe Dashboard → Webhooks → Your endpoint → **Events**
3. Verify `STRIPE_WEBHOOK_SECRET` matches the signing secret
4. Check Vercel logs for: `[Webhook] Signature verification failed`

---

### Issue: License created but can't activate in theme

**Cause:** License key format issue or key not in system yet

**Solution:**
1. Use the exact key from email or success page (case-sensitive)
2. Wait 1-2 seconds if just purchased
3. Check `/api/admin/licenses/:key` endpoint (if ADMIN_KEY set)

---

## System Architecture

```
Customer Purchase Flow:
┌─────────────────────────────────────────────────────────┐
│ 1. Frontend: /theme/pricing → Stripe Checkout          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Stripe API: Create checkout session                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Customer Payment: Redirected to Stripe's hosted UI   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Payment Success: Redirect to /theme/checkout/success │
│    Frontend starts polling /api/licenses/by-session/:id │
└────────────────────┬────────────────────────────────────┘
                     │
    ┌────────────────┴────────────────┐
    │ (Parallel)                      │
    ↓                                 ↓
┌──────────────────────┐   ┌──────────────────────┐
│ 5a. Webhook Trigger: │   │ 5b. Frontend Poll:   │
│ /api/webhooks/stripe│   │ Retry up to 6 times  │
│ - Verify signature   │   │ 2s delay between    │
│ - Create license     │   │ (Total: 10 seconds) │
│ - Send email         │   │                      │
│ - Update Redis KV    │   │                      │
└──────────────────────┘   └──────────────────────┘
    │                             │
    ↓                             ↓
┌──────────────────────────────────────────────┐
│ 6. Success Page: Display license key         │
│    (once webhook completes & email sent)     │
└──────────────────────────────────────────────┘
```

---

## Key Files

| File | Purpose |
|------|---------|
| `src/routes/stripe.js` | Checkout/webhook endpoints |
| `src/services/licenseService.js` | License generation & validation |
| `src/services/emailService.js` | Welcome email templates |
| `src/services/kvService.js` | Redis persistence |
| `frontend/src/app/theme/checkout/success/page.tsx` | Success page with polling |
| `data/store.json` | Local license database (fallback) |

---

## License Key Format

Generated format: `XXXX-XXXX-XXXX-XXXX`
- Example: `A3D5-7F2B-E9C1-D6A4`
- Stored in Redis KV + local JSON
- Linked to Stripe session/payment intent for deduplication
- Includes metadata: email, plan, created_at, stripe_ids

---

## Monitoring & Observability

### Check Webhook Health (Vercel Logs)
```
[Webhook] Processing checkout.session.completed: cs_...
[Webhook] License created: XXXX-XXXX-XXXX-XXXX for user@example.com (LITE)
[Webhook] Welcome email queued for user@example.com
```

### Check License Lookup (Vercel Logs)
```
GET /api/licenses/by-session/cs_... → Found in Redis
GET /api/licenses/by-payment-intent/pi_... → Found in local store (fallback)
```

### Verify Redis Connection
Check `ensureRedisInitialized()` logs in webhook handler

### Monitor Email Delivery
Resend Dashboard → Emails → Check delivery status for welcome emails

---

## Production Checklist

- [ ] `STRIPE_WEBHOOK_SECRET` added to Vercel environment variables
- [ ] Webhook endpoint registered in Stripe Dashboard
- [ ] `PUBLIC_BASE_URL` set to your canonical domain (for safe checkout redirects)
- [ ] `CHECKOUT_ALLOWED_ORIGINS` set (comma-separated trusted domains)
- [ ] `RESEND_API_KEY` set for customer emails
- [ ] `KV_REST_API_URL` & `KV_REST_API_TOKEN` configured (Upstash)
- [ ] Test webhook in Stripe Dashboard sending successfully
- [ ] Test real purchase with Stripe test card
- [ ] Verify license appears on success page within 2 seconds
- [ ] Verify welcome email arrives with license key
- [ ] License key works when entered in Shopify theme settings

---

## Support

If automatic license creation isn't working:

1. Check Vercel logs for errors
2. Verify all environment variables are set
3. Test webhook endpoint manually in Stripe Dashboard
4. Check email inbox (may be in spam/promotions)
5. Review webhook signing secret matches Stripe Dashboard

For questions, check `/frontend/docs/` directory for detailed guides.
