import { notFound } from "next/navigation";
import { requireRole, createClient } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import {
  getBookingForParticipant,
  getCheckinsForBooking,
  getGigTeamPreview,
} from "@/app/dashboard/participant/bookings/actions";
import { hasUserRatedBooking } from "@/app/dashboard/actions/ratings";
import { ParticipantBookingDetailPageView } from "./ParticipantBookingDetailPageView";

export default async function ParticipantBookingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireRole(ROLES.PARTICIPANT);
  const { id } = await params;
  const { error: acceptError } = await searchParams;
  const booking = await getBookingForParticipant(id);
  if (!booking) notFound();

  const rawGig = booking.gigs;
  const gig = Array.isArray(rawGig) ? rawGig[0] : rawGig;
  if (!gig) notFound();

  const checkins = await getCheckinsForBooking(id);

  const gigUpcomingOrActive =
    !gig.end_time || new Date(gig.end_time) > new Date();
  const teamPreview =
    booking.status === "confirmed" &&
    gigUpcomingOrActive
      ? await getGigTeamPreview(booking.gig_id)
      : [];

  let showRatingModal = false;
  let rateeName = "Merchant";
  if (booking.status === "completed" && gig.merchant_user_id) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const alreadyRated = await hasUserRatedBooking(id, user.id);
      showRatingModal = !alreadyRated;
      const { data: merchantProfile } = await supabase
        .from("merchant_profiles")
        .select("business_name")
        .eq("user_id", gig.merchant_user_id)
        .maybeSingle();
      rateeName = merchantProfile?.business_name?.trim() || "Merchant";
    }
  }

  return (
    <ParticipantBookingDetailPageView
      bookingId={id}
      gigId={booking.gig_id}
      status={booking.status}
      roleInGig={booking.role_in_gig}
      gig={gig}
      checkins={checkins}
      acceptError={acceptError ? decodeURIComponent(acceptError) : null}
      teamPreview={teamPreview}
      participantUserId={booking.participant_user_id}
      showRatingModal={showRatingModal}
      rateeName={rateeName}
    />
  );
}
