import { getAppUrl } from "@/lib/config/appUrl";
import type { TierName } from "./types";

const PAYPAL_SANDBOX = "https://api-m.sandbox.paypal.com";

function getPlanId(tier: TierName): string | null {
  const id =
    tier === "starter"
      ? process.env.PAYPAL_STARTER_PLAN_ID
      : tier === "growth"
        ? process.env.PAYPAL_GROWTH_PLAN_ID
        : process.env.PAYPAL_PRO_PLAN_ID;
  return id ?? null;
}

/**
 * Get OAuth2 access token using client credentials.
 * POST https://api-m.sandbox.paypal.com/v1/oauth2/token
 */
export async function getAccessToken(): Promise<string | null> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !secret) {
    console.error("[PayPal] Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET");
    return null;
  }

  const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");
  try {
    const res = await fetch(`${PAYPAL_SANDBOX}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${auth}`,
      },
      body: "grant_type=client_credentials",
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[PayPal] getAccessToken failed:", res.status, text);
      return null;
    }

    const data = (await res.json()) as { access_token?: string };
    return data.access_token ?? null;
  } catch (err) {
    console.error("[PayPal] getAccessToken error:", err);
    return null;
  }
}

/**
 * Create a PayPal subscription and return the approval URL for the user to complete signup.
 * POST /v1/billing/subscriptions
 */
export async function createSubscription(
  userId: string,
  tier: TierName
): Promise<{ ok: boolean; approval_url?: string; error?: string }> {
  const planId = getPlanId(tier);
  if (!planId) {
    console.error("[PayPal] No plan ID for tier:", tier);
    return { ok: false, error: "Plan not configured for this tier." };
  }

  const token = await getAccessToken();
  if (!token) {
    return { ok: false, error: "Could not get PayPal access token." };
  }

  const body = {
    plan_id: planId,
    custom_id: userId,
    application_context: {
      brand_name: "Rosterly",
      user_action: "SUBSCRIBE_NOW",
      return_url: `${getAppUrl()}/billing/success`,
      cancel_url: `${getAppUrl()}/billing/cancel`,
    },
  };

  try {
    const res = await fetch(`${PAYPAL_SANDBOX}/v1/billing/subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = (await res.json()) as {
      links?: Array<{ rel: string; href: string }>;
      message?: string;
      details?: Array<{ issue?: string; description?: string }>;
    };

    if (!res.ok) {
      const msg =
        data.message ||
        data.details?.map((d) => d.description || d.issue).join(", ") ||
        res.statusText;
      console.error("[PayPal] createSubscription failed:", res.status, data);
      return { ok: false, error: msg };
    }

    const approveLink = data.links?.find((l) => l.rel === "approve");
    const approval_url = approveLink?.href;
    if (!approval_url) {
      console.error("[PayPal] createSubscription response missing approve link:", data);
      return { ok: false, error: "No approval URL in response." };
    }

    return { ok: true, approval_url };
  } catch (err) {
    console.error("[PayPal] createSubscription error:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to create subscription.",
    };
  }
}

/**
 * Get subscription details from PayPal (for webhook: resolve custom_id and plan_id).
 * GET /v1/billing/subscriptions/{id}
 */
export async function getSubscriptionDetails(subscriptionId: string): Promise<{
  custom_id?: string;
  plan_id?: string;
} | null> {
  const token = await getAccessToken();
  if (!token) return null;
  try {
    const res = await fetch(
      `${PAYPAL_SANDBOX}/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!res.ok) {
      console.error("[PayPal] getSubscriptionDetails failed:", res.status, await res.text());
      return null;
    }
    const data = (await res.json()) as { custom_id?: string; plan_id?: string };
    return { custom_id: data.custom_id, plan_id: data.plan_id };
  } catch (err) {
    console.error("[PayPal] getSubscriptionDetails error:", err);
    return null;
  }
}

/**
 * Cancel a PayPal subscription by ID.
 * POST /v1/billing/subscriptions/{id}/cancel
 */
export async function cancelSubscription(
  subscriptionId: string
): Promise<{ ok: boolean; error?: string }> {
  if (!subscriptionId) {
    return { ok: false, error: "Subscription ID required." };
  }

  const token = await getAccessToken();
  if (!token) {
    return { ok: false, error: "Could not get PayPal access token." };
  }

  try {
    const res = await fetch(
      `${PAYPAL_SANDBOX}/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}/cancel`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: "Merchant canceled from Rosterly" }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      let parsed: { message?: string; details?: Array<{ description?: string }> } = {};
      try {
        parsed = JSON.parse(text);
      } catch {
        // ignore
      }
      const msg =
        parsed.message ||
        parsed.details?.map((d) => d.description).join(", ") ||
        text ||
        res.statusText;
      console.error("[PayPal] cancelSubscription failed:", res.status, text);
      return { ok: false, error: msg };
    }

    return { ok: true };
  } catch (err) {
    console.error("[PayPal] cancelSubscription error:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to cancel subscription.",
    };
  }
}
