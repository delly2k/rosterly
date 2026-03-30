import { createClient } from "@/lib/auth";
import { createSubscription as paypalCreateSubscription, cancelSubscription as paypalCancelSubscription } from "./paypalProvider";
import type { TierName } from "./types";
import type { MerchantSubscriptionRow } from "./types";

/**
 * Ensures a subscription row exists for the merchant. Inserts defaults if missing.
 * Call this when a merchant first accesses billing.
 */
async function ensureSubscriptionRow(userId: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("merchant_subscriptions")
    .select("id")
    .eq("merchant_user_id", userId)
    .maybeSingle();

  if (existing) return { ok: true };

  const now = new Date().toISOString();
  const { error } = await supabase.from("merchant_subscriptions").insert({
    merchant_user_id: userId,
    tier: "starter",
    status: "trialing",
    current_period_start: null,
    current_period_end: null,
    cancel_at_period_end: false,
    created_at: now,
    updated_at: now,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/**
 * Returns the merchant's subscription row. Creates one with defaults if not present.
 * Only for merchants; participants have no subscription.
 */
export async function getMerchantSubscription(
  userId: string
): Promise<MerchantSubscriptionRow | null> {
  const supabase = await createClient();
  await ensureSubscriptionRow(userId);

  const { data, error } = await supabase
    .from("merchant_subscriptions")
    .select("*")
    .eq("merchant_user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return data as MerchantSubscriptionRow;
}

/**
 * Starts PayPal subscription flow for the given tier. Returns approval_url for redirect.
 * DB is updated by PayPal webhook (BILLING.SUBSCRIPTION.ACTIVATED).
 */
export async function upgradeTier(
  userId: string,
  tier: TierName
): Promise<{ ok: boolean; approval_url?: string; error?: string }> {
  const ensured = await ensureSubscriptionRow(userId);
  if (!ensured.ok) return ensured;

  return paypalCreateSubscription(userId, tier);
}

/**
 * Cancels the merchant's subscription via PayPal, then updates DB.
 */
export async function cancelTier(userId: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: row } = await supabase
    .from("merchant_subscriptions")
    .select("paypal_subscription_id")
    .eq("merchant_user_id", userId)
    .maybeSingle();

  const subscriptionId = row?.paypal_subscription_id;
  if (subscriptionId) {
    const result = await paypalCancelSubscription(subscriptionId);
    if (!result.ok) return result;
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("merchant_subscriptions")
    .update({
      status: "canceled",
      cancel_at_period_end: false,
      updated_at: now,
    })
    .eq("merchant_user_id", userId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
