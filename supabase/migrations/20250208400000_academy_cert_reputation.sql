-- Academy cert count on participant profiles + reputation bonus

alter table public.participant_profiles
  add column if not exists cert_count integer not null default 0;

create or replace function public.update_participant_cert_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.participant_profiles
  set cert_count = (
    select count(*)::integer
    from public.academy_certificates c
    where c.user_id = coalesce(new.user_id, old.user_id)
      and c.is_valid = true
      and c.expires_at > now()
  )
  where user_id = coalesce(new.user_id, old.user_id);
  return coalesce(new, old);
end;
$$;

drop trigger if exists on_certificate_issued on public.academy_certificates;
create trigger on_certificate_issued
  after insert or update or delete on public.academy_certificates
  for each row execute function public.update_participant_cert_count();

create or replace function public.compute_reputation_score(
  p_average_rating numeric,
  p_total_ratings integer,
  p_gigs_completed integer,
  p_is_verified boolean,
  p_cert_count integer default 0
) returns integer
language plpgsql
immutable
as $$
declare
  rating_component integer;
  volume_component integer;
  verified_bonus integer;
  cert_bonus integer;
  base_score integer;
begin
  rating_component := round((coalesce(p_average_rating, 0) / 5.0) * 400);
  volume_component := least(round(coalesce(p_total_ratings, 0) * 8.0), 250);
  verified_bonus := case when p_is_verified then 100 else 0 end;
  cert_bonus := least(coalesce(p_cert_count, 0) * 75, 250);
  base_score := rating_component + volume_component + verified_bonus + cert_bonus;
  return least(base_score, 1000);
end;
$$;

create or replace function public.update_participant_reputation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_avg numeric;
  v_count integer;
  v_gigs integer;
  v_verified boolean;
  v_certs integer;
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

  select verified, cert_count into v_verified, v_certs
  from public.participant_profiles
  where user_id = new.ratee_id;

  v_score := public.compute_reputation_score(
    v_avg,
    v_count,
    v_gigs,
    coalesce(v_verified, false),
    coalesce(v_certs, 0)
  );

  update public.participant_profiles
  set
    average_rating = v_avg,
    total_ratings = v_count,
    reputation_score = v_score
  where user_id = new.ratee_id;

  return new;
end;
$$;

create or replace function public.refresh_participant_reputation(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_avg numeric;
  v_count integer;
  v_gigs integer;
  v_verified boolean;
  v_certs integer;
  v_score integer;
begin
  select coalesce(round(avg(score)::numeric, 2), 0), count(*)
  into v_avg, v_count
  from public.ratings
  where ratee_id = p_user_id and role_of_rater = 'merchant';

  select count(*) into v_gigs
  from public.bookings
  where participant_user_id = p_user_id and status = 'completed';

  select verified, cert_count into v_verified, v_certs
  from public.participant_profiles
  where user_id = p_user_id;

  v_score := public.compute_reputation_score(
    v_avg, v_count, v_gigs, coalesce(v_verified, false), coalesce(v_certs, 0)
  );

  update public.participant_profiles
  set average_rating = v_avg, total_ratings = v_count, reputation_score = v_score
  where user_id = p_user_id;
end;
$$;

create or replace function public.update_participant_cert_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.participant_profiles
  set cert_count = (
    select count(*)::integer
    from public.academy_certificates c
    where c.user_id = coalesce(new.user_id, old.user_id)
      and c.is_valid = true
      and c.expires_at > now()
  )
  where user_id = coalesce(new.user_id, old.user_id);

  perform public.refresh_participant_reputation(coalesce(new.user_id, old.user_id));
  return coalesce(new, old);
end;
$$;
