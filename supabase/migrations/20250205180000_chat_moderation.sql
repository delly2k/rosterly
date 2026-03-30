-- =============================================================================
-- Chat moderation: blocked users, message reports, keyword flag reason
-- =============================================================================

-- Allow reporting a specific message (optional message_id on reports).
alter table public.reports
  add column if not exists message_id uuid references public.messages(id) on delete set null;

create index if not exists idx_reports_message_id on public.reports(message_id);

-- Store why a message was auto-flagged (keyword match) for moderation.
alter table public.messages
  add column if not exists flagged_reason text;

comment on column public.messages.flagged_reason is 'Set when flagged=true due to keyword match; for admin review.';

-- Blocked users: blocker_id has blocked blocked_id (no DMs, hide messages in chat).
create table if not exists public.blocked_users (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create index idx_blocked_users_blocker_id on public.blocked_users(blocker_id);
create index idx_blocked_users_blocked_id on public.blocked_users(blocked_id);

alter table public.blocked_users enable row level security;

-- Users can manage their own blocks (insert/delete/select own rows).
create policy "Users can view own blocks"
  on public.blocked_users for select
  to authenticated
  using ( (select auth.uid()) = blocker_id );

create policy "Users can block another user"
  on public.blocked_users for insert
  to authenticated
  with check ( (select auth.uid()) = blocker_id );

create policy "Users can unblock"
  on public.blocked_users for delete
  to authenticated
  using ( (select auth.uid()) = blocker_id );

create policy "Admins can view all blocks"
  on public.blocked_users for select
  to authenticated
  using ( (select private.get_my_role()) = 'admin' );

-- Participant can create a chat for a gig where they are the participant
-- (they applied / have booking so conversation is allowed).
create policy "Participant can create chat for own participation"
  on public.chats for insert
  to authenticated
  with check (
    participant_user_id = (select auth.uid())
    and exists (
      select 1 from public.applications a
      where a.gig_id = chats.gig_id and a.participant_user_id = (select auth.uid())
    )
  );

-- Realtime: allow clients to subscribe to new messages for a chat.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;
