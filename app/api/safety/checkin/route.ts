import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const bookingId = body.bookingId as string | undefined;
  const lat = body.lat as number | undefined;
  const lon = body.lon as number | undefined;

  if (!bookingId) {
    return NextResponse.json({ error: "bookingId required" }, { status: 400 });
  }

  const { data: booking } = await supabase
    .from("bookings")
    .select("id, participant_user_id, status")
    .eq("id", bookingId)
    .single();

  if (!booking || booking.participant_user_id !== user.id) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (booking.status !== "confirmed") {
    return NextResponse.json({ error: "Booking not active" }, { status: 400 });
  }

  const { error } = await supabase.from("safety_checkins").insert({
    user_id: user.id,
    booking_id: bookingId,
    lat: lat ?? null,
    lon: lon ?? null,
    checked_in_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: "Could not record check-in" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
