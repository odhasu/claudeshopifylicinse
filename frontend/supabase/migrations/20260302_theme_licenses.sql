-- Theme license keys table
create table if not exists theme_licenses (
  id                 uuid        primary key default gen_random_uuid(),
  api_key            text        not null unique,
  secret_key         text        not null,
  label              text,
  allowed_stores     int         not null default 1,
  registered_domains text[]      not null default '{}',
  is_active          boolean     not null default true,
  created_at         timestamptz not null default now()
);

-- RLS: only service role can read/write (no anon access)
alter table theme_licenses enable row level security;
