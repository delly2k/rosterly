import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { getMerchantDashboardData } from "@/app/dashboard/merchant/actions";
import { VerificationBadge } from "@/app/dashboard/participant/VerificationBadge";
import { PageHeader } from "@/components/ui/PageHeader";
import { VerificationBanner } from "@/components/dashboard/VerificationBanner";
import { MerchantDashboardClient } from "./MerchantDashboardClient";
import { LayoutDashboard } from "lucide-react";

export default async function MerchantDashboardPage() {
  await requireRole(ROLES.MERCHANT);
  const data = await getMerchantDashboardData();
  if (!data) return null;

  return (
    <div className="page-bg space-y-8">
      <PageHeader
        icon={LayoutDashboard}
        title="Merchant dashboard"
        description="Manage your gigs and talent"
        action={
          data.verificationStatus === "verified" ? (
            <VerificationBadge status="verified" />
          ) : undefined
        }
      />

      {data.verificationStatus !== "verified" && (
        <VerificationBanner
          href="/dashboard/merchant/verification"
          title={
            data.verificationStatus === "pending"
              ? "Verification pending review"
              : "Complete your verification"
          }
          subtitle={
            data.verificationStatus === "pending"
              ? "We are reviewing your business verification. Check back for updates."
              : "You must verify your business before you can post gigs"
          }
          ctaLabel={
            data.verificationStatus === "pending" ? "View status →" : "Verify now →"
          }
        />
      )}

      <MerchantDashboardClient data={data} />
    </div>
  );
}
