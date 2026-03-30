"use server";

import { createAdminClient } from "@/lib/auth";

/**
 * Create a new user with email already confirmed (no confirmation email sent).
 * Uses the Supabase Admin API so we avoid rate limits and don't require "Confirm email" in the dashboard.
 * Optional `userMetadata` is merged into `user_metadata` (e.g. merchant signup intent).
 */
export async function signUpWithAutoConfirm(
  email: string,
  password: string,
  userMetadata?: Record<string, unknown>
) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    ...(userMetadata && Object.keys(userMetadata).length > 0
      ? { user_metadata: userMetadata }
      : {}),
  });
  if (error) {
    throw new Error(error.message);
  }
  return data;
}
