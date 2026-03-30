-- Selfie-as-profile: track source and future visibility of profile photo.
-- profile-photos bucket (existing) holds only low-resolution avatar copies; verification-docs stays private.

alter table public.participant_profiles
  add column if not exists photo_source text not null default 'none'
  check (photo_source in ('none', 'verification_selfie', 'user_upload_future'));

alter table public.participant_profiles
  add column if not exists photo_visibility text not null default 'team_only'
  check (photo_visibility in ('team_only', 'merchant_visible', 'hidden'));

comment on column public.participant_profiles.photo_source is 'Origin of profile photo: none, verification_selfie (set on approval), or user_upload_future.';
comment on column public.participant_profiles.photo_visibility is 'Future use: who can see the photo. Not enforced yet.';
