import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import {
  getGigForMerchant,
  getApplicationsForGig,
  getAttendanceForGig,
} from "@/app/dashboard/merchant/gigs/actions";
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

  const [applications, attendance] = await Promise.all([
    getApplicationsForGig(id),
    getAttendanceForGig(id),
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
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Back to gigs
        </Link>
      </div>

      <GigDetailMerchant
        gig={gig}
        applications={applications}
        attendance={attendance}
        locked={locked}
      />
    </div>
  );
}
