-- =============================================================================
-- Storage buckets and RLS; sos_events for dummy SOS logging
-- =============================================================================

-- -----------------------------------------------------------------------------
-- SOS events (dummy: log only, no external action)
-- -----------------------------------------------------------------------------
create table public.sos_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index idx_sos_events_user_id on public.sos_events(user_id);
create index idx_sos_events_created_at on public.sos_events(created_at desc);

alter table public.sos_events enable row level security;

create policy "Users can insert own sos_events"
  on public.sos_events for insert
  to authenticated
  with check ( (select auth.uid()) = user_id );

create policy "Users can view own sos_events"
  on public.sos_events for select
  to authenticated
  using ( (select auth.uid()) = user_id );

create policy "Admins can view all sos_events"
  on public.sos_events for select
  to authenticated
  using ( (select private.get_my_role()) = 'admin' );

comment on table public.sos_events is 'Dummy SOS button logs; no external action. RLS: own insert/select, admin select.';

-- -----------------------------------------------------------------------------
-- Storage: profile-photos (public read for display)
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-photos',
  'profile-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

-- RLS on storage.objects: user can upload/update/delete in own folder; public read via bucket
create policy "Users can upload own profile photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can update own profile photos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can delete own profile photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Allow read for profile-photos (bucket is public; this makes RLS allow select)
create policy "Anyone can view profile photos"
  on storage.objects for select
  to anon, authenticated
  using ( bucket_id = 'profile-photos' );

-- -----------------------------------------------------------------------------
-- Storage: verification-docs (private; owner and admin only)
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'verification-docs',
  'verification-docs',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

create policy "Users can upload own verification docs"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'verification-docs'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users can view own verification docs"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'verification-docs'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Admin read via service role; no RLS policy for admin (service role bypasses RLS)
