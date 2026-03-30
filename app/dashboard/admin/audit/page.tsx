import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { listAuditLog } from "@/app/dashboard/admin/actions";

export default async function AdminAuditPage() {
  await requireRole(ROLES.ADMIN);
  const entries = await listAuditLog(200);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title tracking-tight">
          Audit log
        </h1>
        <Link
          href="/dashboard/admin"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Admin
        </Link>
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Gig, application, booking and check-in changes. Read-only.
      </p>
      {entries.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-500 dark:text-zinc-400">No audit entries yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
                  Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
                  Entity
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
                  Action
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
                  Actor
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
                  Payload
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {entries.map((e) => (
                <tr key={e.id}>
                  <td className="whitespace-nowrap px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {new Date(e.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-sm font-mono text-zinc-900 dark:text-zinc-100">
                    {e.entity_type} {e.entity_id.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100">
                    {e.action}
                  </td>
                  <td className="px-4 py-2 text-sm text-zinc-500 dark:text-zinc-400">
                    {e.actor_id ? `${e.actor_id.slice(0, 8)}…` : "—"}
                  </td>
                  <td className="max-w-xs truncate px-4 py-2 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                    {Object.keys(e.payload ?? {}).length > 0
                      ? JSON.stringify(e.payload)
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
