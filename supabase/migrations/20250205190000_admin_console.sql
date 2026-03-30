-- =============================================================================
-- Admin console: profile status updates, dummy payment/transport flags
-- =============================================================================

-- Admins can update any profile (e.g. suspend/ban). Trust & safety.
create policy "Admins can update profiles"
  on public.profiles for update
  to authenticated
  using ( (select private.get_my_role()) = 'admin' )
  with check ( true );

-- Dummy: payment confirmation and transport assigned (no real integration).
-- TODO: Replace with real payment provider webhook / transport API when integrating.
alter table public.bookings
  add column if not exists payment_confirmed boolean not null default false,
  add column if not exists transport_assigned boolean not null default false;

comment on column public.bookings.payment_confirmed is 'Dummy: admin toggle. TODO: Replace with real payment confirmation.';
comment on column public.bookings.transport_assigned is 'Dummy: admin toggle. TODO: Replace with real transport assignment.';

-- Admins can update bookings (e.g. set payment_confirmed, transport_assigned).
create policy "Admins can update bookings"
  on public.bookings for update
  to authenticated
  using ( (select private.get_my_role()) = 'admin' )
  with check ( true );
