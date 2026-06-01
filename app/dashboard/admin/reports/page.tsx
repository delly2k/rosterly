import Link from "next/link";
import { Flag } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { listReports } from "@/app/dashboard/admin/actions";
import { REPORT_CATEGORY_LABELS } from "@/app/dashboard/admin/constants";
import { PageHeader } from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { ReportActions } from "./ReportActions";

function reportStatusClass(status: string) {
  if (status === "pending") return "pill-warning";
  if (status === "resolved") return "pill-green";
  if (status === "dismissed") return "pill-gold";
  return "pill-gold";
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireRole(ROLES.ADMIN);
  const { status } = await searchParams;
  const reports = await listReports({ status: status || undefined });

  const filterClass = (active: boolean) =>
    active
      ? "rounded-lg bg-[var(--color-gold)] px-3 py-1.5 text-sm font-medium text-white"
      : "rounded-lg border border-[var(--color-border)] bg-white px-3 py-1.5 text-sm font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-page)]";

  return (
    <div className="page-bg space-y-6">
      <PageHeader
        icon={Flag}
        title="Reports & disputes"
        description="Review and resolve reported issues"
      />
      <div className="flex gap-2">
        <Link href="/dashboard/admin/reports" className={filterClass(!status)}>
          All
        </Link>
        <Link
          href="/dashboard/admin/reports?status=pending"
          className={filterClass(status === "pending")}
        >
          Pending
        </Link>
        <Link
          href="/dashboard/admin/reports?status=resolved"
          className={filterClass(status === "resolved")}
        >
          Resolved
        </Link>
      </div>
      {reports.length === 0 ? (
        <EmptyState
          icon={Flag}
          title="No open reports"
          description="All reports have been resolved"
          variant="success"
        />
      ) : (
        <ul className="space-y-4">
          {reports.map((r) => (
            <li key={r.id} className="surface-card p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-[var(--color-ink)]">
                  {REPORT_CATEGORY_LABELS[r.category ?? "other"] ?? r.category ?? "Other"}
                </span>
                <span className={reportStatusClass(r.status)}>{r.status}</span>
              </div>
              <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                {r.description || "No description."}
              </p>
              <p className="mt-1 text-xs text-[var(--color-ink-hint)]">
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
