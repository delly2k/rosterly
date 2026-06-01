"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient, createClient } from "@/lib/auth";
import type { Role } from "@/lib/roles";
import { PROFILE_STATUS } from "@/lib/roles";

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

/** Permanently delete the current user's account (soft-delete profile, remove auth user). */
export async function deleteAccount(): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Authentication required." };

  const admin = createAdminClient();

  const { error: profileError } = await admin
    .from("profiles")
    .update({ status: PROFILE_STATUS.BANNED })
    .eq("id", user.id);
  if (profileError) {
    return { ok: false, error: profileError.message };
  }

  await admin.from("audit_log").insert({
    entity_type: "profile",
    entity_id: user.id,
    action: "self_deleted",
    actor_id: user.id,
    payload: { reason: "self_deleted" },
  });

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) {
    return { ok: false, error: deleteError.message };
  }

  await supabase.auth.signOut();
  return { ok: true };
}

export type BlockedUserRow = {
  id: string;
  blocked_id: string;
  created_at: string;
  display_name: string | null;
  role: string;
};

/** List users blocked by the current user with display names and roles. */
export async function listBlockedUsers(): Promise<BlockedUserRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: blocks } = await supabase
    .from("blocked_users")
    .select("id, blocked_id, created_at")
    .eq("blocker_id", user.id)
    .order("created_at", { ascending: false });

  if (!blocks?.length) return [];

  const blockedIds = blocks.map((b) => b.blocked_id);

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, role")
    .in("id", blockedIds);

  const roleById = new Map(
    (profiles ?? []).map((p: { id: string; role: string }) => [p.id, p.role])
  );

  const participantIds = blockedIds.filter((id) => roleById.get(id) === "participant");
  const merchantIds = blockedIds.filter((id) => roleById.get(id) === "merchant");

  const nameById = new Map<string, string | null>();

  if (participantIds.length > 0) {
    const { data: participants } = await supabase
      .from("participant_profiles")
      .select("user_id, full_name")
      .in("user_id", participantIds);
    (participants ?? []).forEach((p: { user_id: string; full_name: string | null }) => {
      nameById.set(p.user_id, p.full_name?.trim() || null);
    });
  }

  if (merchantIds.length > 0) {
    const { data: merchants } = await supabase
      .from("merchant_profiles")
      .select("user_id, business_name")
      .in("user_id", merchantIds);
    (merchants ?? []).forEach((m: { user_id: string; business_name: string | null }) => {
      nameById.set(m.user_id, m.business_name?.trim() || null);
    });
  }

  return blocks.map((b) => ({
    id: b.id,
    blocked_id: b.blocked_id,
    created_at: b.created_at,
    display_name: nameById.get(b.blocked_id) ?? null,
    role: roleById.get(b.blocked_id) ?? "unknown",
  }));
}

/** Remove a blocked user row for the current user. */
export async function unblockUser(
  blockedUserId: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Authentication required." };

  const { error } = await supabase
    .from("blocked_users")
    .delete()
    .eq("blocker_id", user.id)
    .eq("blocked_id", blockedUserId);

  if (error) return { ok: false, error: "Could not unblock user." };

  revalidatePath("/dashboard/settings/safety");
  return { ok: true };
}
