import Link from "next/link";
import { Users } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { listProfilesForAdmin } from "@/app/dashboard/admin/actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { AdminUsersTable } from "./AdminUsersTable";

export default async function AdminUsersPage() {
  await requireRole(ROLES.ADMIN);
  const users = await listProfilesForAdmin();

  return (
    <div className="page-bg space-y-6">
      <PageHeader
        icon={Users}
        title="User management"
        description="Suspend or ban platform users"
        action={
          <Link
            href="/dashboard/admin"
            className="text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
          >
            ← Admin
          </Link>
        }
      />
      <AdminUsersTable users={users} />
    </div>
  );
}
