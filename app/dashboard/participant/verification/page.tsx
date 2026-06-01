import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { getVerificationStatus } from "@/app/dashboard/participant/actions";
import { VerificationBanner } from "@/components/dashboard/VerificationBanner";
import { PageHeader } from "@/components/ui/PageHeader";
import { VerificationBadge } from "../VerificationBadge";
import { VerificationForm } from "./VerificationForm";
import { ShieldCheck } from "lucide-react";

export default async function ParticipantVerificationPage() {
  await requireRole(ROLES.PARTICIPANT);
  const { status, latestVerification, profileComplete } = await getVerificationStatus();

  return (
    <div className="page-bg">
      <div style={{ padding: "32px 40px" }} className="space-y-6 sm:space-y-8">
      <PageHeader
        icon={ShieldCheck}
        title="Identity verification"
        description="Verified profiles are shown first to merchants and unlock more gig opportunities. We review submissions manually — usually within 1–2 business days."
        action={<VerificationBadge status={status} />}
      />

      {status === "pending" && (
        <div className="surface-card border-[var(--color-warning)]/30 bg-[var(--color-warning-light)] p-4 sm:p-5">
          <p className="text-sm leading-relaxed text-[var(--color-warning)]">
            Your verification is under review. You will not be able to change your name or
            profile photo after submission.
          </p>
          <p className="mt-3 text-sm text-[var(--color-ink-muted)]">
            Submitted. An admin will review your documents shortly — usually within 1–2 business
            days.
          </p>
        </div>
      )}

      {status === "verified" && (
        <div className="surface-card border-[var(--color-green-border)] bg-[var(--color-green-light)] p-4 sm:p-5">
          <p className="text-sm leading-relaxed text-[var(--color-green)]">
            You are verified. Your identity documents are on file.
          </p>
        </div>
      )}

      {status === "unverified" && !profileComplete && (
        <VerificationBanner
          href="/dashboard/participant/profile"
          title="Complete your profile before verification"
          subtitle="Your full name must be set before we can process verification. Name and photo are locked after you submit."
          ctaLabel="Go to Profile →"
        />
      )}

      {status === "unverified" && profileComplete && (
        <VerificationForm latestStatus={latestVerification?.status} />
      )}
      </div>
    </div>
  );
}
