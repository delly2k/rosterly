import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import {
  getMerchantProfile,
  getMerchantOfficers,
  getMerchantVerificationStatus,
} from "@/app/dashboard/merchant/actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { MerchantProfileForm } from "./MerchantProfileForm";
import { Building2 } from "lucide-react";

export default async function MerchantProfilePage() {
  await requireRole(ROLES.MERCHANT);
  const [profile, officers, verification] = await Promise.all([
    getMerchantProfile(),
    getMerchantOfficers(),
    getMerchantVerificationStatus(),
  ]);

  const needsVerification =
    !verification.verified || officers.length === 0;

  return (
    <div className="page-bg space-y-8">
      <PageHeader
        icon={Building2}
        title="Business profile"
        description="Your company details and verification"
      />

      <MerchantProfileForm initial={profile} />

      {needsVerification && (
        <div
          className="rounded-xl border border-[var(--color-warning)]/30 bg-[var(--color-warning-light)] p-4"
          role="status"
        >
          <p className="text-sm font-medium text-[var(--color-warning)]">
            You need to be verified before you can post gigs.
          </p>
          <p className="mt-1 text-sm text-[var(--color-warning)]">
            {officers.length === 0
              ? "Add at least one responsible officer and submit verification."
              : "Complete verification on the Responsible officers page."}
          </p>
          <Link
            href="/dashboard/merchant/officers"
            className="mt-3 inline-block text-sm font-medium text-[var(--color-gold)] underline underline-offset-2 hover:no-underline"
          >
            Go to Responsible officers
          </Link>
        </div>
      )}
    </div>
  );
}
