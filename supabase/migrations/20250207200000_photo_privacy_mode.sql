-- Privacy Mode: participant control over when/where profile photo is visible.
-- Values: team_only (default), merchants_after_booking, merchants_on_application, hidden.
-- Enforcement is behind app feature flag PRIVACY_MODE_ENFORCEMENT; when true, use
-- get_gig_team_preview_privacy_aware and merchant applicant logic respects visibility.

-- Migrate existing constraint: drop old check and add new enum-like values.
do $$
declare
  conname text;
begin
  select c.conname into conname
  from pg_constraint c
  join pg_attribute a on a.attnum = any(c.conkey) and a.attrelid = c.conrelid
  where c.conrelid = 'public.participant_profiles'::regclass
    and c.contype = 'c'
    and a.attname = 'photo_visibility'
  limit 1;
  if conname is not null then
    execute format('alter table public.participant_profiles drop constraint %I', conname);
  end if;
end $$;

update public.participant_profiles
set photo_visibility = 'merchants_on_application'
where photo_visibility = 'merchant_visible';

alter table public.participant_profiles
  add constraint participant_profiles_photo_visibility_check
  check (photo_visibility in (
    'team_only',
    'merchants_after_booking',
    'merchants_on_application',
    'hidden'
  ));

comment on column public.participant_profiles.photo_visibility is
  'Who can see profile photo: team_only (default), merchants_after_booking, merchants_on_application, hidden. Enforced when PRIVACY_MODE_ENFORCEMENT is true.';

-- Stub RPC for team preview when privacy enforcement is on: nulls photo_url when visibility = hidden.
-- Call this instead of get_gig_team_preview when feature flag is true.
create or replace function public.get_gig_team_preview_privacy_aware(p_gig_id uuid)
returns table (
  user_id uuid,
  first_name text,
  photo_url text,
  verified boolean,
  role_in_gig text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.bookings b
    where b.gig_id = p_gig_id
      and b.participant_user_id = auth.uid()
      and b.status = 'confirmed'
  ) then
    return;
  end if;

  return query
  select
    b.participant_user_id,
    nullif(trim(split_part(trim(coalesce(pp.full_name, '')), ' ', 1)), '')::text,
    case
      when coalesce(pp.photo_visibility, 'team_only') = 'hidden' then null
      else pp.photo_url
    end,
    coalesce(pp.verified, false),
    coalesce(b.role_in_gig, 'participant')
  from public.bookings b
  join public.participant_profiles pp on pp.user_id = b.participant_user_id
  where b.gig_id = p_gig_id
    and b.status = 'confirmed';
end;
$$;

comment on function public.get_gig_team_preview_privacy_aware(uuid) is
  'Team preview with photo privacy: returns null photo_url when participant photo_visibility is hidden. Use when PRIVACY_MODE_ENFORCEMENT is true.';

-- Stub for future merchant applicant list with conditioned photo (TODO: use when flag on).
-- When PRIVACY_MODE_ENFORCEMENT = true, merchants should query applicants via an RPC
-- that returns photo_url only when participant_visibility allows (merchants_on_application,
-- or merchants_after_booking and booking exists, etc.). Not created here to avoid
-- changing merchant flow until enforcement is enabled.
