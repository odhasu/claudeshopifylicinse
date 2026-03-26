const { getStore, saveStore } = require('./storeService');

const UPSTASH_URL   = process.env.KV_REST_API_URL   || process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.KV_REST_API_TOKEN  || process.env.UPSTASH_REDIS_REST_TOKEN;
const KV_ENABLED    = !!(UPSTASH_URL && UPSTASH_TOKEN);

async function upstashCmd(command) {
  const res = await fetch(UPSTASH_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
  });
  const data = await res.json();
  return data.result;
}

async function kvGetTickets() {
  if (KV_ENABLED) {
    try {
      const raw = await upstashCmd(['GET', 'vexel_tickets']);
      return raw ? JSON.parse(raw) : [];
    } catch(e) { console.error('[KV] read error:', e.message); }
  }
  return getStore().tickets || [];
}

async function kvSaveTickets(tickets) {
  if (KV_ENABLED) {
    try { await upstashCmd(['SET', 'vexel_tickets', JSON.stringify(tickets)]); return; }
    catch(e) { console.error('[KV] write error:', e.message); }
  }
  getStore().tickets = tickets;
  saveStore();
}

module.exports = { kvGetTickets, kvSaveTickets, KV_ENABLED };
