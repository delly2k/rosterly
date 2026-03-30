import type { SupabaseClient } from "@supabase/supabase-js";
import type { TierName } from "./types";
import type { BillingProvider, SubscriptionStatusResult } from "./provider";

/**
 * Mock billing provider. Writes/reads merchant_subscriptions only.
 * - createSubscription: sets tier and status = 'active'
 * - cancelSubscription: sets status = 'canceled'
 * - getSubscriptionStatus: reads from DB
 */
export function createMockBillingProvider(
  supabase: SupabaseClient,
  userId: string
): BillingProvider {
  return {
    async createSubscription(tier: TierName) {
      const now = new Date().toISOString();
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      const { error } = await supabase
        .from("merchant_subscriptions")
        .upsert(
          {
            merchant_user_id: userId,
            tier,
            status: "active",
            current_period_start: now,
            current_period_end: periodEnd.toISOString(),
            cancel_at_period_end: false,
            updated_at: now,
          },
          { onConflict: "merchant_user_id" }
        );

      if (error) return { ok: false, error: error.message };
      return { ok: true };
    },

    async cancelSubscription() {
      const { error } = await supabase
        .from("merchant_subscriptions")
        .update({
          status: "canceled",
          cancel_at_period_end: false,
          updated_at: new Date().toISOString(),
        })
        .eq("merchant_user_id", userId);

      if (error) return { ok: false, error: error.message };
      return { ok: true };
    },

    async getSubscriptionStatus(userId: string): Promise<SubscriptionStatusResult | null> {
      const { data, error } = await supabase
        .from("merchant_subscriptions")
        .select("tier, status, current_period_end, cancel_at_period_end")
        .eq("merchant_user_id", userId)
        .maybeSingle();

      if (error || !data) return null;
      return {
        tier: data.tier as TierName,
        status: data.status,
        current_period_end: data.current_period_end ?? null,
        cancel_at_period_end: data.cancel_at_period_end ?? false,
      };
    },
  };
}
