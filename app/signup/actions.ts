"use server";

import { createAdminClient } from "@/lib/auth";

/**
 * Create a new user with email already confirmed (no confirmation email sent).
 * Uses the Supabase Admin API so we avoid rate limits and don't require "Confirm email" in the dashboard.
 */
export async function signUpWithAutoConfirm(email: string, password: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) {
    throw new Error(error.message);
  }
  return data;
}
