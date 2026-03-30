import { createClient } from "@/lib/auth";
import { getMerchantSubscription } from "./service";
import { getTierLimits } from "./tierConfig";
import type { TierName } from "./types";

/** Error code returned when plan limit is reached (e.g. max active gigs). */
export const PLAN_LIMIT_REACHED = "PLAN_LIMIT_REACHED";

export type UsageSummary = {
  tier: TierName;
  status: string;
  activeGigs: number;
  maxActiveGigs: number | null; // null = unlimited
  atLimit: boolean;
  canCreateGig: boolean;
};

/**
 * Returns whether the merchant can create another gig (soft check).
 * Use with current active gig count; unlimited tier always returns true.
 */
export function canCreateGig(
  _userId: string,
  activeGigCount: number,
  tier: TierName
): boolean {
  const limits = getTierLimits(tier);
  if (limits.max_active_gigs == null) return true;
  return activeGigCount < limits.max_active_gigs;
}

/**
 * Returns usage summary for the merchant (tier, status, active count, limit, atLimit, canCreateGig).
 * Must be called in a request where the current user is the merchant (RLS).
 */
export async function getUsageSummary(userId: string): Promise<UsageSummary | null> {
  const subscription = await getMerchantSubscription(userId);
  if (!subscription) return null;

  const supabase = await createClient();
  const { count, error } = await supabase
    .from("gigs")
    .select("id", { count: "exact", head: true })
    .eq("merchant_user_id", userId)
    .in("status", ["open", "filled"]);

  if (error) return null;
  const activeGigs = count ?? 0;
  const limits = getTierLimits(subscription.tier as TierName);
  const maxActiveGigs = limits.max_active_gigs;
  const atLimit =
    maxActiveGigs != null && activeGigs >= maxActiveGigs;
  const canCreateGigFlag = !atLimit;

  return {
    tier: subscription.tier as TierName,
    status: subscription.status,
    activeGigs,
    maxActiveGigs: maxActiveGigs ?? null,
    atLimit,
    canCreateGig: canCreateGigFlag,
  };
}
