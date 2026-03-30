import type { TierName, TierLimits } from "./types";

const TIER_LIMITS: Record<TierName, TierLimits> = {
  starter: {
    max_active_gigs: 2,
  },
  growth: {
    max_active_gigs: 10,
  },
  pro: {
    max_active_gigs: null, // unlimited
  },
};

/**
 * Returns limits for a given tier. Use for enforcement (e.g. max active gigs).
 */
export function getTierLimits(tier: TierName): TierLimits {
  return TIER_LIMITS[tier] ?? TIER_LIMITS.starter;
}
