-- =============================================================================
-- Audit log for gig/application/booking changes (fraud prevention).
-- =============================================================================

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id text not null,
  action text not null,
  actor_id uuid references public.profiles(id) on delete set null,
  payload jsonb default '{}',
  created_at timestamptz not null default now()
);

create index idx_audit_log_entity on public.audit_log(entity_type, entity_id);
create index idx_audit_log_created_at on public.audit_log(created_at desc);

alter table public.audit_log enable row level security;

create policy "Authenticated can insert audit_log"
  on public.audit_log for insert
  to authenticated
  with check ( true );

create policy "Admins can view audit_log"
  on public.audit_log for select
  to authenticated
  using ( (select private.get_my_role()) = 'admin' );

comment on table public.audit_log is 'Log of gig/application/booking changes. Insert from app; only admins can read.';
