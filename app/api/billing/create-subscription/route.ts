import { NextResponse } from "next/server";
import { createClient } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { createSubscription } from "@/lib/billing/paypalProvider";
import type { TierName } from "@/lib/billing/types";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const profile = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const role = profile.data?.role;
  if (role !== ROLES.MERCHANT) {
    return NextResponse.json({ error: "Merchant access required." }, { status: 403 });
  }

  let body: { tier?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const tier = body.tier as TierName | undefined;
  const validTiers: TierName[] = ["starter", "growth", "pro"];
  if (!tier || !validTiers.includes(tier)) {
    return NextResponse.json(
      { error: "Valid tier required: starter, growth, or pro." },
      { status: 400 }
    );
  }

  const result = await createSubscription(user.id, tier);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "Failed to create subscription." },
      { status: 502 }
    );
  }

  return NextResponse.json({ approval_url: result.approval_url });
}
