-- Persist participant disclaimer acceptance so the checkbox stays checked when they return.
alter table public.participant_profiles
  add column if not exists disclaimer_accepted_at timestamptz;

comment on column public.participant_profiles.disclaimer_accepted_at is
  'When the participant accepted the profile disclaimer (required once per save).';
