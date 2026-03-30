import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { getMerchantDashboardData } from "@/app/dashboard/merchant/actions";
import { VerificationBadge } from "@/app/dashboard/participant/VerificationBadge";
import { MerchantDashboardClient } from "./MerchantDashboardClient";

export default async function MerchantDashboardPage() {
  await requireRole(ROLES.MERCHANT);
  const data = await getMerchantDashboardData();
  if (!data) return null;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="page-title tracking-tight">Merchant dashboard</h1>
          {data.verificationStatus === "verified" && (
            <VerificationBadge status="verified" />
          )}
        </div>
        {data.verificationStatus !== "verified" && (
          <Link
            href="/dashboard/merchant/verification"
            className="inline-block text-sm font-medium text-amber-700 underline underline-offset-2 hover:no-underline dark:text-amber-300"
          >
            {data.verificationStatus === "pending"
              ? "View verification status"
              : "Complete verification"}
          </Link>
        )}
      </header>

      {!data.canPostGigs && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
          You must be verified to post gigs. Complete your business profile and
          officer verification to get started.
        </div>
      )}

      <MerchantDashboardClient data={data} />
    </div>
  );
}
