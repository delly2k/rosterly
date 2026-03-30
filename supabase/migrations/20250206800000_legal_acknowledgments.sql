-- Legal acknowledgments: users must accept Payment & Liability Disclosure before accepting gigs (participants) or posting gigs (merchants).
create table public.legal_acknowledgments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  document_type text not null,
  version integer not null,
  accepted_at timestamptz not null default now(),
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index idx_legal_acknowledgments_user_doc
  on public.legal_acknowledgments(user_id, document_type);

comment on table public.legal_acknowledgments is 'User acceptances of legal disclosures (e.g. Payment & Liability). Required before participants can accept gigs and merchants can post gigs.';

alter table public.legal_acknowledgments enable row level security;

-- Users can read their own records.
create policy "Users can view own legal acknowledgments"
  on public.legal_acknowledgments for select
  using (auth.uid() = user_id);

-- Users can insert only for themselves.
create policy "Users can insert own legal acknowledgments"
  on public.legal_acknowledgments for insert
  with check (auth.uid() = user_id);

-- Admin can read all (via service role or admin role check in app).
create policy "Admins can view all legal acknowledgments"
  on public.legal_acknowledgments for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );
