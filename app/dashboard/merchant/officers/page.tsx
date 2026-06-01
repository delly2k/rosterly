import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import {
  getMerchantProfile,
  getMerchantVerificationStatus,
  getMerchantOfficers,
} from "@/app/dashboard/merchant/actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { MerchantOfficersClient } from "./MerchantOfficersClient";
import { Users } from "lucide-react";

export default async function MerchantOfficersPage() {
  await requireRole(ROLES.MERCHANT);
  const [profile, verification, officers] = await Promise.all([
    getMerchantProfile(),
    getMerchantVerificationStatus(),
    getMerchantOfficers(),
  ]);

  const profileForVerify = profile
    ? {
        business_name: profile.business_name,
        business_type: profile.business_type,
      }
    : null;

  return (
    <div className="page-bg space-y-8" style={{ padding: "32px 40px" }}>
      <PageHeader
        icon={Users}
        title="Responsible officers"
        description="Add authorised officers and submit verification. Complete your business profile and add at least one officer to unlock verification."
      />

      <MerchantOfficersClient
        profile={profileForVerify}
        officers={officers}
        verificationStatus={verification.status}
        latestVerificationStatus={verification.latestVerification?.status ?? null}
      />
    </div>
  );
}
