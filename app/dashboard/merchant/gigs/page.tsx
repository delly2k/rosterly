import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { isMerchantVerified } from "@/app/dashboard/merchant/actions";
import { listMyGigs } from "@/app/dashboard/merchant/gigs/actions";
import { getUsageSummary } from "@/lib/billing/gating";
import { getCurrentUser } from "@/lib/auth";
import { GigsPageClient } from "./GigsPageClient";

export default async function MerchantGigsPage() {
  await requireRole(ROLES.MERCHANT);
  const current = await getCurrentUser();
  if (!current?.user) return null;

  const [canPost, gigs, usageSummary] = await Promise.all([
    isMerchantVerified(),
    listMyGigs(),
    getUsageSummary(current.user.id),
  ]);

  return (
    <GigsPageClient
      canPost={canPost}
      usageSummary={usageSummary}
      gigs={gigs.map((g) => ({
        id: g.id,
        title: g.title,
        status: g.status,
        location_general: g.location_general ?? null,
        pay_rate: g.pay_rate ?? null,
        spots: g.spots ?? 1,
        spots_filled: g.spots_filled ?? 0,
      }))}
    />
  );
}
