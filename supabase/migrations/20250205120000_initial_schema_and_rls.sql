-- =============================================================================
-- Rosterly: Initial Postgres schema and Row Level Security (RLS)
-- =============================================================================
-- Safety: RLS is enabled on all tables. Policies use (select auth.uid()) for
-- performance. Admin checks use a security-definer helper in private schema.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- ENUMS
-- -----------------------------------------------------------------------------
create type public.profile_role as enum ('participant', 'merchant', 'admin');
create type public.profile_status as enum ('pending', 'active', 'suspended', 'banned');
create type public.verification_type as enum ('participant_id', 'merchant_officer');
create type public.verification_status as enum ('pending', 'approved', 'rejected');
create type public.gig_status as enum ('draft', 'open', 'filled', 'cancelled', 'completed');
create type public.application_status as enum ('pending', 'accepted', 'rejected', 'withdrawn');
create type public.booking_status as enum ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');
create type public.checkin_type as enum ('in', 'out');
create type public.report_status as enum ('pending', 'reviewed', 'resolved', 'dismissed');

-- -----------------------------------------------------------------------------
-- TABLES
-- -----------------------------------------------------------------------------
create schema if not exists private;

-- profiles: one per auth.users.id. Role and status drive app and RLS behavior.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.profile_role not null default 'participant',
  status public.profile_status not null default 'pending',
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'One row per user. id = auth.users.id. Role/status used in RLS and app.';

-- HELPER: role check for RLS (security definer = runs as owner, can read profiles).
-- Must be created after public.profiles exists. Keep in private schema so not exposed via API.
create or replace function private.get_my_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role::text from public.profiles where id = auth.uid() limit 1;
$$;

comment on function private.get_my_role() is 'Returns current user profile role for RLS. Do not expose this function to API.';

-- participant_profiles: extended data for participants (1:1 with profiles where role=participant).
create table public.participant_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  full_name text,
  photo_url text,
  bio text,
  skills jsonb default '[]',
  location_general text,
  availability jsonb default '{}',
  rate numeric(10,2),
  emergency_contact text,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.participant_profiles is 'Participant-only profile data. RLS: own row only.';

-- merchant_profiles: extended data for merchants (1:1 with profiles where role=merchant).
create table public.merchant_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  business_name text,
  business_type text,
  officer_name text,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.merchant_profiles is 'Merchant-only profile data. RLS: own row only.';

-- verifications: ID/selfie uploads and review state. Sensitive; only owner and admins.
create table public.verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type public.verification_type not null,
  id_doc_url text,
  selfie_url text,
  status public.verification_status not null default 'pending',
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_verifications_user_id on public.verifications(user_id);
create index idx_verifications_status on public.verifications(status);

comment on table public.verifications is 'Verification requests. Users manage own; admins can update status/reviewed_*.';

-- gigs: merchant-created gigs. location_exact is NOT here; see gig_locations (restricted).
create table public.gigs (
  id uuid primary key default gen_random_uuid(),
  merchant_user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  duties jsonb default '[]',
  pay_rate numeric(10,2),
  payment_method_dummy text,
  location_general text,
  start_time timestamptz,
  end_time timestamptz,
  status public.gig_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_gigs_merchant_user_id on public.gigs(merchant_user_id);
create index idx_gigs_status on public.gigs(status);

comment on table public.gigs is 'Gigs list. Exact location stored in gig_locations; participants see it only when booked.';

-- gig_locations: exact location, restricted. Participants see only when they have a booking for this gig.
create table public.gig_locations (
  gig_id uuid primary key references public.gigs(id) on delete cascade,
  location_exact text
);

comment on table public.gig_locations is 'Exact gig location. RLS: merchant full access; participant SELECT only if booked on this gig.';

-- applications: participant applies to a gig.
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  gig_id uuid not null references public.gigs(id) on delete cascade,
  participant_user_id uuid not null references public.profiles(id) on delete cascade,
  status public.application_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(gig_id, participant_user_id)
);

create index idx_applications_gig_id on public.applications(gig_id);
create index idx_applications_participant_user_id on public.applications(participant_user_id);

-- bookings: confirmed assignment of participant to gig (from accepted application).
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  gig_id uuid not null references public.gigs(id) on delete cascade,
  participant_user_id uuid not null references public.profiles(id) on delete cascade,
  status public.booking_status not null default 'pending',
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_bookings_gig_id on public.bookings(gig_id);
create index idx_bookings_participant_user_id on public.bookings(participant_user_id);

-- checkins: in/out with lat/lon for a booking.
create table public.checkins (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  type public.checkin_type not null,
  lat numeric(10,7),
  lon numeric(10,7),
  created_at timestamptz not null default now()
);

create index idx_checkins_booking_id on public.checkins(booking_id);

-- chats: one per gig + participant pair (merchant and participant can access).
create table public.chats (
  id uuid primary key default gen_random_uuid(),
  gig_id uuid not null references public.gigs(id) on delete cascade,
  merchant_user_id uuid not null references public.profiles(id) on delete cascade,
  participant_user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(gig_id, participant_user_id)
);

create index idx_chats_gig_id on public.chats(gig_id);
create index idx_chats_merchant_user_id on public.chats(merchant_user_id);
create index idx_chats_participant_user_id on public.chats(participant_user_id);

-- messages: belong to a chat. Readable only by chat participants or admins.
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  flagged boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_messages_chat_id on public.messages(chat_id);
create index idx_messages_sender_id on public.messages(sender_id);

-- reports: user reports (reporter sees own; admins see all).
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_id uuid references public.profiles(id) on delete set null,
  gig_id uuid references public.gigs(id) on delete set null,
  category text,
  description text,
  status public.report_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_reports_reporter_id on public.reports(reporter_id);
create index idx_reports_status on public.reports(status);

-- admin_actions: audit log of admin actions. Only admins can insert/read.
create table public.admin_actions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id) on delete cascade,
  action text not null,
  target_table text,
  target_id text,
  reason text,
  created_at timestamptz not null default now()
);

create index idx_admin_actions_admin_id on public.admin_actions(admin_id);
create index idx_admin_actions_created_at on public.admin_actions(created_at desc);

-- -----------------------------------------------------------------------------
-- TRIGGER: create profile on signup (auth.users insert)
-- Ensures every user has a profile row; role defaults to participant.
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, status)
  values (new.id, 'participant', 'pending');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- ROW LEVEL SECURITY: enable on all tables
-- =============================================================================
alter table public.profiles enable row level security;
alter table public.participant_profiles enable row level security;
alter table public.merchant_profiles enable row level security;
alter table public.verifications enable row level security;
alter table public.gigs enable row level security;
alter table public.gig_locations enable row level security;
alter table public.applications enable row level security;
alter table public.bookings enable row level security;
alter table public.checkins enable row level security;
alter table public.chats enable row level security;
alter table public.messages enable row level security;
alter table public.reports enable row level security;
alter table public.admin_actions enable row level security;

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

-- ----------
-- profiles
-- Safety: Users read/update only their own row. Admins can read all (for support).
-- Insert is via trigger; no direct insert policy for authenticated (trigger handles).
-- ----------
create policy "Users can view own profile"
  on public.profiles for select
  to authenticated
  using ( (select auth.uid()) = id );

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using ( (select auth.uid()) = id )
  with check ( (select auth.uid()) = id );

create policy "Admins can view all profiles"
  on public.profiles for select
  to authenticated
  using ( (select private.get_my_role()) = 'admin' );

-- Allow trigger to insert (runs as definer). Service role or trigger runs with definer.
-- For signup from app: if you create user via API, trigger runs. No need for authenticated insert.

-- ----------
-- participant_profiles
-- Safety: Only the owning user can read/insert/update their row.
-- ----------
create policy "Users can view own participant_profile"
  on public.participant_profiles for select
  to authenticated
  using ( (select auth.uid()) = user_id );

create policy "Users can insert own participant_profile"
  on public.participant_profiles for insert
  to authenticated
  with check ( (select auth.uid()) = user_id );

create policy "Users can update own participant_profile"
  on public.participant_profiles for update
  to authenticated
  using ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );

create policy "Admins can view all participant_profiles"
  on public.participant_profiles for select
  to authenticated
  using ( (select private.get_my_role()) = 'admin' );

-- ----------
-- merchant_profiles
-- Safety: Only the owning user can read/insert/update their row.
-- ----------
create policy "Users can view own merchant_profile"
  on public.merchant_profiles for select
  to authenticated
  using ( (select auth.uid()) = user_id );

create policy "Users can insert own merchant_profile"
  on public.merchant_profiles for insert
  to authenticated
  with check ( (select auth.uid()) = user_id );

create policy "Users can update own merchant_profile"
  on public.merchant_profiles for update
  to authenticated
  using ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );

create policy "Admins can view all merchant_profiles"
  on public.merchant_profiles for select
  to authenticated
  using ( (select private.get_my_role()) = 'admin' );

-- ----------
-- verifications
-- Safety: User can insert and read own; admins can read all and update status/reviewed_*.
-- ----------
create policy "Users can view own verifications"
  on public.verifications for select
  to authenticated
  using ( (select auth.uid()) = user_id );

create policy "Users can insert own verifications"
  on public.verifications for insert
  to authenticated
  with check ( (select auth.uid()) = user_id );

create policy "Admins can view all verifications"
  on public.verifications for select
  to authenticated
  using ( (select private.get_my_role()) = 'admin' );

create policy "Admins can update verification status"
  on public.verifications for update
  to authenticated
  using ( (select private.get_my_role()) = 'admin' )
  with check ( true );

-- ----------
-- gigs
-- Safety: Merchants manage their own gigs (CRUD). Participants and anon can read non-draft for discovery.
-- Admins can read all. We allow SELECT for authenticated users for listing; merchants get full CRUD on own.
-- ----------
create policy "Merchants can view own gigs"
  on public.gigs for select
  to authenticated
  using ( (select auth.uid()) = merchant_user_id );

create policy "Merchants can insert own gigs"
  on public.gigs for insert
  to authenticated
  with check ( (select auth.uid()) = merchant_user_id );

create policy "Merchants can update own gigs"
  on public.gigs for update
  to authenticated
  using ( (select auth.uid()) = merchant_user_id )
  with check ( (select auth.uid()) = merchant_user_id );

create policy "Merchants can delete own gigs"
  on public.gigs for delete
  to authenticated
  using ( (select auth.uid()) = merchant_user_id );

-- Participants can see gigs (for browsing); exclude draft if you prefer — here we allow read for status <> draft
create policy "Authenticated can view open gigs"
  on public.gigs for select
  to authenticated
  using ( status <> 'draft' );

create policy "Admins can view all gigs"
  on public.gigs for select
  to authenticated
  using ( (select private.get_my_role()) = 'admin' );

-- ----------
-- gig_locations
-- Safety: Exact location is sensitive. Only merchant who owns the gig can read/write.
-- Participants can read only when they have a booking for this gig (prevents seeing address before booking).
-- ----------
create policy "Merchants can manage own gig location"
  on public.gig_locations for all
  to authenticated
  using (
    exists (
      select 1 from public.gigs g
      where g.id = gig_locations.gig_id and g.merchant_user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.gigs g
      where g.id = gig_locations.gig_id and g.merchant_user_id = (select auth.uid())
    )
  );

create policy "Participants can view gig location when booked"
  on public.gig_locations for select
  to authenticated
  using (
    exists (
      select 1 from public.bookings b
      where b.gig_id = gig_locations.gig_id
        and b.participant_user_id = (select auth.uid())
        and b.status in ('confirmed', 'completed')
    )
  );

create policy "Admins can view all gig_locations"
  on public.gig_locations for select
  to authenticated
  using ( (select private.get_my_role()) = 'admin' );

-- ----------
-- applications
-- Safety: Participant can CRUD own applications. Merchant can read applications for their gigs (and update status).
-- Admins can read all.
-- ----------
create policy "Participants can view own applications"
  on public.applications for select
  to authenticated
  using ( (select auth.uid()) = participant_user_id );

create policy "Participants can insert own applications"
  on public.applications for insert
  to authenticated
  with check ( (select auth.uid()) = participant_user_id );

create policy "Participants can update own applications"
  on public.applications for update
  to authenticated
  using ( (select auth.uid()) = participant_user_id )
  with check ( (select auth.uid()) = participant_user_id );

create policy "Merchants can view applications for their gigs"
  on public.applications for select
  to authenticated
  using (
    exists (
      select 1 from public.gigs g
      where g.id = applications.gig_id and g.merchant_user_id = (select auth.uid())
    )
  );

create policy "Merchants can update applications for their gigs"
  on public.applications for update
  to authenticated
  using (
    exists (
      select 1 from public.gigs g
      where g.id = applications.gig_id and g.merchant_user_id = (select auth.uid())
    )
  )
  with check ( true );

create policy "Admins can view all applications"
  on public.applications for select
  to authenticated
  using ( (select private.get_my_role()) = 'admin' );

-- ----------
-- bookings
-- Safety: Participant sees own; merchant sees bookings for their gigs and can update (confirm/cancel).
-- Admins can read all.
-- ----------
create policy "Participants can view own bookings"
  on public.bookings for select
  to authenticated
  using ( (select auth.uid()) = participant_user_id );

create policy "Merchants can view bookings for their gigs"
  on public.bookings for select
  to authenticated
  using (
    exists (
      select 1 from public.gigs g
      where g.id = bookings.gig_id and g.merchant_user_id = (select auth.uid())
    )
  );

create policy "Merchants can insert bookings for their gigs"
  on public.bookings for insert
  to authenticated
  with check (
    exists (
      select 1 from public.gigs g
      where g.id = bookings.gig_id and g.merchant_user_id = (select auth.uid())
    )
  );

create policy "Merchants can update bookings for their gigs"
  on public.bookings for update
  to authenticated
  using (
    exists (
      select 1 from public.gigs g
      where g.id = bookings.gig_id and g.merchant_user_id = (select auth.uid())
    )
  )
  with check ( true );

create policy "Participants can update own bookings (e.g. accept)"
  on public.bookings for update
  to authenticated
  using ( (select auth.uid()) = participant_user_id )
  with check ( (select auth.uid()) = participant_user_id );

create policy "Admins can view all bookings"
  on public.bookings for select
  to authenticated
  using ( (select private.get_my_role()) = 'admin' );

-- ----------
-- checkins
-- Safety: Participant with that booking can insert; both participant and merchant can read checkins for their booking/gig.
-- ----------
create policy "Participant can view checkins for own bookings"
  on public.checkins for select
  to authenticated
  using (
    exists (
      select 1 from public.bookings b
      where b.id = checkins.booking_id and b.participant_user_id = (select auth.uid())
    )
  );

create policy "Merchant can view checkins for their gigs"
  on public.checkins for select
  to authenticated
  using (
    exists (
      select 1 from public.bookings b
      join public.gigs g on g.id = b.gig_id
      where b.id = checkins.booking_id and g.merchant_user_id = (select auth.uid())
    )
  );

create policy "Participant can insert checkin for own booking"
  on public.checkins for insert
  to authenticated
  with check (
    exists (
      select 1 from public.bookings b
      where b.id = checkins.booking_id and b.participant_user_id = (select auth.uid())
    )
  );

create policy "Admins can view all checkins"
  on public.checkins for select
  to authenticated
  using ( (select private.get_my_role()) = 'admin' );

-- ----------
-- chats
-- Safety: Only the two participants (merchant and participant) can read/insert messages and the chat row.
-- ----------
create policy "Chat participants can view chat"
  on public.chats for select
  to authenticated
  using (
    (select auth.uid()) = merchant_user_id or (select auth.uid()) = participant_user_id
  );

create policy "Merchant can create chat for their gig"
  on public.chats for insert
  to authenticated
  with check (
    merchant_user_id = (select auth.uid())
    and exists (
      select 1 from public.gigs g
      where g.id = chats.gig_id and g.merchant_user_id = (select auth.uid())
    )
  );

create policy "Admins can view all chats"
  on public.chats for select
  to authenticated
  using ( (select private.get_my_role()) = 'admin' );

-- ----------
-- messages
-- Safety: Readable only by chat participants (merchant or participant for that chat) or admins.
-- Sender must be the authenticated user; only chat participants can insert (as themselves).
-- ----------
create policy "Chat participants can view messages"
  on public.messages for select
  to authenticated
  using (
    exists (
      select 1 from public.chats c
      where c.id = messages.chat_id
        and ( (select auth.uid()) = c.merchant_user_id or (select auth.uid()) = c.participant_user_id )
    )
  );

create policy "Chat participants can send messages"
  on public.messages for insert
  to authenticated
  with check (
    (select auth.uid()) = sender_id
    and exists (
      select 1 from public.chats c
      where c.id = messages.chat_id
        and ( (select auth.uid()) = c.merchant_user_id or (select auth.uid()) = c.participant_user_id )
    )
  );

create policy "Admins can view all messages"
  on public.messages for select
  to authenticated
  using ( (select private.get_my_role()) = 'admin' );

-- ----------
-- reports
-- Safety: Reporter can insert and read own reports. Admins can read all and update status.
-- ----------
create policy "Users can insert own reports"
  on public.reports for insert
  to authenticated
  with check ( (select auth.uid()) = reporter_id );

create policy "Reporters can view own reports"
  on public.reports for select
  to authenticated
  using ( (select auth.uid()) = reporter_id );

create policy "Admins can view all reports"
  on public.reports for select
  to authenticated
  using ( (select private.get_my_role()) = 'admin' );

create policy "Admins can update reports"
  on public.reports for update
  to authenticated
  using ( (select private.get_my_role()) = 'admin' )
  with check ( true );

-- ----------
-- admin_actions
-- Safety: Only admins can insert and read. Audit trail for moderation.
-- ----------
create policy "Admins can view admin_actions"
  on public.admin_actions for select
  to authenticated
  using ( (select private.get_my_role()) = 'admin' );

create policy "Admins can insert admin_actions"
  on public.admin_actions for insert
  to authenticated
  with check (
    (select auth.uid()) = admin_id
    and (select private.get_my_role()) = 'admin'
  );
