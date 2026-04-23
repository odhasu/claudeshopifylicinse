-- Run this in your Supabase SQL editor to create the subscriptions table.

CREATE TABLE IF NOT EXISTS subscriptions (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text        UNIQUE NOT NULL,
  plan          text        NOT NULL DEFAULT 'monthly',  -- monthly | lifetime
  status        text        NOT NULL DEFAULT 'trial',    -- trial | active | cancelled | expired
  expires_at    timestamptz,
  store_limit   int         NOT NULL DEFAULT 1,
  license_key   text,
  whop_user_id  text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Index for license_key lookup (used by /api/customer/subscription)
CREATE INDEX IF NOT EXISTS idx_subscriptions_license_key ON subscriptions (license_key);
