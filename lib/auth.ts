import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Role } from "@/lib/roles";
import { PROFILE_STATUS } from "@/lib/roles";

export type Profile = {
  id: string;
  role: Role;
  status: string;
  created_at: string;
};

export type CurrentUser = {
  user: { id: string; email?: string };
  profile: Profile | null;
};

/**
 * Supabase client for Server Components, Route Handlers, and Server Actions.
 * Uses anon key; RLS and cookie-based session apply.
 */
export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing env: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[]
      ) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Ignore in middleware
        }
      },
    },
  });
}

/**
 * Supabase client with service role for server-only admin operations (e.g. create user with email_confirm).
 * Never expose this client or the service role key to the client.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (required for admin signup)"
    );
  }
  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Get current authenticated user and profile from Supabase (server-only).
 * Role and status always come from DB; never trust client.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, status, created_at")
    .eq("id", user.id)
    .single();

  return {
    user: { id: user.id, email: user.email },
    profile: profile as Profile | null,
  };
}

/** Thrown when auth/role/verification checks fail. Use generic message to user. */
export class AuthError extends Error {
  constructor(message = "Authentication failed") {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Require current user to have the given role (server-only).
 * Throws AuthError if not authenticated or wrong role.
 */
export async function requireRole(
  role: Role
): Promise<NonNullable<CurrentUser>> {
  const current = await getCurrentUser();
  if (!current?.user) throw new AuthError("Authentication required");
  if (!current.profile) throw new AuthError("Profile not found");
  if (current.profile.role !== role)
    throw new AuthError("You do not have access to this page");
  return current as NonNullable<CurrentUser>;
}

/**
 * Require current user to be active (server-only).
 * Blocks pending, suspended, and banned. Use for protected actions.
 */
export async function requireVerified(): Promise<NonNullable<CurrentUser>> {
  const current = await getCurrentUser();
  if (!current?.user) throw new AuthError("Authentication required");
  if (!current.profile) throw new AuthError("Profile not found");
  if (current.profile.status !== PROFILE_STATUS.ACTIVE)
    throw new AuthError("Your account is not active. Please contact support.");
  return current as NonNullable<CurrentUser>;
}
