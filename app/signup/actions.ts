"use server";

import { createAdminClient } from "@/lib/auth";
import type { Role } from "@/lib/roles";
import { ROLES } from "@/lib/roles";

type SignUpResult = {
  userId: string;
  role: Role;
};

/**
 * Create auth user (email confirmed) and ensure profiles.role matches signup intent.
 * Trigger on_auth_user_created always inserts profiles with role=participant; we
 * patch merchant signups immediately via service role (bypasses RLS).
 */
async function createUserWithRole(
  email: string,
  password: string,
  role: Role,
  businessName?: string
): Promise<SignUpResult> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) {
    throw new Error(error.message);
  }

  const userId = data.user?.id;
  if (!userId) {
    throw new Error("User creation failed");
  }

  if (role === ROLES.MERCHANT) {
    const { error: roleError } = await supabase
      .from("profiles")
      .update({ role: ROLES.MERCHANT })
      .eq("id", userId);
    if (roleError) {
      throw new Error(roleError.message);
    }

    const trimmedName = businessName?.trim();
    if (trimmedName) {
      const { error: profileError } = await supabase
        .from("merchant_profiles")
        .insert({
          user_id: userId,
          business_name: trimmedName,
        });
      if (profileError) {
        throw new Error(profileError.message);
      }
    }
  }

  return { userId, role };
}

/** Talent (participant) signup — profile role stays participant from DB trigger. */
export async function signUpParticipant(
  email: string,
  password: string
): Promise<SignUpResult> {
  return createUserWithRole(email, password, ROLES.PARTICIPANT);
}

/** Merchant signup — sets profiles.role to merchant and seeds merchant_profiles. */
export async function signUpMerchant(
  email: string,
  password: string,
  businessName: string
): Promise<SignUpResult> {
  return createUserWithRole(email, password, ROLES.MERCHANT, businessName);
}
