import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardPathForRole } from "@/lib/dashboard";

/**
 * /dashboard redirects to role-specific dashboard (middleware does this too;
 * this handles direct access to the route).
 */
export default async function DashboardPage() {
  const current = await getCurrentUser();
  if (!current?.user || !current.profile) {
    redirect("/login?redirectTo=/dashboard");
  }
  redirect(getDashboardPathForRole(current.profile.role));
}
