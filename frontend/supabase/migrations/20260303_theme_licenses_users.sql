-- Add user-association columns to theme_licenses
alter table theme_licenses
  add column if not exists owner_email text,
  add column if not exists user_id     uuid references auth.users(id) on delete set null,
  add column if not exists plan        text check (plan in ('LITE', 'PRO'));

create index if not exists theme_licenses_owner_email_idx on theme_licenses (lower(owner_email));
create index if not exists theme_licenses_user_id_idx     on theme_licenses (user_id);

-- Allow authenticated users to read licenses that belong to them
-- (matched by Supabase Auth user_id OR by email when user_id hasn't been linked yet)
create policy "Users can read own licenses"
  on theme_licenses for select
  to authenticated
  using (
    auth.uid() = user_id
    or lower(auth.jwt() ->> 'email') = lower(owner_email)
  );
