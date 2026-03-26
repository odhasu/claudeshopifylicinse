'use strict';

// Mock KV service so the rate limiter never touches Redis.
jest.mock('../../../src/services/kvService', () => ({
  kvRateLimitIncrement: jest.fn().mockResolvedValue(null), // null → use local in-memory fallback
  kvGetLicenses: jest.fn().mockResolvedValue([]),
  kvSaveLicenses: jest.fn().mockResolvedValue(undefined),
  kvGetTickets: jest.fn().mockResolvedValue([]),
  kvSaveTickets: jest.fn().mockResolvedValue(undefined),
  kvAcquireIdempotencyLock: jest.fn().mockResolvedValue(null),
  kvGetRuntimeStatus: jest.fn().mockReturnValue({ enabled: false }),
  KV_ENABLED: false,
}));

const rateLimit = require('../../../src/middleware/rateLimit');
const { kvRateLimitIncrement } = require('../../../src/services/kvService');

// Use a unique prefix per test run to avoid bucket collisions between test files.
let counter = 0;
function freshIp() {
  return `test-ip-${Date.now()}-${++counter}`;
}

beforeEach(() => {
  jest.clearAllMocks();
  kvRateLimitIncrement.mockResolvedValue(null); // keep KV disabled by default
});

describe('rateLimit — local in-memory fallback', () => {
  test('allows the first request for a new IP/endpoint', async () => {
    const allowed = await rateLimit(freshIp(), 'ep_allow', 5);
    expect(allowed).toBe(true);
  });

  test('allows up to the configured limit', async () => {
    const ip = freshIp();
    const limit = 3;
    for (let i = 0; i < limit; i++) {
      const allowed = await rateLimit(ip, 'ep_limit', limit);
      expect(allowed).toBe(true);
    }
  });

  test('blocks the request that exceeds the limit', async () => {
    const ip = freshIp();
    const limit = 3;
    for (let i = 0; i < limit; i++) {
      await rateLimit(ip, 'ep_block', limit);
    }
    const blocked = await rateLimit(ip, 'ep_block', limit);
    expect(blocked).toBe(false);
  });

  test('different endpoints have independent buckets', async () => {
    const ip = freshIp();
    // Fill up endpoint A
    for (let i = 0; i < 2; i++) await rateLimit(ip, 'ep_A', 2);
    const blockedA = await rateLimit(ip, 'ep_A', 2);
    expect(blockedA).toBe(false);

    // Endpoint B should still be allowed
    const allowedB = await rateLimit(ip, 'ep_B', 2);
    expect(allowedB).toBe(true);
  });

  test('handles null/undefined IP gracefully', async () => {
    const allowed = await rateLimit(null, 'ep_null_ip', 100);
    expect(allowed).toBe(true);
  });

  test('sanitizes IP with multiple forwarded-for values', async () => {
    const ip = '192.168.1.1, 10.0.0.1, 172.16.0.1';
    const allowed = await rateLimit(ip, 'ep_fwd', 100);
    expect(allowed).toBe(true);
  });
});

describe('rateLimit — KV-backed path', () => {
  test('returns true when KV count is within the limit', async () => {
    kvRateLimitIncrement.mockResolvedValue({ count: 5, ttlMs: 60000 });
    const allowed = await rateLimit('10.0.0.1', 'ep_kv', 60);
    expect(allowed).toBe(true);
    expect(kvRateLimitIncrement).toHaveBeenCalled();
  });

  test('returns false when KV count exceeds the limit', async () => {
    kvRateLimitIncrement.mockResolvedValue({ count: 61, ttlMs: 60000 });
    const allowed = await rateLimit('10.0.0.1', 'ep_kv_over', 60);
    expect(allowed).toBe(false);
  });

  test('falls back to local when KV returns null', async () => {
    kvRateLimitIncrement.mockResolvedValue(null);
    const allowed = await rateLimit(freshIp(), 'ep_kv_null', 100);
    expect(allowed).toBe(true);
  });
});
