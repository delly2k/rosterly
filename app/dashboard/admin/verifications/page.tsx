import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import {
  listMerchantVerificationQueue,
  listParticipantVerificationQueue,
} from "@/app/dashboard/admin/actions";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  MerchantVerificationSection,
  ParticipantVerificationSection,
} from "./VerificationQueueCards";

export default async function AdminVerificationsPage() {
  await requireRole(ROLES.ADMIN);

  const [participantVerifications, merchantVerifications] = await Promise.all([
    listParticipantVerificationQueue(),
    listMerchantVerificationQueue(),
  ]);

  return (
    <div className="page-bg space-y-8">
      <PageHeader
        icon={BadgeCheck}
        title="Verifications"
        description="Review and approve identity submissions"
        action={
          <Link
            href="/dashboard/admin"
            className="text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
          >
            ← Admin
          </Link>
        }
      />

      <p className="text-sm text-[var(--color-ink-muted)]">
        Queue sorted with AI-flagged submissions first, then newest. Approve or reject on the
        detail page after review.
      </p>
      <ParticipantVerificationSection verifications={participantVerifications} />
      <MerchantVerificationSection verifications={merchantVerifications} />
    </div>
  );
}
