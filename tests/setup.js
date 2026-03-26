'use strict';

// Set environment variables before any module code runs.
// setupFiles runs in the test-worker process, before each test file.
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'silent';

// Provide a known admin key so requireAdmin.js doesn't fall back to the insecure default.
process.env.ADMIN_KEY = 'test-admin-key-ci-safe';

// Route storeService file I/O to /tmp so the repository data/ folder is never written.
process.env.VERCEL = '1';

// Prevent stripeService from throwing "No Stripe key set" at module load time.
process.env.STRIPE_SECRET_KEY = 'sk_test_placeholder_for_unit_tests';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_placeholder';

// Ensure KV (Redis) is disabled — no KV_REST_API_URL means the code falls back
// to the local JSON store which is fully mocked in integration tests.
delete process.env.KV_REST_API_URL;
delete process.env.KV_REST_API_TOKEN;
