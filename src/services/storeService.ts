import fs from 'fs';
import path from 'path';
import logger from '../utils/logger';
import type { Store, License } from '../types';

const DATA_DIR = process.env.VERCEL ? '/tmp' : path.join(__dirname, '..', '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');
const INITIAL_STORE: Store = {
  licenses: [],
  request_log: [],
  remote_content: [],
  tickets: [],
  _nextId: 1,
};

try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (_e) { /* ignore */ }

let store: Store = createInitialStore();

function createInitialStore(): Store {
  return {
    licenses: [],
    request_log: [],
    remote_content: [],
    tickets: [],
    _nextId: INITIAL_STORE._nextId,
  };
}

function normalizeStoreShape(): void {
  if (!store || typeof store !== 'object') {
    store = createInitialStore();
    return;
  }

  const defaults = createInitialStore();

  if (!Array.isArray(store.licenses)) store.licenses = defaults.licenses;
  if (!Array.isArray(store.request_log)) store.request_log = defaults.request_log;
  if (!Array.isArray(store.remote_content)) store.remote_content = defaults.remote_content;
  if (!Array.isArray(store.tickets)) store.tickets = defaults.tickets;
  if (!Number.isInteger(store._nextId) || store._nextId < 1) store._nextId = defaults._nextId;
}

function loadStore(): void {
  try {
    if (fs.existsSync(DB_FILE)) {
      store = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }
  } catch (_e) { logger.info('Fresh start - no saved data'); }

  normalizeStoreShape();
}

export function saveStore(): void {
  try { fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2)); } catch (_e) { /* ignore */ }
}

loadStore();

if (!store.tickets) { store.tickets = []; saveStore(); }

// Seed "og" universal license if it doesn't exist
if (!store.licenses.find(l => l.license_key === 'og')) {
  store.licenses.push({
    id: store._nextId++,
    license_key: 'og',
    domain: '*',
    permanent_domain: '*',
    plan: 'unlimited',
    active: true as unknown as number,
    expires_at: null,
    created_at: new Date().toISOString(),
    notes: 'Universal owner license - works on all stores',
    last_verified_at: null,
    request_count: 0,
  } as License);
  saveStore();
  console.log('[Scaled] Seeded universal "og" license');
}

export function getStore(): Store { return store; }

export function nextId(): number { return store._nextId++; }

// Initialize Redis with licenses on first use (lazy init)
let redisInitialized = false;
export async function ensureRedisInitialized(): Promise<void> {
  if (redisInitialized) return;
  try {
    const { kvGetLicenses, kvSaveLicenses, KV_ENABLED } = await import('./kvService');
    if (KV_ENABLED) {
      const redisLicenses = await kvGetLicenses();
      // If Redis is empty, seed it with store.json data
      if (!redisLicenses || redisLicenses.length === 0) {
        console.log('[Init] Seeding Redis with licenses from store.json');
        await kvSaveLicenses(store.licenses);
      }
      redisInitialized = true;
    }
  } catch (e: unknown) {
    console.error('[Init] Error seeding Redis licenses:', (e as Error).message);
  }
}
