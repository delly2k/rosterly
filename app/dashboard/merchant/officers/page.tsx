import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import {
  getMerchantProfile,
  getMerchantVerificationStatus,
  getMerchantOfficers,
} from "@/app/dashboard/merchant/actions";
import { MerchantOfficersClient } from "./MerchantOfficersClient";

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
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="page-title tracking-tight">Responsible officers</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Add authorised officers and submit verification. Complete your{" "}
          <Link
            href="/dashboard/merchant/profile"
            className="font-medium text-zinc-900 underline dark:text-zinc-100"
          >
            Profile
          </Link>{" "}
          (business name and type) and add at least one officer to unlock
          verification.
        </p>
      </div>

      <MerchantOfficersClient
        profile={profileForVerify}
        officers={officers}
        verificationStatus={verification.status}
        latestVerificationStatus={verification.latestVerification?.status ?? null}
      />
    </div>
  );
}
