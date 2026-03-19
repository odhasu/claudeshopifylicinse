/**
 * Seed Script — Creates initial licenses for your stores.
 *
 * Usage: node seed.js
 *
 * This creates a license for ogresells.com so the theme works on your store.
 * Run this once after deploying to Railway.
 */

const Database = require('better-sqlite3');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'licenses.db');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS licenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    license_key TEXT UNIQUE NOT NULL,
    domain TEXT NOT NULL,
    permanent_domain TEXT,
    store_name TEXT,
    plan TEXT DEFAULT 'standard',
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    expires_at TEXT,
    last_verified_at TEXT,
    request_count INTEGER DEFAULT 0
  );
`);

function generateLicenseKey() {
  const segments = [];
  for (let i = 0; i < 4; i++) {
    segments.push(crypto.randomBytes(2).toString('hex').toUpperCase());
  }
  return segments.join('-');
}

// ─── Your Stores ────────────────────────────────────────────────
const stores = [
  {
    domain: 'ogresells.com',
    permanent_domain: 'ogresells.myshopify.com',
    store_name: 'OGResells',
    plan: 'owner',
  },
  // Add more stores here when you sell the theme:
  // {
  //   domain: 'clientstore.com',
  //   permanent_domain: 'clientstore.myshopify.com',
  //   store_name: 'Client Store',
  //   plan: 'standard',
  // },
];

console.log('\n═══ OGVendors License Seeder ═══\n');

const insertStmt = db.prepare(`
  INSERT OR IGNORE INTO licenses (license_key, domain, permanent_domain, store_name, plan)
  VALUES (?, ?, ?, ?, ?)
`);

for (const store of stores) {
  // Check if already exists
  const existing = db.prepare('SELECT * FROM licenses WHERE domain = ?').get(store.domain);
  if (existing) {
    console.log(`⚡ ${store.domain} already has a license: ${existing.license_key}`);
    continue;
  }

  const key = generateLicenseKey();
  insertStmt.run(key, store.domain, store.permanent_domain || '', store.store_name || '', store.plan || 'standard');
  console.log(`✅ Created license for ${store.domain}`);
  console.log(`   Key: ${key}`);
  console.log(`   Plan: ${store.plan}`);
  console.log('');
}

// Show all licenses
const allLicenses = db.prepare('SELECT * FROM licenses').all();
console.log('\n── All Licenses ──');
for (const lic of allLicenses) {
  console.log(`  ${lic.license_key} → ${lic.domain} (${lic.plan}) ${lic.active ? '✓ active' : '✗ revoked'}`);
}

console.log('\n✅ Done! Copy the license key and put it in your theme\'s ScaledConfig.\n');
db.close();
