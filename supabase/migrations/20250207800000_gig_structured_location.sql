-- Structured location fields for gigs

alter table public.gigs
  add column if not exists location_street text,
  add column if not exists location_city text,
  add column if not exists location_parish text;

alter table public.gig_locations
  add column if not exists street_address text,
  add column if not exists city text,
  add column if not exists parish text;
