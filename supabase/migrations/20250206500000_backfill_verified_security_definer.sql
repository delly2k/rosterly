-- Backfill verified flag using a SECURITY DEFINER function so it runs with
-- definer rights and is not blocked by RLS (migration runner may have RLS applied).

create or replace function private.backfill_verified_from_approvals()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.merchant_profiles mp
  set verified = true, updated_at = now()
  from public.verifications v
  where v.user_id = mp.user_id
    and v.type = 'merchant_officer'
    and v.status = 'approved'
    and not coalesce(mp.verified, false);

  update public.participant_profiles pp
  set verified = true, updated_at = now()
  from public.verifications v
  where v.user_id = pp.user_id
    and v.type = 'participant_id'
    and v.status = 'approved'
    and not coalesce(pp.verified, false);
end;
$$;

select private.backfill_verified_from_approvals();

drop function private.backfill_verified_from_approvals();
