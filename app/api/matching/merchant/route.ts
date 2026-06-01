import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/auth";
import { scoreParticipantForGig } from "@/lib/matching";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const gigId = req.nextUrl.searchParams.get("gigId");
    if (!gigId) {
      return NextResponse.json({ error: "gigId required" }, { status: 400 });
    }

    const { data: gig } = await supabase
      .from("gigs")
      .select(
        "id, title, duties, location_general, location_parish, start_time, merchant_user_id"
      )
      .eq("id", gigId)
      .eq("merchant_user_id", user.id)
      .single();

    if (!gig) {
      return NextResponse.json({ error: "Gig not found" }, { status: 404 });
    }

    const { data: participants } = await supabase
      .from("participant_profiles")
      .select(
        "user_id, full_name, skills, location_general, availability, reputation_score, average_rating, total_ratings, verified"
      )
      .eq("verified", true);

    if (!participants?.length) {
      return NextResponse.json({ scores: [] });
    }

    const participantIds = participants.map((p) => p.user_id);
    const { data: completedBookings } = await supabase
      .from("bookings")
      .select("participant_user_id, gigs(title)")
      .in("participant_user_id", participantIds)
      .eq("status", "completed");

    const bookingsByParticipant: Record<string, typeof completedBookings> = {};
    completedBookings?.forEach((b) => {
      if (!bookingsByParticipant[b.participant_user_id]) {
        bookingsByParticipant[b.participant_user_id] = [];
      }
      bookingsByParticipant[b.participant_user_id]!.push(b);
    });

    const { data: existingInvitations } = await supabase
      .from("gig_invitations")
      .select("participant_user_id, status")
      .eq("gig_id", gigId);

    const invitedIds = new Set(
      existingInvitations?.map((i) => i.participant_user_id) ?? []
    );

    const scores = participants
      .map((p) => ({
        ...scoreParticipantForGig(
          p,
          gig,
          bookingsByParticipant[p.user_id] ?? []
        ),
        averageRating: p.average_rating,
        totalRatings: p.total_ratings,
        alreadyInvited: invitedIds.has(p.user_id),
      }))
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    return NextResponse.json({ scores });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Matching failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
