/**
 * Billing types. Only merchants have subscriptions; participants remain free.
 */

export type TierName = "starter" | "growth" | "pro";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled";

export type MerchantSubscriptionRow = {
  id: string;
  merchant_user_id: string;
  tier: TierName;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  paypal_subscription_id?: string | null;
  created_at: string;
  updated_at: string;
};

export type TierLimits = {
  max_active_gigs: number | null; // null = unlimited
};
