import type { TierName } from "./types";

export type SubscriptionStatusResult = {
  tier: TierName;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
};

/**
 * Billing provider interface. Implementations (mock, future PayPal) must satisfy this.
 * Provider is used in the context of a single merchant (userId set at construction or per call).
 */
export interface BillingProvider {
  createSubscription(tier: TierName): Promise<{ ok: boolean; error?: string }>;
  cancelSubscription(): Promise<{ ok: boolean; error?: string }>;
  getSubscriptionStatus(userId: string): Promise<SubscriptionStatusResult | null>;
}
