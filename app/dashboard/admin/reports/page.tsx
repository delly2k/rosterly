import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { listReports } from "@/app/dashboard/admin/actions";
import { REPORT_CATEGORY_LABELS } from "@/app/dashboard/admin/constants";
import { ReportActions } from "./ReportActions";

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireRole(ROLES.ADMIN);
  const { status } = await searchParams;
  const reports = await listReports({ status: status || undefined });

  return (
    <div className="space-y-6">
      <h1 className="page-title tracking-tight">
        Reports & disputes
      </h1>
      <p className="text-sm leading-relaxed text-black/80">
        Disputes: Non-payment, Harassment, Unsafe environment. Resolve or
        dismiss after review.
      </p>
      <div className="flex gap-2">
        <Link
          href="/dashboard/admin/reports"
          className={`rounded px-3 py-1.5 text-sm font-medium ${
            !status
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          All
        </Link>
        <Link
          href="/dashboard/admin/reports?status=pending"
          className={`rounded px-3 py-1.5 text-sm font-medium ${
            status === "pending"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          Pending
        </Link>
        <Link
          href="/dashboard/admin/reports?status=resolved"
          className={`rounded px-3 py-1.5 text-sm font-medium ${
            status === "resolved"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          Resolved
        </Link>
      </div>
      {reports.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-500 dark:text-zinc-400">No reports match.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {reports.map((r) => (
            <li
              key={r.id}
              className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {REPORT_CATEGORY_LABELS[r.category ?? "other"] ?? r.category ?? "Other"}
                </span>
                <span
                  className={`rounded px-2 py-0.5 text-xs ${
                    r.status === "pending"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200"
                      : r.status === "resolved"
                        ? "bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-200"
                        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {r.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {r.description || "No description."}
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                Reporter {r.reporter_id.slice(0, 8)}…{" "}
                {r.reported_id && `· Reported ${r.reported_id.slice(0, 8)}…`}{" "}
                · {new Date(r.created_at).toLocaleString()}
              </p>
              {r.status === "pending" && (
                <div className="mt-3">
                  <ReportActions reportId={r.id} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
