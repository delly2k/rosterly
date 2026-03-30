import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import type { Role } from "@/lib/roles";
import { ROLES } from "@/lib/roles";
import { SettingsLayout } from "@/components/settings/SettingsLayout";

export default async function DashboardSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const current = await getCurrentUser();
  if (!current?.user || !current.profile) {
    return null;
  }

  const role = current.profile.role as Role;
  if (role === ROLES.ADMIN) {
    redirect("/dashboard/admin");
  }

  return <SettingsLayout role={role}>{children}</SettingsLayout>;
}
