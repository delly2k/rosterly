import { NextResponse } from "next/server";
import { createClient } from "@/lib/auth";
import { scoreGigForParticipant } from "@/lib/matching";
import { createNotification } from "@/lib/notifications";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: participant } = await supabase
      .from("participant_profiles")
      .select("skills, location_general, availability, reputation_score")
      .eq("user_id", user.id)
      .single();

    if (!participant) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { data: gigs } = await supabase
      .from("gigs")
      .select(
        "id, title, duties, location_general, location_parish, start_time, end_time, pay_rate, spots"
      )
      .eq("status", "open");

    if (!gigs?.length) {
      return NextResponse.json({ scores: [] });
    }

    const scores = gigs
      .map((gig) => scoreGigForParticipant(gig, { ...participant, user_id: user.id }))
      .sort((a, b) => b.score - a.score);

    const topMatches = scores.filter((s) => s.score >= 70).slice(0, 3);
    if (topMatches.length > 0) {
      await createNotification({
        userId: user.id,
        type: "new_gig_match",
        title: `${topMatches.length} gig${topMatches.length > 1 ? "s" : ""} matched your profile`,
        body: `AI found ${topMatches.length} gig${topMatches.length > 1 ? "s" : ""} that match your skills and location.`,
        link: `/dashboard/participant/gigs`,
      });
    }

    return NextResponse.json({ scores });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Matching failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
