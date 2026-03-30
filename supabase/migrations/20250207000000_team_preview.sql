-- Team preview: minimal view of who else is confirmed on the same gig.
-- Add role_in_gig to bookings (participant | team_lead).
alter table public.bookings
  add column if not exists role_in_gig text not null default 'participant'
  check (role_in_gig in ('participant', 'team_lead'));

comment on column public.bookings.role_in_gig is 'Role in this gig: participant or team_lead. Used for team preview label only.';

-- Safe RPC: returns minimal team preview only when caller has a confirmed booking for the gig.
-- Exposes first name only (split from full_name), photo_url, verified, role_in_gig.
-- No last name, contact info, or profile link.
create or replace function public.get_gig_team_preview(p_gig_id uuid)
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
  -- Caller must have a confirmed booking for this gig.
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
    pp.photo_url,
    coalesce(pp.verified, false),
    coalesce(b.role_in_gig, 'participant')
  from public.bookings b
  join public.participant_profiles pp on pp.user_id = b.participant_user_id
  where b.gig_id = p_gig_id
    and b.status = 'confirmed';
end;
$$;

comment on function public.get_gig_team_preview(uuid) is 'Minimal team preview for a gig. Only callable by users with a confirmed booking for that gig. Returns first name only, photo_url, verified, role_in_gig.';
