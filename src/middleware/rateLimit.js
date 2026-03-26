const rateLimitBuckets = {};

function rateLimit(ip, endpoint = 'default', maxPerMinute = 60) {
  const key = `${ip}:${endpoint}`;
  const now = Date.now();
  if (!rateLimitBuckets[key]) rateLimitBuckets[key] = [];
  rateLimitBuckets[key] = rateLimitBuckets[key].filter(t => now - t < 60000);
  if (rateLimitBuckets[key].length >= maxPerMinute) return false;
  rateLimitBuckets[key].push(now);
  return true;
}

// Clean up stale rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const key of Object.keys(rateLimitBuckets)) {
    rateLimitBuckets[key] = rateLimitBuckets[key].filter(t => now - t < 60000);
    if (rateLimitBuckets[key].length === 0) delete rateLimitBuckets[key];
  }
}, 5 * 60 * 1000).unref();

module.exports = rateLimit;
