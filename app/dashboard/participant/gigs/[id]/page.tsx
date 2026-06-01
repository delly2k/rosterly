import { notFound } from "next/navigation";
import { getCurrentUser, requireRole, createClient } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { getGigTeamPreview } from "@/app/dashboard/participant/bookings/actions";
import {
  getGigForParticipant,
  getMyApplicationForGig,
} from "@/app/dashboard/participant/gigs/actions";
import { ParticipantGigDetailPageView } from "./ParticipantGigDetailPageView";

export default async function ParticipantGigDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(ROLES.PARTICIPANT);
  const { id } = await params;
  const gig = await getGigForParticipant(id);
  if (!gig) notFound();

  const [myApplication, currentUser] = await Promise.all([
    getMyApplicationForGig(id),
    getCurrentUser(),
  ]);

  let booking: { id: string; status: string } | null = null;
  if (currentUser?.user?.id) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("bookings")
      .select("id, status")
      .eq("gig_id", id)
      .eq("participant_user_id", currentUser.user.id)
      .maybeSingle();
    booking = data;
  }

  const gigUpcomingOrActive =
    !gig.end_time || new Date(gig.end_time) > new Date();
  const teamPreview =
    gigUpcomingOrActive ? await getGigTeamPreview(id) : [];

  const filledSpots = "spots_filled" in gig ? (gig.spots_filled ?? 0) : 0;

  return (
    <ParticipantGigDetailPageView
      gig={gig}
      application={myApplication}
      booking={booking}
      filledSpots={filledSpots}
      teamPreview={teamPreview}
      currentUserId={currentUser?.user?.id}
    />
  );
}
