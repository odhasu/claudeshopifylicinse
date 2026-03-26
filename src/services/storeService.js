const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const DATA_DIR = process.env.VERCEL ? '/tmp' : path.join(__dirname, '..', '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch(e) {}

let store = { licenses: [], request_log: [], remote_content: [], tickets: [], _nextId: 1 };

function loadStore() {
  try {
    if (fs.existsSync(DB_FILE)) {
      store = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }
  } catch(e) { logger.info('Fresh start — no saved data'); }
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
    notes: 'Universal owner license — works on all stores'
  });
  saveStore();
  console.log('[Scaled] Seeded universal "og" license');
}

// Initialize Redis with licenses from store.json on startup
async function initRedisLicenses() {
  try {
    const { kvGetLicenses, kvSaveLicenses, KV_ENABLED } = require('./kvService');
    if (KV_ENABLED) {
      const redisLicenses = await kvGetLicenses();
      // If Redis is empty, seed it with store.json data
      if (!redisLicenses || redisLicenses.length === 0) {
        console.log('[Init] Seeding Redis with licenses from store.json');
        await kvSaveLicenses(store.licenses);
      }
    }
  } catch(e) { 
    console.error('[Init] Error seeding Redis licenses:', e.message);
  }
}

// Call on startup
initRedisLicenses();

function getStore() { return store; }

function nextId() { return store._nextId++; }

module.exports = { getStore, saveStore, nextId };
