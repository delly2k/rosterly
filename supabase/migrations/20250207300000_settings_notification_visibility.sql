-- Settings: notification preferences (profiles) and merchant visibility (merchant_profiles).
-- No enforcement; store preferences only.

alter table public.profiles
  add column if not exists notification_settings jsonb not null default '{}';

comment on column public.profiles.notification_settings is 'User notification preferences (email/push toggles). Keys are feature-specific; no enforcement yet.';

alter table public.merchant_profiles
  add column if not exists visibility_settings jsonb not null default '{}';

comment on column public.merchant_profiles.visibility_settings is 'Merchant privacy: company_contact_visibility, team_list_visibility, etc. Preferences only.';
