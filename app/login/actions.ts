"use server";

import { createClient } from "@/lib/auth";
import { redirect } from "next/navigation";

const AUTH_ERROR_MESSAGE = "Invalid email or password. Please try again.";
const CONFIG_ERROR_MESSAGE =
  "Cannot reach Supabase. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env, then restart the dev server.";

export type SignInResult = { ok: false; error: string };

/**
 * Sign in via server-side Supabase client (sets session cookies).
 * On success, redirects — does not return.
 */
export async function signInWithPassword(
  email: string,
  password: string,
  redirectTo?: string
): Promise<SignInResult | void> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      return { ok: false, error: AUTH_ERROR_MESSAGE };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (
      message.includes("fetch") ||
      message.includes("ENOTFOUND") ||
      message.includes("ECONNREFUSED") ||
      message.includes("Missing env")
    ) {
      return { ok: false, error: CONFIG_ERROR_MESSAGE };
    }
    return { ok: false, error: AUTH_ERROR_MESSAGE };
  }

  const target =
    redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")
      ? redirectTo
      : "/dashboard";
  redirect(target);
}
