"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/auth";

export type RatingRow = {
  id: string;
  booking_id: string;
  gig_id: string;
  rater_id: string;
  ratee_id: string;
  role_of_rater: "merchant" | "participant";
  score: number;
  comment: string | null;
  created_at: string;
};

export async function hasUserRatedBooking(
  bookingId: string,
  raterId: string
): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ratings")
    .select("id")
    .eq("booking_id", bookingId)
    .eq("rater_id", raterId)
    .maybeSingle();
  return !!data;
}

export async function getRatingsReceivedByUser(
  userId: string,
  limit = 10
): Promise<RatingRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ratings")
    .select("*")
    .eq("ratee_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as RatingRow[];
}

export async function getMerchantRatingStatusForGig(gigId: string): Promise<
  {
    bookingId: string;
    participantUserId: string;
    participantName: string;
    status: string;
    merchantHasRated: boolean;
  }[]
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: gig } = await supabase
    .from("gigs")
    .select("id, title, merchant_user_id")
    .eq("id", gigId)
    .eq("merchant_user_id", user.id)
    .single();
  if (!gig) return [];

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, participant_user_id, status")
    .eq("gig_id", gigId)
    .eq("status", "completed");

  if (!bookings?.length) return [];

  const participantIds = bookings.map((b) => b.participant_user_id);
  const { data: profiles } = await supabase
    .from("participant_profiles")
    .select("user_id, full_name")
    .in("user_id", participantIds);

  const nameById = new Map(
    (profiles ?? []).map((p) => [p.user_id, p.full_name?.trim() || null])
  );

  const bookingIds = bookings.map((b) => b.id);
  const { data: ratings } = await supabase
    .from("ratings")
    .select("booking_id")
    .eq("rater_id", user.id)
    .in("booking_id", bookingIds);

  const ratedBookingIds = new Set((ratings ?? []).map((r) => r.booking_id));

  return bookings.map((b) => ({
    bookingId: b.id,
    participantUserId: b.participant_user_id,
    participantName:
      nameById.get(b.participant_user_id) ??
      `Participant ${b.participant_user_id.slice(0, 8)}…`,
    status: b.status,
    merchantHasRated: ratedBookingIds.has(b.id),
  }));
}

export async function submitRating(input: {
  bookingId: string;
  score: number;
  comment?: string | null;
}): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Authentication required." };

  const score = Math.round(input.score);
  if (!Number.isFinite(score) || score < 1 || score > 5) {
    return { error: "Score must be between 1 and 5." };
  }

  const comment = input.comment?.trim().slice(0, 200) || null;

  const { data: booking } = await supabase
    .from("bookings")
    .select("id, gig_id, participant_user_id, status, gigs(merchant_user_id, title)")
    .eq("id", input.bookingId)
    .single();

  if (!booking) return { error: "Booking not found." };
  if (booking.status !== "completed") {
    return { error: "You can only rate completed bookings." };
  }

  const gig = Array.isArray(booking.gigs) ? booking.gigs[0] : booking.gigs;
  const merchantUserId = (gig as { merchant_user_id?: string } | null)?.merchant_user_id;
  if (!merchantUserId) return { error: "Gig not found." };

  let roleOfRater: "merchant" | "participant";
  let rateeId: string;

  if (user.id === booking.participant_user_id) {
    roleOfRater = "participant";
    rateeId = merchantUserId;
  } else if (user.id === merchantUserId) {
    roleOfRater = "merchant";
    rateeId = booking.participant_user_id;
  } else {
    return { error: "You are not part of this booking." };
  }

  const { data: existing } = await supabase
    .from("ratings")
    .select("id")
    .eq("booking_id", input.bookingId)
    .eq("rater_id", user.id)
    .maybeSingle();

  if (existing) return { error: "You have already rated this booking." };

  const { error } = await supabase.from("ratings").insert({
    booking_id: input.bookingId,
    gig_id: booking.gig_id,
    rater_id: user.id,
    ratee_id: rateeId,
    role_of_rater: roleOfRater,
    score,
    comment,
  });

  if (error) {
    if (error.code === "23505") return { error: "You have already rated this booking." };
    return { error: "Could not submit rating." };
  }

  const { notifyRatingReceived } = await import("@/lib/notifications");
  const rateeRole: "participant" | "merchant" =
    roleOfRater === "participant" ? "merchant" : "participant";
  let raterName = "Someone";
  if (roleOfRater === "participant") {
    const { data: p } = await supabase
      .from("participant_profiles")
      .select("full_name")
      .eq("user_id", user.id)
      .maybeSingle();
    raterName = p?.full_name?.trim() || raterName;
  } else {
    const { data: m } = await supabase
      .from("merchant_profiles")
      .select("business_name")
      .eq("user_id", user.id)
      .maybeSingle();
    raterName = m?.business_name?.trim() || raterName;
  }
  await notifyRatingReceived(rateeId, rateeRole, raterName);

  revalidatePath("/dashboard/participant/bookings");
  revalidatePath(`/dashboard/participant/bookings/${input.bookingId}`);
  revalidatePath("/dashboard/participant");
  revalidatePath("/dashboard/participant/profile");
  revalidatePath("/dashboard/merchant/gigs");
  revalidatePath(`/dashboard/merchant/gigs/${booking.gig_id}`);
  revalidatePath("/dashboard/admin/users");

  return { success: true };
}
