const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

let _client = null;
let _disabled = false;

function getClient() {
  if (_disabled) return null;
  if (!_client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      logger.warn('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set — Supabase disabled');
      _disabled = true;
      return null;
    }
    _client = createClient(url, key);
  }
  return _client;
}

async function upsertSubscription(fields) {
  const db = getClient();
  if (!db) return null;
  const { email, plan, status, expires_at, store_limit, license_key, whop_user_id } = fields;
  const payload = {
    email,
    plan: plan || 'monthly',
    status,
    expires_at: expires_at || null,
    store_limit: store_limit || 1,
    updated_at: new Date().toISOString(),
  };
  if (license_key !== undefined) payload.license_key = license_key;
  if (whop_user_id !== undefined) payload.whop_user_id = whop_user_id;

  const { data, error } = await db
    .from('subscriptions')
    .upsert(payload, { onConflict: 'email' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function getSubscriptionByEmail(email) {
  const db = getClient();
  if (!db) return null;
  const { data, error } = await db
    .from('subscriptions')
    .select('*')
    .eq('email', email)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

async function getSubscriptionByLicenseKey(licenseKey) {
  const db = getClient();
  if (!db) return null;
  const { data, error } = await db
    .from('subscriptions')
    .select('*')
    .eq('license_key', licenseKey)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

module.exports = { upsertSubscription, getSubscriptionByEmail, getSubscriptionByLicenseKey };
