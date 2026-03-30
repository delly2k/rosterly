// For local testing use ngrok and set webhook URL to:
// https://your-ngrok-url/api/paypal/webhook

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/auth";
import { getSubscriptionDetails } from "@/lib/billing/paypalProvider";
import type { TierName } from "@/lib/billing/types";

function planIdToTier(planId: string): TierName {
  if (planId === process.env.PAYPAL_STARTER_PLAN_ID) return "starter";
  if (planId === process.env.PAYPAL_GROWTH_PLAN_ID) return "growth";
  if (planId === process.env.PAYPAL_PRO_PLAN_ID) return "pro";
  return "starter";
}

export async function POST(request: Request) {
  console.log("📩 PayPal webhook received");
  console.log("Headers:", Object.fromEntries(request.headers.entries()));

  let body: {
    event_type?: string;
    resource?: { id?: string; plan_id?: string };
  };
  try {
    body = await request.json();
  } catch (err) {
    console.error("[PayPal webhook] Invalid JSON", err instanceof Error ? err.stack : err);
    return NextResponse.json({}, { status: 400 });
  }

  console.log("Event:", body.event_type);

  try {
  const eventType = body.event_type ?? "";
  const resource = body.resource ?? {};
  const subscriptionId = resource.id;

  console.log("[PayPal webhook] event_type:", eventType, "resource.id:", subscriptionId);

  const supabase = createAdminClient();

  switch (eventType) {
    case "BILLING.SUBSCRIPTION.ACTIVATED": {
      if (!subscriptionId) {
        console.error("[PayPal webhook] ACTIVATED missing resource.id");
        return NextResponse.json({}, { status: 400 });
      }
      const details = await getSubscriptionDetails(subscriptionId);
      if (!details?.custom_id) {
        console.error("[PayPal webhook] ACTIVATED could not get custom_id for", subscriptionId);
        return NextResponse.json({}, { status: 200 });
      }
      const tier = details.plan_id ? planIdToTier(details.plan_id) : "starter";
      const now = new Date().toISOString();
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      const { error } = await supabase
        .from("merchant_subscriptions")
        .update({
          tier,
          status: "active",
          paypal_subscription_id: subscriptionId,
          current_period_start: now,
          current_period_end: periodEnd.toISOString(),
          cancel_at_period_end: false,
          updated_at: now,
        })
        .eq("merchant_user_id", details.custom_id);

      if (error) {
        console.error("[PayPal webhook] ACTIVATED update failed:", error);
        return NextResponse.json({}, { status: 500 });
      }
      console.log("[PayPal webhook] ACTIVATED updated merchant", details.custom_id, "tier", tier);
      break;
    }

    case "BILLING.SUBSCRIPTION.CANCELLED": {
      if (!subscriptionId) {
        console.error("[PayPal webhook] CANCELLED missing resource.id");
        return NextResponse.json({}, { status: 400 });
      }
      const now = new Date().toISOString();
      const { error } = await supabase
        .from("merchant_subscriptions")
        .update({
          status: "canceled",
          cancel_at_period_end: false,
          updated_at: now,
        })
        .eq("paypal_subscription_id", subscriptionId);

      if (error) {
        console.error("[PayPal webhook] CANCELLED update failed:", error);
        return NextResponse.json({}, { status: 500 });
      }
      console.log("[PayPal webhook] CANCELLED subscription", subscriptionId);
      break;
    }

    case "BILLING.SUBSCRIPTION.SUSPENDED": {
      if (!subscriptionId) {
        console.error("[PayPal webhook] SUSPENDED missing resource.id");
        return NextResponse.json({}, { status: 400 });
      }
      const now = new Date().toISOString();
      const { error } = await supabase
        .from("merchant_subscriptions")
        .update({ status: "past_due", updated_at: now })
        .eq("paypal_subscription_id", subscriptionId);

      if (error) {
        console.error("[PayPal webhook] SUSPENDED update failed:", error);
        return NextResponse.json({}, { status: 500 });
      }
      console.log("[PayPal webhook] SUSPENDED subscription", subscriptionId);
      break;
    }

    case "PAYMENT.SALE.COMPLETED":
      console.log("[PayPal webhook] PAYMENT.SALE.COMPLETED", resource);
      break;

    default:
      console.log("[PayPal webhook] Unhandled event:", eventType);
  }

  return NextResponse.json({});
  } catch (err) {
    console.error("[PayPal webhook] Unexpected error", err instanceof Error ? err.stack : err);
    return NextResponse.json({}, { status: 500 });
  }
}
