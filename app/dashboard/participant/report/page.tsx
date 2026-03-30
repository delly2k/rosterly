import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { ReportForm } from "./ReportForm";

export default async function ParticipantReportPage() {
  await requireRole(ROLES.PARTICIPANT);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="page-title tracking-tight">
          Submit a report
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Describe the issue. Reports are reviewed by admins. Do not use for
          emergencies—call local emergency services.
        </p>
      </div>

      <ReportForm />
    </div>
  );
}
