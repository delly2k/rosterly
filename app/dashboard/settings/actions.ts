"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/auth";
import { AuthError } from "@/lib/auth";
import type { Role } from "@/lib/roles";

/** Get current user email and profile role/status for account settings. */
export async function getAccountSettings() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .single();

  return {
    email: user.email ?? null,
    role: (profile?.role as Role) ?? null,
    status: profile?.status ?? null,
  };
}

/** Get notification_settings from profiles. */
export async function getNotificationSettings(): Promise<Record<string, boolean>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return {};

  const { data } = await supabase
    .from("profiles")
    .select("notification_settings")
    .eq("id", user.id)
    .single();

  const raw = (data as { notification_settings?: unknown } | null)?.notification_settings;
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, boolean>;
  }
  return {};
}

/** Update notification_settings. Keys are feature-specific; no enforcement yet. */
export async function updateNotificationSettings(
  settings: Record<string, boolean>
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Authentication required." };

  const { error } = await supabase
    .from("profiles")
    .update({ notification_settings: settings })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/settings/notifications");
  return { ok: true };
}

/** Get merchant visibility_settings. */
export async function getMerchantVisibilitySettings(): Promise<Record<string, unknown>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return {};

  const { data } = await supabase
    .from("merchant_profiles")
    .select("visibility_settings")
    .eq("user_id", user.id)
    .single();

  const raw = (data as { visibility_settings?: unknown } | null)?.visibility_settings;
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  return {};
}

/** Update merchant visibility_settings. */
export async function updateMerchantVisibilitySettings(
  settings: Record<string, unknown>
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Authentication required." };

  const { error } = await supabase
    .from("merchant_profiles")
    .update({
      visibility_settings: settings,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/settings/privacy");
  return { ok: true };
}
