-- Responsible officers as a separate table (multiple per merchant).
create table public.merchant_responsible_officers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  position text,
  email text,
  phone text,
  created_at timestamptz not null default now()
);

create index idx_merchant_responsible_officers_user_id
  on public.merchant_responsible_officers(user_id);

alter table public.merchant_responsible_officers enable row level security;

create policy "Merchants can manage own officers"
  on public.merchant_responsible_officers
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Migrate existing single officer from merchant_profiles (if columns exist)
insert into public.merchant_responsible_officers (user_id, name, position, email, phone)
select user_id, officer_name, officer_position, officer_email, officer_phone
from public.merchant_profiles
where officer_name is not null and trim(officer_name) <> '';

-- Drop officer columns from merchant_profiles
alter table public.merchant_profiles
  drop column if exists officer_name,
  drop column if exists officer_position,
  drop column if exists officer_email,
  drop column if exists officer_phone;

comment on table public.merchant_responsible_officers is 'Responsible officers for a merchant; at least one required before verification.';
