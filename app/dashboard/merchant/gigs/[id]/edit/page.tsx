import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { getGigForMerchant } from "@/app/dashboard/merchant/gigs/actions";
import { createClient } from "@/lib/auth";
import { EditGigForm } from "./EditGigForm";

export default async function EditGigPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(ROLES.MERCHANT);
  const { id } = await params;
  const gig = await getGigForMerchant(id);
  if (!gig) notFound();

  const supabase = await createClient();
  const { data: booking } = await supabase
    .from("bookings")
    .select("id")
    .eq("gig_id", id)
    .in("status", ["confirmed", "completed", "no_show"])
    .maybeSingle();
  if (booking) {
    return (
      <div className="space-y-4">
        <p className="text-zinc-600 dark:text-zinc-400">
          This gig cannot be edited because a booking has been accepted.
        </p>
        <Link
          href={`/dashboard/merchant/gigs/${id}`}
          className="text-sm font-medium text-zinc-900 underline dark:text-zinc-100"
        >
          Back to gig
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="page-title tracking-tight">
          Edit gig
        </h1>
        <Link
          href={`/dashboard/merchant/gigs/${id}`}
          className="mt-2 inline-block text-sm font-medium text-zinc-600 dark:text-zinc-400"
        >
          ← Back to gig
        </Link>
      </div>

      <EditGigForm gig={gig} />
    </div>
  );
}
