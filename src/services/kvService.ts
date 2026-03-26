import { getStore, saveStore } from './storeService';
import type { License, Ticket, KvCache, RateLimitResult, CacheState, KvRuntimeStatus } from '../types';

const UPSTASH_URL   = process.env.KV_REST_API_URL   || process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.KV_REST_API_TOKEN  || process.env.UPSTASH_REDIS_REST_TOKEN;
export const KV_ENABLED    = !!(UPSTASH_URL && UPSTASH_TOKEN);
const UPSTASH_TIMEOUT_MS = Number(process.env.KV_HTTP_TIMEOUT_MS || 3000);
const UPSTASH_RETRY_COUNT = Math.max(0, Number(process.env.KV_HTTP_RETRY_COUNT || 1));
const KV_CACHE_TTL_MS = Math.max(0, Number(process.env.KV_CACHE_TTL_MS || 5000));

let ticketsCache: KvCache<Ticket[]> = { data: null, expiresAt: 0 };
let licensesCache: KvCache<License[]> = { data: null, expiresAt: 0 };

const KV_KEYS = {
  tickets: 'vexel_tickets',
  licenses: 'vexel_licenses',
} as const;

type CacheKind = keyof typeof KV_KEYS;

function clone<T>(value: T): T {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function readCache<T>(cache: KvCache<T>): T | null {
  if (!cache.data || Date.now() >= cache.expiresAt) return null;
  return clone(cache.data);
}

function writeCache(kind: CacheKind, data: Ticket[] | License[]): void {
  const entry = { data: clone(data), expiresAt: Date.now() + KV_CACHE_TTL_MS };
  if (kind === 'tickets') ticketsCache = entry as KvCache<Ticket[]>;
  if (kind === 'licenses') licensesCache = entry as KvCache<License[]>;
}

function maybeWriteCache(kind: CacheKind, data: Ticket[] | License[]): void {
  if (KV_CACHE_TTL_MS > 0) writeCache(kind, data);
}

interface KvGetCollectionOptions<T> {
  kind: CacheKind;
  key: string;
  cache: KvCache<T>;
  fallback: () => T;
  errorLabel: string;
  fallbackOnReadError: boolean;
}

async function kvGetCollection<T extends License[] | Ticket[]>({
  kind,
  key,
  cache,
  fallback,
  errorLabel,
  fallbackOnReadError,
}: KvGetCollectionOptions<T>): Promise<T> {
  if (KV_ENABLED) {
    const cached = readCache(cache);
    if (cached) return cached as T;
    try {
      const raw = await upstashCmd(['GET', key]);
      const data = raw ? JSON.parse(raw as string) : [];
      maybeWriteCache(kind, data);
      return data as T;
    } catch (e: unknown) {
      console.error(errorLabel, (e as Error).message);
      if (fallbackOnReadError) return fallback();
    }
  }

  return fallback();
}

interface KvSaveCollectionOptions {
  kind: CacheKind;
  key: string;
  data: License[] | Ticket[];
  fallbackSave: (data: License[] | Ticket[]) => void;
  errorLabel: string;
}

async function kvSaveCollection({
  kind,
  key,
  data,
  fallbackSave,
  errorLabel,
}: KvSaveCollectionOptions): Promise<void> {
  if (KV_ENABLED) {
    try {
      await upstashCmd(['SET', key, JSON.stringify(data)]);
      maybeWriteCache(kind, data);
      return;
    } catch (e: unknown) {
      console.error(errorLabel, (e as Error).message);
    }
  }

  fallbackSave(data);
}

function cacheState(cache: KvCache<unknown>): CacheState {
  const now = Date.now();
  const remainingMs = cache.expiresAt > now ? cache.expiresAt - now : 0;
  return {
    warm: Boolean(cache.data) && remainingMs > 0,
    ttl_remaining_ms: remainingMs,
  };
}

export function kvGetRuntimeStatus(): KvRuntimeStatus {
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

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

interface KvError extends Error {
  statusCode?: number;
}

function isRetryableError(err: unknown): boolean {
  if (!err) return false;
  const error = err as KvError;
  if (error.name === 'AbortError') return true;
  if (typeof error.statusCode === 'number') {
    return error.statusCode === 429 || error.statusCode >= 500;
  }
  return false;
}

async function upstashCmd(command: string[]): Promise<unknown> {
  let lastError: Error | undefined;
  for (let attempt = 0; attempt <= UPSTASH_RETRY_COUNT; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), UPSTASH_TIMEOUT_MS);
    try {
      const res = await fetch(UPSTASH_URL!, {
        method: 'POST',
        headers: { Authorization: `Bearer ${UPSTASH_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(command),
        signal: controller.signal,
      });

      if (!res.ok) {
        const error: KvError = new Error(`[KV] HTTP ${res.status}`);
        error.statusCode = res.status;
        throw error;
      }

      const data = await res.json() as { error?: string; status?: number; result?: unknown };
      if (data.error) {
        const error: KvError = new Error(`[KV] ${data.error}`);
        error.statusCode = typeof data.status === 'number' ? data.status : undefined;
        throw error;
      }
      return data.result;
    } catch (err: unknown) {
      lastError = err as Error;
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

export async function kvGetTickets(): Promise<Ticket[]> {
  return kvGetCollection<Ticket[]>({
    kind: 'tickets',
    key: KV_KEYS.tickets,
    cache: ticketsCache,
    fallback: () => getStore().tickets || [],
    errorLabel: '[KV] read error:',
    fallbackOnReadError: false,
  });
}

export async function kvSaveTickets(tickets: Ticket[]): Promise<void> {
  await kvSaveCollection({
    kind: 'tickets',
    key: KV_KEYS.tickets,
    data: tickets,
    fallbackSave: (nextTickets) => {
      getStore().tickets = nextTickets as Ticket[];
      saveStore();
    },
    errorLabel: '[KV] write error:',
  });
}

export async function kvGetLicenses(): Promise<License[]> {
  return kvGetCollection<License[]>({
    kind: 'licenses',
    key: KV_KEYS.licenses,
    cache: licensesCache,
    fallback: () => getStore().licenses || [],
    errorLabel: '[KV] licenses read error:',
    fallbackOnReadError: true,
  });
}

export async function kvSaveLicenses(licenses: License[]): Promise<void> {
  await kvSaveCollection({
    kind: 'licenses',
    key: KV_KEYS.licenses,
    data: licenses,
    fallbackSave: (nextLicenses) => {
      getStore().licenses = nextLicenses as License[];
      saveStore();
    },
    errorLabel: '[KV] licenses write error:',
  });
}

export async function kvRateLimitIncrement(bucketKey: string, windowMs: number): Promise<RateLimitResult | null> {
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
  } catch (e: unknown) {
    console.error('[KV] rate limit error:', (e as Error).message);
    return null;
  }
}

export async function kvAcquireIdempotencyLock(lockKey: string, ttlMs: number): Promise<boolean | null> {
  if (!KV_ENABLED) return null;
  try {
    const result = await upstashCmd(['SET', lockKey, '1', 'NX', 'PX', String(ttlMs)]);
    return result === 'OK';
  } catch (e: unknown) {
    console.error('[KV] idempotency lock error:', (e as Error).message);
    return null;
  }
}
