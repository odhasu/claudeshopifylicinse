const { getStore, saveStore } = require('./storeService');

const UPSTASH_URL   = process.env.KV_REST_API_URL   || process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.KV_REST_API_TOKEN  || process.env.UPSTASH_REDIS_REST_TOKEN;
const KV_ENABLED    = !!(UPSTASH_URL && UPSTASH_TOKEN);
const UPSTASH_TIMEOUT_MS = Number(process.env.KV_HTTP_TIMEOUT_MS || 3000);
const UPSTASH_RETRY_COUNT = Math.max(0, Number(process.env.KV_HTTP_RETRY_COUNT || 1));
const KV_CACHE_TTL_MS = Math.max(0, Number(process.env.KV_CACHE_TTL_MS || 5000));

let ticketsCache = { data: null, expiresAt: 0 };
let licensesCache = { data: null, expiresAt: 0 };

const KV_KEYS = {
  tickets: 'vexel_tickets',
  licenses: 'vexel_licenses',
};

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function readCache(cache) {
  if (!cache.data || Date.now() >= cache.expiresAt) return null;
  return clone(cache.data);
}

function writeCache(kind, data) {
  const entry = { data: clone(data), expiresAt: Date.now() + KV_CACHE_TTL_MS };
  if (kind === 'tickets') ticketsCache = entry;
  if (kind === 'licenses') licensesCache = entry;
}

function maybeWriteCache(kind, data) {
  if (KV_CACHE_TTL_MS > 0) writeCache(kind, data);
}

async function kvGetCollection({
  kind,
  key,
  cache,
  fallback,
  errorLabel,
  fallbackOnReadError,
}) {
  if (KV_ENABLED) {
    const cached = readCache(cache);
    if (cached) return cached;
    try {
      const raw = await upstashCmd(['GET', key]);
      const data = raw ? JSON.parse(raw) : [];
      maybeWriteCache(kind, data);
      return data;
    } catch (e) {
      console.error(errorLabel, e.message);
      if (fallbackOnReadError) return fallback();
    }
  }

  return fallback();
}

async function kvSaveCollection({
  kind,
  key,
  data,
  fallbackSave,
  errorLabel,
}) {
  if (KV_ENABLED) {
    try {
      await upstashCmd(['SET', key, JSON.stringify(data)]);
      maybeWriteCache(kind, data);
      return;
    } catch (e) {
      console.error(errorLabel, e.message);
    }
  }

  fallbackSave(data);
}

function cacheState(cache) {
  const now = Date.now();
  const remainingMs = cache.expiresAt > now ? cache.expiresAt - now : 0;
  return {
    warm: Boolean(cache.data) && remainingMs > 0,
    ttl_remaining_ms: remainingMs,
  };
}

function kvGetRuntimeStatus() {
  return {
    enabled: KV_ENABLED,
    timeout_ms: UPSTASH_TIMEOUT_MS,
    retry_count: UPSTASH_RETRY_COUNT,
    cache_ttl_ms: KV_CACHE_TTL_MS,
    caches: {
      tickets: cacheState(ticketsCache),
      licenses: cacheState(licensesCache),
    },
  };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isRetryableError(err) {
  if (!err) return false;
  if (err.name === 'AbortError') return true;
  if (typeof err.statusCode === 'number') {
    return err.statusCode === 429 || err.statusCode >= 500;
  }
  return false;
}

async function upstashCmd(command) {
  let lastError;
  for (let attempt = 0; attempt <= UPSTASH_RETRY_COUNT; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), UPSTASH_TIMEOUT_MS);
    try {
      const res = await fetch(UPSTASH_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${UPSTASH_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(command),
        signal: controller.signal,
      });

      if (!res.ok) {
        const error = new Error(`[KV] HTTP ${res.status}`);
        error.statusCode = res.status;
        throw error;
      }

      const data = await res.json();
      if (data.error) {
        const error = new Error(`[KV] ${data.error}`);
        error.statusCode = typeof data.status === 'number' ? data.status : undefined;
        throw error;
      }
      return data.result;
    } catch (err) {
      lastError = err;
      if (attempt < UPSTASH_RETRY_COUNT && isRetryableError(err)) {
        await sleep((attempt + 1) * 100);
        continue;
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }
  throw lastError || new Error('[KV] Unknown Upstash error');
}

async function kvGetTickets() {
  return kvGetCollection({
    kind: 'tickets',
    key: KV_KEYS.tickets,
    cache: ticketsCache,
    fallback: () => getStore().tickets || [],
    errorLabel: '[KV] read error:',
    fallbackOnReadError: false,
  });
}

async function kvSaveTickets(tickets) {
  await kvSaveCollection({
    kind: 'tickets',
    key: KV_KEYS.tickets,
    data: tickets,
    fallbackSave: (nextTickets) => {
      getStore().tickets = nextTickets;
      saveStore();
    },
    errorLabel: '[KV] write error:',
  });
}

async function kvGetLicenses() {
  return kvGetCollection({
    kind: 'licenses',
    key: KV_KEYS.licenses,
    cache: licensesCache,
    fallback: () => getStore().licenses || [],
    errorLabel: '[KV] licenses read error:',
    fallbackOnReadError: true,
  });
}

async function kvSaveLicenses(licenses) {
  await kvSaveCollection({
    kind: 'licenses',
    key: KV_KEYS.licenses,
    data: licenses,
    fallbackSave: (nextLicenses) => {
      getStore().licenses = nextLicenses;
      saveStore();
    },
    errorLabel: '[KV] licenses write error:',
  });
}

async function kvRateLimitIncrement(bucketKey, windowMs) {
  if (!KV_ENABLED) return null;
  try {
    const count = Number(await upstashCmd(['INCR', bucketKey]));
    if (count === 1) {
      await upstashCmd(['PEXPIRE', bucketKey, String(windowMs)]);
      return { count, ttlMs: windowMs };
    }
    const ttlMsRaw = await upstashCmd(['PTTL', bucketKey]);
    const ttlMs = Number(ttlMsRaw);
    return { count, ttlMs: ttlMs > 0 ? ttlMs : windowMs };
  } catch (e) {
    console.error('[KV] rate limit error:', e.message);
    return null;
  }
}

async function kvAcquireIdempotencyLock(lockKey, ttlMs) {
  if (!KV_ENABLED) return null;
  try {
    const result = await upstashCmd(['SET', lockKey, '1', 'NX', 'PX', String(ttlMs)]);
    return result === 'OK';
  } catch (e) {
    console.error('[KV] idempotency lock error:', e.message);
    return null;
  }
}

module.exports = {
  kvGetTickets,
  kvSaveTickets,
  kvGetLicenses,
  kvSaveLicenses,
  kvRateLimitIncrement,
  kvAcquireIdempotencyLock,
  kvGetRuntimeStatus,
  KV_ENABLED,
};
