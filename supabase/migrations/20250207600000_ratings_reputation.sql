-- Ratings and reputation score system

create table public.ratings (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  gig_id uuid not null references public.gigs(id) on delete cascade,
  rater_id uuid not null references auth.users(id) on delete cascade,
  ratee_id uuid not null references auth.users(id) on delete cascade,
  role_of_rater text not null check (role_of_rater in ('merchant', 'participant')),
  score integer not null check (score >= 1 and score <= 5),
  comment text,
  created_at timestamptz default now(),
  unique (booking_id, rater_id)
);

create index idx_ratings_ratee_id on public.ratings(ratee_id);
create index idx_ratings_booking_id on public.ratings(booking_id);
create index idx_ratings_gig_id on public.ratings(gig_id);

comment on table public.ratings is 'Post-gig ratings between merchants and participants.';

alter table public.participant_profiles
  add column if not exists reputation_score integer default 0,
  add column if not exists total_ratings integer default 0,
  add column if not exists average_rating numeric(3, 2) default 0.00;

alter table public.merchant_profiles
  add column if not exists average_rating numeric(3, 2) default 0.00,
  add column if not exists total_ratings integer default 0;

create or replace function public.compute_reputation_score(
  p_average_rating numeric,
  p_total_ratings integer,
  p_gigs_completed integer,
  p_is_verified boolean
) returns integer as $$
declare
  base_score integer;
  rating_component integer;
  volume_component integer;
  verified_bonus integer;
begin
  rating_component := round((coalesce(p_average_rating, 0) / 5.0) * 500);
  volume_component := least(round(coalesce(p_total_ratings, 0) * 8.0), 300);
  verified_bonus := case when p_is_verified then 100 else 0 end;
  base_score := rating_component + volume_component + verified_bonus;
  return least(base_score, 1000);
end;
$$ language plpgsql immutable;

create or replace function public.update_participant_reputation()
returns trigger as $$
declare
  v_avg numeric;
  v_count integer;
  v_gigs integer;
  v_verified boolean;
  v_score integer;
begin
  select
    coalesce(round(avg(score)::numeric, 2), 0),
    count(*)
  into v_avg, v_count
  from public.ratings
  where ratee_id = new.ratee_id
    and role_of_rater = 'merchant';

  select count(*) into v_gigs
  from public.bookings
  where participant_user_id = new.ratee_id
    and status = 'completed';

  select verified into v_verified
  from public.participant_profiles
  where user_id = new.ratee_id;

  v_score := public.compute_reputation_score(v_avg, v_count, v_gigs, coalesce(v_verified, false));

  update public.participant_profiles
  set
    average_rating = v_avg,
    total_ratings = v_count,
    reputation_score = v_score
  where user_id = new.ratee_id;

  return new;
end;
$$ language plpgsql security definer;

create or replace function public.update_merchant_rating()
returns trigger as $$
declare
  v_avg numeric;
  v_count integer;
begin
  select
    coalesce(round(avg(score)::numeric, 2), 0),
    count(*)
  into v_avg, v_count
  from public.ratings
  where ratee_id = new.ratee_id
    and role_of_rater = 'participant';

  update public.merchant_profiles
  set
    average_rating = v_avg,
    total_ratings = v_count
  where user_id = new.ratee_id;

  return new;
end;
$$ language plpgsql security definer;

create trigger on_rating_inserted_participant_reputation
  after insert on public.ratings
  for each row
  when (new.role_of_rater = 'merchant')
  execute function public.update_participant_reputation();

create trigger on_rating_inserted_merchant_rating
  after insert on public.ratings
  for each row
  when (new.role_of_rater = 'participant')
  execute function public.update_merchant_rating();

alter table public.ratings enable row level security;

create policy "Users can read own ratings"
  on public.ratings for select
  using (ratee_id = auth.uid() or rater_id = auth.uid());

create policy "Users can insert own ratings"
  on public.ratings for insert
  with check (rater_id = auth.uid());

create policy "Admins can read all ratings"
  on public.ratings for select
  using ((select private.get_my_role()) = 'admin');
