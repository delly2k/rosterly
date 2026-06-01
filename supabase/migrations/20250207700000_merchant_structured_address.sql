-- Structured address fields for merchant profiles

alter table public.merchant_profiles
  add column if not exists street_address text,
  add column if not exists city text,
  add column if not exists parish text,
  add column if not exists postal_code text;
