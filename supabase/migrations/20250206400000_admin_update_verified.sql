-- Allow admins to set verified (and updated_at) when approving ID/officer verification.
-- Without this, approveVerification() updates are blocked by RLS for merchant_profiles
-- and participant_profiles because only the owning user had update permission.

create policy "Admins can update merchant_profiles for verification"
  on public.merchant_profiles for update
  to authenticated
  using ( (select private.get_my_role()) = 'admin' )
  with check ( (select private.get_my_role()) = 'admin' );

create policy "Admins can update participant_profiles for verification"
  on public.participant_profiles for update
  to authenticated
  using ( (select private.get_my_role()) = 'admin' )
  with check ( (select private.get_my_role()) = 'admin' );

-- Backfill: set verified = true for profiles that already have an approved verification
-- (in case approvals were done before this RLS fix and the flag was never set).
update public.merchant_profiles mp
set verified = true, updated_at = now()
from public.verifications v
where v.user_id = mp.user_id
  and v.type = 'merchant_officer'
  and v.status = 'approved'
  and mp.verified = false;

update public.participant_profiles pp
set verified = true, updated_at = now()
from public.verifications v
where v.user_id = pp.user_id
  and v.type = 'participant_id'
  and v.status = 'approved'
  and pp.verified = false;
