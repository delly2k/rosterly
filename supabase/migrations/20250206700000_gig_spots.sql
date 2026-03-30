-- Number of persons needed for the gig. Default 1 for existing rows.
alter table public.gigs
  add column if not exists spots integer not null default 1;

alter table public.gigs
  add constraint gigs_spots_positive check (spots >= 1);

comment on column public.gigs.spots is 'Number of people needed for this gig. Gig is "filled" when confirmed/pending bookings count >= spots.';
