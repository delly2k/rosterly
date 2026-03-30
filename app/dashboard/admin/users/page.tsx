import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { listProfilesForAdmin } from "@/app/dashboard/admin/actions";
import { UserStatusActions } from "./UserStatusActions";

export default async function AdminUsersPage() {
  await requireRole(ROLES.ADMIN);
  const profiles = await listProfilesForAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title tracking-tight">
          User management
        </h1>
        <Link
          href="/dashboard/admin"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Admin
        </Link>
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Suspend or ban users. Blocked by middleware. Use with care.
      </p>
      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
                User ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
                Role
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
                Created
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
            {profiles.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {p.display_name ?? "—"}
                </td>
                <td className="px-4 py-3 text-sm font-mono text-zinc-600 dark:text-zinc-400">
                  <Link
                    href={`/dashboard/admin/users/${p.id}`}
                    className="text-[#1D4ED8] underline hover:no-underline"
                  >
                    {p.id.slice(0, 8)}…
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                  {p.role}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${
                      p.status === "active"
                        ? "bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-200"
                        : p.status === "suspended"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200"
                          : p.status === "banned"
                            ? "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-200"
                            : "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">
                  {new Date(p.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/dashboard/admin/users/${p.id}`}
                    className="mr-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  >
                    View
                  </Link>
                  <UserStatusActions
                    userId={p.id}
                    currentStatus={p.status}
                    isAdmin={p.role === ROLES.ADMIN}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
