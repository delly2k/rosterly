-- Persist merchant disclaimer acceptance so the checkbox stays checked when they return.
alter table public.merchant_profiles
  add column if not exists disclaimer_accepted_at timestamptz;

comment on column public.merchant_profiles.disclaimer_accepted_at is
  'When the merchant last accepted the profile disclaimer (set on each save with disclaimer checked).';
