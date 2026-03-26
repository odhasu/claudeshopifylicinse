# Development Guidelines

Best practices and conventions for developing on the Vexel Themes project.

## Code Quality Standards

### Frontend (React/Next.js)

#### Component Structure
```tsx
// 1. Imports (organized by category)
import { useState, useEffect, useCallback, useMemo } from "react";
import { ExternalIcon } from "lucide-react";
import Link from "next/link";
import { SomeComponent } from "@/components/ui";

// 2. Types
interface Props {
  id: number;
  onClose?: () => void;
}

// 3. Component
export default function MyComponent({ id, onClose }: Props) {
  // Hooks first
  const [state, setState] = useState("");
  const memoized = useMemo(() => expensiveCalc(), [deps]);
  const callback = useCallback(() => {}, [deps]);

  // Effects
  useEffect(() => {
    fetch(`/api/item/${id}`).then(setItem);
  }, [id]);

  // Handlers
  function handleClick() { /* ... */ }

  // Render
  return <div>Content</div>;
}
```

#### Best Practices
- ✅ Use `useCallback` for event handlers to prevent unnecessary re-renders
- ✅ Use `useMemo` for expensive calculations (filtering, mapping large arrays)
- ✅ Destructure props at function signature
- ✅ Use `React.memo()` for list items that don't need to re-render
- ✅ Keep components under 300 lines (extract sub-components if larger)
- ✅ Always provide dependency arrays for hooks

#### Anti-Patterns to Avoid
- ❌ Inline function definitions in JSX (`onClick={() => fn()}` creates new function each render)
- ❌ Missing dependency arrays in useEffect
- ❌ Components that render object/array literals from props
- ❌ Fetching in event handlers without async/await error handling
- ❌ Not setting loading/error states for async operations

#### Error Handling
```tsx
// Good
const [error, setError] = useState<string | null>(null);
const [loading, setLoading] = useState(false);

async function handleSubmit() {
  setLoading(true);
  setError(null);
  try {
    const res = await fetch("/api/...");
    if (!res.ok) throw new Error("Failed");
    const data = await res.json();
    // Success logic
  } catch (e) {
    setError(e instanceof Error ? e.message : "Unknown error");
  } finally {
    setLoading(false);
  }
}
```

---

### Backend (Node.js/Express)

#### Route Handler Pattern
```javascript
// Always include error handling
router.post('/endpoint', validate(schema), async (req, res) => {
  try {
    // 1. Use validated request body
    const { field1, field2 } = req.body;
    
    // 2. Check auth if needed
    const adminKey = req.headers['x-admin-key'];
    if (!adminKey) return res.status(401).json({ error: 'Unauthorized' });
    
    // 3. Perform action
    const result = await doSomething();
    
    // 4. Return success
    res.json({ success: true, data: result });
    
  } catch (error) {
    console.error('[Feature] Error description:', error);
    res.status(500).json({ error: 'Failed to complete action' });
  }
});
```

#### Logging Pattern
```javascript
// Use context prefixes for debugging
console.log('[Webhook] Processing checkout session: ' + sessionId);
console.error('[License] Failed to validate: ' + error.message);
console.warn('[Store] Cache miss, using fallback');

// NOT:
console.log('done'); // ❌ Too vague
console.log(error); // ❌ Just dump object
```

#### Error Handling Checklist
- ✅ All async operations wrapped in try/catch
- ✅ Errors logged with context prefix
- ✅ User-friendly error messages returned
- ✅ Don't expose internal error details to client
- ✅ Set appropriate HTTP status codes (400, 401, 404, 500)

#### Database Operations
```javascript
// Always handle Redis fallback
async function getStore() {
  try {
    const cached = await redis.get('store_cache');
    if (cached) return JSON.parse(cached);
  } catch (e) {
    console.warn('[Store] Redis read failed, using file');
  }
  
  // Fallback
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}
```

---

## Testing Strategy

### Manual Testing Checklist

#### Authentication & Authorization
- [ ] Invalid admin key rejects request
- [ ] Missing X-Admin-Key header returns 401
- [ ] Valid key grants access
- [ ] License key validation works correctly

#### Stripe Integration
- [ ] Webhook signature verification validates
- [ ] Invalid signatures rejected
- [ ] Webhook creates license in Redis
- [ ] Fallback to file storage works
- [ ] Email is sent after purchase (or fails gracefully)

#### API Validation
- [ ] Invalid email rejected (400)
- [ ] Missing required fields rejected (400)
- [ ] Oversized payloads rejected (413)
- [ ] Rate limiting enforced

#### Error Scenarios
- [ ] Redis unavailable → Fallback to JSON works
- [ ] Email API down → License still created
- [ ] Stripe signature verification fails → Webhook rejected
- [ ] Database corruption → Graceful recovery

### Testing with Stripe
```bash
# Use Stripe Test Mode
Test Card: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits

# Test webhook in Stripe Dashboard
- Developers → Webhooks → Your endpoint
- Send test event → checkout.session.completed
- Check logs for successful processing
```

---

## Performance Requirements

### Response Time Targets
| Endpoint | Target | Priority |
|----------|--------|----------|
| GET /api/admin/tickets | < 200ms | High |
| GET /api/licenses/by-session | < 100ms | Critical |
| POST /api/admin/tickets/{id}/reply | < 500ms | High |
| POST /api/webhooks/stripe | < 400ms | High |
| GET /api/render | < 300ms | High |

### Bundle Size Targets
- Frontend: < 150KB gzipped
- JS: < 100KB gzipped
- CSS: < 30KB gzipped

### Implementation Notes
- Use `useMemo` for derived state
- Lazy load heavy libraries (Stripe, Framer Motion)
- Add `loading="lazy"` to images
- Cache API responses where appropriate
- Use Redis for frequently accessed data

---

## Database Schema

### Licenses Table
```json
{
  "id": number,
  "license_key": "XXXX-XXXX-XXXX-XXXX",
  "username": "store_owner",
  "domain": "store.myshopify.com",
  "permanent_domain": "store.com",
  "store_name": "My Store",
  "plan": "LITE|PRO",
  "active": 1|0,
  "created_at": "2025-03-26T10:00:00Z",
  "expires_at": "2025-12-31T23:59:59Z|null",
  "last_verified_at": "2025-03-26T15:30:00Z|null",
  "request_count": 42,
  "customer_name": "John Doe|null",
  "stripe_session_id": "cs_test_...|null",
  "stripe_payment_intent_id": "pi_test_...|null",
  "notes": "Auto-created via Stripe|null"
}
```

### Tickets Table
```json
{
  "id": 1648937521000,
  "name": "John Doe",
  "email": "john@example.com",
  "message": "How do I activate my license?",
  "status": "open|in-progress|closed",
  "read": false,
  "replies": [
    {
      "id": 1648937521001,
      "message": "You can activate by entering your license key...",
      "sent_at": "2025-03-26T10:05:00Z"
    }
  ],
  "created_at": "2025-03-26T10:00:00Z",
  "updated_at": "2025-03-26T10:05:00Z"
}
```

---

## Environment Variables

### Required (Production)
```bash
# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_KEY=pk_...

# Email
RESEND_API_KEY=re_...

# Redis
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...

# Auth
ADMIN_KEY=your-secure-key-here
```

### Optional
```bash
ALLOWED_ORIGINS=http://localhost:3001,https://example.com
SITE_URL=https://example.com
RESEND_FROM_EMAIL=noreply@vexel.app
PORT=3000
```

### Local Development
```bash
# Create .env file with local values
cp .env.example .env
# Edit .env with your test keys
```

---

## Security Checklist

- ✅ All user inputs validated with Zod
- ✅ SQL injection prevented (no raw SQL)
- ✅ XSS prevented (React escaping + CSP headers)
- ✅ CSRF tokens on state-changing requests
- ✅ Secrets not in code (environment variables)
- ✅ Rate limiting on public endpoints
- ✅ Admin endpoints require authentication
- ✅ Production blocks admin endpoints when `ADMIN_KEY` is missing
- ✅ Webhook signatures verified
- ✅ HTTPS enforced in production
- ✅ Keep dependencies updated

---

## Git Commit Messages

### Format
```
<type>: <subject>

<body>

<footer>
```

### Types
- `feat:` New feature
- `fix:` Bug fix
- `perf:` Performance improvement
- `refactor:` Code reorganization (no functionality change)
- `docs:` Documentation
- `chore:` Maintenance, dependencies
- `test:` Test additions/changes

### Examples
```
feat: add exponential backoff to license polling

- Reduces average wait time from 6s to 2s
- Improves UX on slow networks
- Max delay increased to 20s for reliability

Closes #42
```

```
fix: remove email client code from admin reply

The backend now auto-sends emails via Resend.
Removed window.open(mailto:...) that was no longer needed.
```

---

## Documentation Standards

### Code Comments
```javascript
// Use for "why" not "what"
// ✅ Good:
if (!isAdmin) return; // Endpoints require admin key

// ❌ Bad:
if (!isAdmin) return; // If not admin, return
```

### README Updates
- Update when adding features
- Add setup instructions for new dependencies
- Document breaking changes

### API Documentation
- Update API_DOCUMENTATION.md for new endpoints
- Include request/response examples
- Document error cases

---

## Release Checklist

Before deploying to production:

- [ ] All tests passing
- [ ] No console errors/warnings
- [ ] Performance targets met
- [ ] Security checklist completed
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Stripe webhook registered
- [ ] Email templates tested
- [ ] Error pages configured
- [ ] Monitoring alerts set up
- [ ] Documentation updated
- [ ] Commit messages clear
- [ ] No secrets in code

---

## Troubleshooting Guide

### Common Issues

#### "Webhook signature verification failed"
- [ ] Check STRIPE_WEBHOOK_SECRET matches Stripe Dashboard
- [ ] Verify webhook is registered in Stripe Dashboard
- [ ] Check raw request body hasn't been modified

#### "License not created"
- [ ] Check Vercel logs for webhook errors
- [ ] Verify Redis connection (KV_REST_API_URL/TOKEN)
- [ ] Check if license already exists (duplicate event)
- [ ] Check email in webhook payload

#### "Rate limit exceeded"
- [ ] Check IP-based rate limits
- [ ] Clear rate limit cache if needed
- [ ] Increase limits in code if necessary

#### "Redis connection timeout"
- [ ] Verify KV_REST_API_URL is accessible
- [ ] Check Upstash service status
- [ ] Review firewall/VPN settings
- [ ] Should fall back to JSON file

---

## Resources

- [Next.js Docs](https://nextjs.org/)
- [Express.js Guide](https://expressjs.com/)
- [Stripe API Documentation](https://stripe.com/docs/api)
- [Zod Validation](https://zod.dev/)
- [React Best Practices](https://react.dev/)
