-- Merchant billing: subscription tiers and status. One row per merchant.
-- Row is created by the app when a merchant first accesses billing.

create table public.merchant_subscriptions (
  id uuid primary key default gen_random_uuid(),
  merchant_user_id uuid not null references public.profiles(id) on delete cascade,
  tier text not null default 'starter' check (tier in ('starter', 'growth', 'pro')),
  status text not null default 'trialing' check (status in ('trialing', 'active', 'past_due', 'canceled')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (merchant_user_id)
);

create index idx_merchant_subscriptions_merchant_user_id on public.merchant_subscriptions(merchant_user_id);

comment on table public.merchant_subscriptions is 'Billing subscription per merchant. Participants have no subscription.';

alter table public.merchant_subscriptions enable row level security;

-- Merchants can view and update their own subscription row only.
create policy "Merchants can view own subscription"
  on public.merchant_subscriptions for select
  to authenticated
  using (merchant_user_id = auth.uid());

create policy "Merchants can insert own subscription"
  on public.merchant_subscriptions for insert
  to authenticated
  with check (merchant_user_id = auth.uid());

create policy "Merchants can update own subscription"
  on public.merchant_subscriptions for update
  to authenticated
  using (merchant_user_id = auth.uid())
  with check (merchant_user_id = auth.uid());

-- Service role / backend may need to upsert when ensuring row exists (use service role or same user context).
-- No admin policy added; add later if admins must read/update subscriptions.
