-- Reported users may only see outcome when action was taken (resolved/dismissed).
-- Add optional message from admin; allow reported user to read only those rows.

alter table public.reports
  add column if not exists outcome_message text;

comment on column public.reports.outcome_message is 'Optional message from admin to the reported user (visible only to reported user when status is resolved/dismissed).';

-- Reported user can select only rows where they are the reported party and status is resolved or dismissed.
-- (They see the full row via RLS but the app will only expose id, status, outcome_message, updated_at.)
create policy "Reported user can view outcome when action taken"
  on public.reports for select
  to authenticated
  using (
    reported_id = auth.uid()
    and status in ('resolved', 'dismissed')
  );
