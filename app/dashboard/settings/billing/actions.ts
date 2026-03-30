"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/auth";
import { upgradeTier as upgradeTierService, cancelTier as cancelTierService } from "@/lib/billing/service";
import type { TierName } from "@/lib/billing/types";

export async function upgradeTierAction(tier: TierName): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated." };
  const result = await upgradeTierService(user.id, tier);
  if (result.ok) revalidatePath("/dashboard/settings/billing");
  return result;
}

export async function cancelTierAction(): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated." };
  const result = await cancelTierService(user.id);
  if (result.ok) revalidatePath("/dashboard/settings/billing");
  return result;
}
