import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { getVerificationDetail } from "@/app/dashboard/admin/actions";
import { VerificationActions } from "../VerificationActions";
import { ZoomableImage } from "./ZoomableImage";

export default async function AdminVerificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(ROLES.ADMIN);
  const { id } = await params;
  const detail = await getVerificationDetail(id);

  if (!detail) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard/admin/verifications"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Verification queue
        </Link>
        <p className="text-zinc-600 dark:text-zinc-400">Verification not found.</p>
      </div>
    );
  }

  const typeLabel =
    detail.type === "participant_id" ? "Participant ID" : "Merchant officer";

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/dashboard/admin/verifications"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← Verification queue
          </Link>
          <h1 className="page-title mt-2 tracking-tight">
            Verification details
          </h1>
        </div>
        {(detail.status === "pending" || detail.status === "rejected") && (
          <VerificationActions verificationId={detail.id} />
        )}
      </div>

      <div className="rounded-[4px] border-[3px] border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
              User ID
            </dt>
            <dd className="mt-1 font-mono text-sm text-zinc-900 dark:text-zinc-100">
              {detail.user_id}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
              Name
            </dt>
            <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">
              {detail.userFullName ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
              Type
            </dt>
            <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">
              {typeLabel}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
              Submitted
            </dt>
            <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">
              {new Date(detail.created_at).toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
              Status
            </dt>
            <dd className="mt-1 text-sm font-medium capitalize text-zinc-900 dark:text-zinc-100">
              {detail.status}
            </dd>
          </div>
        </dl>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="rounded-[4px] border-[3px] border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="section-title text-base">ID document</h2>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Compare with the selfie before approving.
          </p>
          {detail.idDocSignedUrl ? (
            <ZoomableImage src={detail.idDocSignedUrl} alt="ID document" />
          ) : (
            <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
              No ID document uploaded.
            </p>
          )}
        </div>

        <div className="rounded-[4px] border-[3px] border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="section-title text-base">Selfie</h2>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Should match the person on the ID.
          </p>
          {detail.selfieSignedUrl ? (
            <ZoomableImage src={detail.selfieSignedUrl} alt="Selfie" />
          ) : (
            <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
              No selfie uploaded.
            </p>
          )}
        </div>
      </div>

      {(detail.status === "pending" || detail.status === "rejected") && (
        <div className="border-t border-zinc-200 pt-6 dark:border-zinc-700">
          {detail.type === "participant_id" && (
            <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
              Approving will set this selfie as the participant&apos;s profile photo.
            </p>
          )}
          <div className="flex justify-end gap-3">
            <VerificationActions verificationId={detail.id} />
          </div>
        </div>
      )}
    </div>
  );
}
