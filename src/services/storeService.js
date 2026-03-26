const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const DATA_DIR = process.env.VERCEL ? '/tmp' : path.join(__dirname, '..', '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');
const INITIAL_STORE = {
  licenses: [],
  request_log: [],
  remote_content: [],
  tickets: [],
  _nextId: 1,
};

try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch(e) {}

let store = createInitialStore();

function createInitialStore() {
  return {
    licenses: [],
    request_log: [],
    remote_content: [],
    tickets: [],
    _nextId: INITIAL_STORE._nextId,
  };
}

function normalizeStoreShape() {
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

function loadStore() {
  try {
    if (fs.existsSync(DB_FILE)) {
      store = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }
  } catch(e) { logger.info('Fresh start - no saved data'); }

  normalizeStoreShape();
}

function saveStore() {
  try { fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2)); } catch(e) {}
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
    active: true,
    expires_at: null,
    created_at: new Date().toISOString(),
    notes: 'Universal owner license - works on all stores'
  });
  saveStore();
  console.log('[Scaled] Seeded universal "og" license');
}

function getStore() { return store; }

function nextId() { return store._nextId++; }

// Initialize Redis with licenses on first use (lazy init)
let redisInitialized = false;
async function ensureRedisInitialized() {
  if (redisInitialized) return;
  try {
    const { kvGetLicenses, kvSaveLicenses, KV_ENABLED } = require('./kvService');
    if (KV_ENABLED) {
      const redisLicenses = await kvGetLicenses();
      // If Redis is empty, seed it with store.json data
      if (!redisLicenses || redisLicenses.length === 0) {
        console.log('[Init] Seeding Redis with licenses from store.json');
        await kvSaveLicenses(store.licenses);
      }
      redisInitialized = true;
    }
  } catch(e) { 
    console.error('[Init] Error seeding Redis licenses:', e.message);
  }
}

module.exports = { getStore, saveStore, nextId, ensureRedisInitialized };
