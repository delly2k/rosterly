import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { listPendingVerifications } from "@/app/dashboard/admin/actions";
import { VerificationActions } from "./VerificationActions";

type VerificationItem = {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  display_name: string | null;
};

function VerificationList({ verifications }: { verifications: VerificationItem[] }) {
  return (
    <ul className="space-y-1 rounded-xl border border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900/80">
      {verifications.map((v) => (
        <li
          key={v.id}
          className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-zinc-100 px-4 py-3 last:border-b-0 dark:border-zinc-800/80 sm:flex-nowrap"
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {v.display_name?.trim() || "—"}
              </span>
              <span
                className={
                  v.status === "rejected"
                    ? "rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                    : "rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
                }
              >
                {v.status}
              </span>
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <span className="font-mono text-zinc-500 dark:text-zinc-400">
                {v.user_id.slice(0, 8)}…
              </span>
              <span>·</span>
              <time dateTime={v.created_at}>
                {new Date(v.created_at).toLocaleString(undefined, {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </time>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={`/dashboard/admin/verifications/${v.id}`}
              className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              title="View details"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only sm:inline">View</span>
            </Link>
            <VerificationActions verificationId={v.id} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default async function AdminVerificationsPage() {
  await requireRole(ROLES.ADMIN);
  const verifications = await listPendingVerifications();
  const participants = verifications.filter((v) => v.type === "participant_id");
  const merchants = verifications.filter((v) => v.type === "merchant_officer");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="page-title tracking-tight">
          Verification queue
        </h1>
        <Link
          href="/dashboard/admin"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Admin
        </Link>
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Approve or reject ID / officer verification. Rejected items stay in the
        list so you can approve them later.
      </p>

      {verifications.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-500 dark:text-zinc-400">
            No verifications to review (pending or rejected).
          </p>
        </div>
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Participant ID
            </h2>
            {participants.length === 0 ? (
              <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
                No pending participant verifications.
              </p>
            ) : (
              <VerificationList verifications={participants} />
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Merchant officer
            </h2>
            {merchants.length === 0 ? (
              <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
                No pending merchant verifications.
              </p>
            ) : (
              <VerificationList verifications={merchants} />
            )}
          </section>
        </>
      )}
    </div>
  );
}
