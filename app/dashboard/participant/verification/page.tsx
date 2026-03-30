import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import Link from "next/link";
import {
  getVerificationStatus,
} from "@/app/dashboard/participant/actions";
import { VerificationBadge } from "../VerificationBadge";
import { VerificationForm } from "./VerificationForm";

export default async function ParticipantVerificationPage() {
  await requireRole(ROLES.PARTICIPANT);
  const { status, latestVerification, profileComplete } = await getVerificationStatus();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="page-title tracking-tight">
          Identity verification
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Upload an ID document and a selfie. Admin approval is required to
          become verified.
        </p>
        <div className="mt-4">
          <VerificationBadge status={status} />
        </div>
      </div>

      {status === "pending" && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-200">
          Your verification is under review. You will not be able to change
          your name or profile photo after submission.
        </div>
      )}

      {status === "verified" && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-800 dark:bg-green-950/50 dark:text-green-200">
          You are verified. Your identity documents are on file.
        </div>
      )}

      {status === "unverified" && !profileComplete && (
        <div className="rounded-[4px] border-[3px] border-black bg-[#FDE047] p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <p className="font-bold text-black">
            Complete your profile before verification
          </p>
          <p className="mt-2 text-sm text-black/90">
            Your full name (and optionally photo) must be set before we can process verification. Name and photo are locked after you submit.
          </p>
          <Link
            href="/dashboard/participant/profile"
            className="mt-4 inline-block rounded-[4px] border-[3px] border-black bg-[#1D4ED8] px-4 py-3 text-sm font-bold text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-[#1e40af] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
          >
            Go to Profile
          </Link>
        </div>
      )}

      {status === "unverified" && profileComplete && (
        <VerificationForm latestStatus={latestVerification?.status} />
      )}

      {status === "pending" && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Submitted. An admin will review your documents shortly.
        </p>
      )}
    </div>
  );
}
