import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import {
  getGigForMerchant,
  getApplicationsForGig,
  getAttendanceForGig,
} from "@/app/dashboard/merchant/gigs/actions";
import { getMerchantRatingStatusForGig } from "@/app/dashboard/actions/ratings";
import { createClient } from "@/lib/auth";
import { GigDetailMerchant } from "./GigDetailMerchant";

export default async function MerchantGigDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(ROLES.MERCHANT);
  const { id } = await params;
  const gig = await getGigForMerchant(id);
  if (!gig) notFound();

  const [applications, attendance, completedRatingStatus] = await Promise.all([
    getApplicationsForGig(id),
    getAttendanceForGig(id),
    getMerchantRatingStatusForGig(id),
  ]);

  const supabase = await createClient();
  const { data: booking } = await supabase
    .from("bookings")
    .select("id")
    .eq("gig_id", id)
    .in("status", ["confirmed", "completed", "no_show"])
    .maybeSingle();
  const locked = !!booking;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/merchant/gigs"
          className="text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
        >
          ← Back to gigs
        </Link>
      </div>

      <GigDetailMerchant
        gig={gig}
        applications={applications}
        attendance={attendance}
        locked={locked}
        completedRatingStatus={completedRatingStatus}
      />
    </div>
  );
}
