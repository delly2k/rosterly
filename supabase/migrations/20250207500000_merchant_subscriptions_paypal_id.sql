-- Store PayPal subscription ID for cancel and webhook lookups.
alter table public.merchant_subscriptions
  add column if not exists paypal_subscription_id text;

comment on column public.merchant_subscriptions.paypal_subscription_id is 'PayPal subscription ID (e.g. I-xxx). Set when subscription is activated via webhook.';
