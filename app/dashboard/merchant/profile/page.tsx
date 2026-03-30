import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import {
  getMerchantProfile,
  getMerchantOfficers,
  getMerchantVerificationStatus,
} from "@/app/dashboard/merchant/actions";
import { MerchantProfileForm } from "./MerchantProfileForm";

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
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="page-title tracking-tight">
          Business profile
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Enter your business details. Manage responsible officers and
          verification from the Responsible officers page.
        </p>
      </div>

      <MerchantProfileForm initial={profile} />

      {needsVerification && (
        <div
          className="rounded-[4px] border-[3px] border-black bg-amber-50 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:bg-amber-950/40 md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
          role="status"
        >
          <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
            You need to be verified before you can post gigs.
          </p>
          <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
            {officers.length === 0
              ? "Add at least one responsible officer and submit verification."
              : "Complete verification on the Responsible officers page."}
          </p>
          <Link
            href="/dashboard/merchant/officers"
            className="mt-3 inline-block rounded-md border-2 border-black bg-white px-3 py-2 text-sm font-bold text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-amber-100 dark:bg-zinc-900 dark:hover:bg-amber-950/60"
          >
            Manage responsible officers →
          </Link>
        </div>
      )}
    </div>
  );
}
