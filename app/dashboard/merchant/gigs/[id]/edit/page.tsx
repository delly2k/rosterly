import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { getGigForMerchant } from "@/app/dashboard/merchant/gigs/actions";
import { createClient } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { EditGigForm } from "./EditGigForm";
import { Pencil } from "lucide-react";

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
      <div className="page-bg space-y-4" style={{ padding: "32px 40px" }}>
        <p className="text-[var(--color-ink-muted)]">
          This gig cannot be edited because a booking has been accepted.
        </p>
        <Link
          href={`/dashboard/merchant/gigs/${id}`}
          className="text-sm font-medium text-[var(--color-ink)] underline"
        >
          Back to gig
        </Link>
      </div>
    );
  }

  return (
    <div className="page-bg space-y-8" style={{ padding: "32px 40px" }}>
      <PageHeader
        icon={Pencil}
        title="Edit gig"
        description="Update gig details, location, and schedule"
      />

      <EditGigForm gig={gig} />
    </div>
  );
}
