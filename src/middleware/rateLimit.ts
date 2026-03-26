import { kvRateLimitIncrement } from '../services/kvService';

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const rateLimitBuckets: Record<string, RateLimitBucket> = {};

function normalizeIp(ip: string | undefined | null): string {
  if (!ip) return 'unknown';
  const value = String(ip).split(',')[0].trim();
  // Keep bucket keys bounded and predictable to avoid memory pressure from crafted headers.
  const safe = value.replace(/[^a-zA-Z0-9:._-]/g, '').slice(0, 64);
  return safe || 'unknown';
}

export default async function rateLimit(
  ip: string | undefined | null,
  endpoint: string = 'default',
  maxPerMinute: number = 60,
  windowMs: number = 60000,
): Promise<boolean> {
  const safeMaxPerMinute = Number.isFinite(maxPerMinute) ? Math.max(1, Math.floor(maxPerMinute)) : 60;
  const safeWindowMs = Number.isFinite(windowMs) ? Math.max(1000, Math.floor(windowMs)) : 60000;
  const safeEndpoint = String(endpoint || 'default').replace(/[^a-zA-Z0-9:_-]/g, '').slice(0, 64) || 'default';

  const normalizedIp = normalizeIp(ip);
  const key = `${normalizedIp}:${safeEndpoint}`;

  // Use shared KV counter in production so limits survive scale-out/serverless cold starts.
  const kvResult = await kvRateLimitIncrement(`rl:${key}`, safeWindowMs);
  if (kvResult) {
    return kvResult.count <= safeMaxPerMinute;
  }

  // Local fallback for development or KV outages.
  const now = Date.now();
  const bucket = rateLimitBuckets[key];
  if (!bucket || now >= bucket.resetAt) {
    rateLimitBuckets[key] = { count: 1, resetAt: now + safeWindowMs };
    return true;
  }
  if (bucket.count >= safeMaxPerMinute) return false;
  bucket.count += 1;
  return true;
}

// Clean up stale rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const key of Object.keys(rateLimitBuckets)) {
    if (now >= rateLimitBuckets[key].resetAt) delete rateLimitBuckets[key];
  }
}, 5 * 60 * 1000).unref();
