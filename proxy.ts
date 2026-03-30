import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Role } from "@/lib/roles";
import { PROFILE_STATUS } from "@/lib/roles";
import { getDashboardPathForRole } from "@/lib/dashboard";

const PUBLIC_PATHS = ["/", "/login", "/signup", "/blocked"];
const DASHBOARD_BASE = "/dashboard";

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: {
          name: string;
          value: string;
          options: Record<string, unknown>;
        }[]
      ) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  // Public routes: only refresh session, no redirect
  if (isPublicPath(pathname)) {
    await supabase.auth.getUser();
    return response;
  }

  // Protected routes: require auth
  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Fetch profile from DB (role/status never from client)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .single();

  const role = (profile?.role as Role) ?? "participant";
  const status = profile?.status ?? "pending";

  // Block suspended/banned users
  if (
    status === PROFILE_STATUS.SUSPENDED ||
    status === PROFILE_STATUS.BANNED
  ) {
    return NextResponse.redirect(new URL("/blocked", request.url));
  }

  // Role-based dashboard redirect: /dashboard -> /dashboard/{role}
  if (pathname === DASHBOARD_BASE || pathname === `${DASHBOARD_BASE}/`) {
    return NextResponse.redirect(
      new URL(getDashboardPathForRole(role), request.url)
    );
  }

  // Enforce role for dashboard sub-routes: /dashboard/participant only for participants, etc.
  if (pathname.startsWith(`${DASHBOARD_BASE}/`)) {
    const segment = pathname.slice(DASHBOARD_BASE.length + 1);
    const pathRole = segment.split("/")[0] as Role;
    const allowedRoles: Role[] = ["participant", "merchant", "admin"];
    if (allowedRoles.includes(pathRole) && pathRole !== role) {
      return NextResponse.redirect(
        new URL(getDashboardPathForRole(role), request.url)
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
