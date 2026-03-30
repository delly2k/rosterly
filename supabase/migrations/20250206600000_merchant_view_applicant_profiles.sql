-- Merchants can read participant_profiles only for users who have applied to one of their gigs.
-- Use this to show applicant name etc.; app must never select emergency_contact or other sensitive fields.

create policy "Merchants can view applicant profiles for their gigs"
  on public.participant_profiles for select
  to authenticated
  using (
    (select private.get_my_role()) = 'merchant'
    and user_id in (
      select a.participant_user_id
      from public.applications a
      join public.gigs g on g.id = a.gig_id and g.merchant_user_id = auth.uid()
    )
  );
