"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/auth";
import { AuthError } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import {
  createNotification,
  notifyBookingConfirmed,
  notifyBookingDeclined,
  notifyParticipantCheckedIn,
} from "@/lib/notifications";
import { PRIVACY_MODE_ENFORCEMENT } from "@/lib/features";
import { resolveParticipantPhotoUrl } from "@/lib/photo-privacy";
import { hasAcceptedPaymentDisclosure } from "@/app/legal/actions";
import { LEGAL_ACKNOWLEDGMENT_REQUIRED_MESSAGE } from "@/lib/legal";

const CHECKIN_BUFFER_BEFORE_MINUTES = 60;  // 1 hour before start
const CHECKIN_BUFFER_AFTER_MINUTES = 15;  // 15 min after end

/** Whether current time is within gig window (with buffer) for check-in/check-out. */
function isWithinGigWindow(
  startTime: string | null,
  endTime: string | null
): boolean {
  if (!startTime || !endTime) return false;
  const now = Date.now();
  const start = new Date(startTime).getTime() - CHECKIN_BUFFER_BEFORE_MINUTES * 60 * 1000;
  const end = new Date(endTime).getTime() + CHECKIN_BUFFER_AFTER_MINUTES * 60 * 1000;
  return now >= start && now <= end;
}

export async function listMyBookings() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("bookings")
    .select(
      `
      id,
      gig_id,
      status,
      accepted_at,
      created_at,
      gigs (
        id,
        title,
        location_general,
        pay_rate,
        start_time,
        end_time,
        status
      )
    `
    )
    .eq("participant_user_id", user.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function acceptBooking(bookingId: string) {
  const accepted = await hasAcceptedPaymentDisclosure();
  if (!accepted)
    throw new AuthError(LEGAL_ACKNOWLEDGMENT_REQUIRED_MESSAGE);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new AuthError("Authentication required.");

  const { data: booking } = await supabase
    .from("bookings")
    .select("id, status, gig_id")
    .eq("id", bookingId)
    .eq("participant_user_id", user.id)
    .single();

  if (!booking) throw new AuthError("Booking not found.");
  if (booking.status !== "pending")
    throw new AuthError("Booking is already accepted or no longer pending.");

  const { error } = await supabase
    .from("bookings")
    .update({
      status: "confirmed",
      accepted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId);

  if (error) throw new AuthError("Could not accept booking.");

  await logAudit("booking", bookingId, "accepted", {});

  const { data: gig } = await supabase
    .from("gigs")
    .select("id, merchant_user_id")
    .eq("id", booking.gig_id)
    .single();
  const { data: profile } = await supabase
    .from("participant_profiles")
    .select("full_name")
    .eq("user_id", user.id)
    .maybeSingle();
  const participantName =
    profile?.full_name?.trim() || user.email?.split("@")[0] || "A participant";
  if (gig?.merchant_user_id) {
    await notifyBookingConfirmed(
      gig.merchant_user_id,
      participantName,
      gig.id
    );
  }

  revalidatePath("/dashboard/participant/bookings");
  revalidatePath("/dashboard/participant/bookings/calendar");
  revalidatePath(`/dashboard/participant/bookings/${bookingId}`);
}

export async function acceptBookingAction(formData: FormData) {
  const bookingId = formData.get("bookingId") as string;
  if (!bookingId) redirect("/dashboard/participant/bookings");

  try {
    await acceptBooking(bookingId);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not accept booking.";
    redirect(
      `/dashboard/participant/bookings/${bookingId}?error=${encodeURIComponent(msg)}`
    );
  }

  redirect(`/dashboard/participant/bookings/${bookingId}`);
}

export async function declineBooking(formData: FormData) {
  const bookingId = formData.get("bookingId") as string;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/dashboard/participant/bookings");

  const { data: booking } = await supabase
    .from("bookings")
    .select("id, participant_user_id, status, gig_id")
    .eq("id", bookingId)
    .single();

  if (!booking || booking.participant_user_id !== user.id) {
    redirect("/dashboard/participant/bookings");
  }

  if (booking.status !== "pending") {
    redirect(`/dashboard/participant/bookings/${bookingId}`);
  }

  await supabase
    .from("bookings")
    .update({
      status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId);

  await supabase
    .from("applications")
    .update({
      status: "pending",
      updated_at: new Date().toISOString(),
    })
    .eq("gig_id", booking.gig_id)
    .eq("participant_user_id", user.id);

  await logAudit("booking", bookingId, "declined", { gig_id: booking.gig_id });

  const { data: gig } = await supabase
    .from("gigs")
    .select("id, merchant_user_id, title")
    .eq("id", booking.gig_id)
    .single();
  const { data: profile } = await supabase
    .from("participant_profiles")
    .select("full_name")
    .eq("user_id", user.id)
    .maybeSingle();
  const participantName =
    profile?.full_name?.trim() || user.email?.split("@")[0] || "A participant";
  if (gig?.merchant_user_id) {
    await notifyBookingDeclined(
      gig.merchant_user_id,
      participantName,
      gig.id
    );
  }

  const gigTitle = gig?.title ?? "your gig";
  await createNotification({
    userId: booking.participant_user_id,
    type: "booking_cancelled",
    title: "Booking cancelled",
    body: `Your booking for "${gigTitle}" has been cancelled.`,
    link: `/dashboard/participant/bookings`,
  });

  revalidatePath("/dashboard/participant/bookings");
  revalidatePath(`/dashboard/participant/bookings/${bookingId}`);
  redirect("/dashboard/participant/bookings");
}

export async function getBookingForParticipant(bookingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: booking } = await supabase
    .from("bookings")
    .select(
      `
      id,
      status,
      accepted_at,
      role_in_gig,
      participant_user_id,
      gig_id,
      gigs (
        title,
        location_general,
        pay_rate,
        start_time,
        end_time,
        duties,
        merchant_user_id,
        gig_locations ( location_exact )
      )
    `
    )
    .eq("id", bookingId)
    .eq("participant_user_id", user.id)
    .single();

  return booking;
}

/** Minimal team preview for a gig: first name, photo, verified, role. Only returns data when current user has a confirmed booking for the gig. */
export type TeamPreviewMember = {
  user_id: string;
  first_name: string | null;
  photo_url: string | null;
  verified: boolean;
  role_in_gig: string;
};

export async function getGigTeamPreview(gigId: string): Promise<TeamPreviewMember[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { PRIVACY_MODE_ENFORCEMENT } = await import("@/lib/features");
  const rpcName = PRIVACY_MODE_ENFORCEMENT ? "get_gig_team_preview_privacy_aware" : "get_gig_team_preview";

  const { data, error } = await supabase.rpc(rpcName, {
    p_gig_id: gigId,
  });
  if (error) return [];

  const members = (data ?? []) as TeamPreviewMember[];
  if (!PRIVACY_MODE_ENFORCEMENT) return members;

  return members.map((m) => ({
    ...m,
    photo_url: resolveParticipantPhotoUrl(m.photo_url, null, { viewer: "team_peer" }),
  }));
}

export async function checkInAction(formData: FormData) {
  const bookingId = formData.get("bookingId") as string;
  const lat = formData.get("lat") ? parseFloat(formData.get("lat") as string) : null;
  const lon = formData.get("lon") ? parseFloat(formData.get("lon") as string) : null;
  if (!bookingId) return { error: "Missing booking" };
  try {
    await recordCheckin(bookingId, "in", lat, lon);
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Check-in failed" };
  }
}

export async function checkOutAction(formData: FormData) {
  const bookingId = formData.get("bookingId") as string;
  const lat = formData.get("lat") ? parseFloat(formData.get("lat") as string) : null;
  const lon = formData.get("lon") ? parseFloat(formData.get("lon") as string) : null;
  if (!bookingId) return { error: "Missing booking" };
  try {
    await recordCheckin(bookingId, "out", lat, lon);
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Check-out failed" };
  }
}

export async function recordCheckin(
  bookingId: string,
  type: "in" | "out",
  lat: number | null,
  lon: number | null
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new AuthError("Authentication required.");

  const { data: booking } = await supabase
    .from("bookings")
    .select("id, gig_id, status")
    .eq("id", bookingId)
    .eq("participant_user_id", user.id)
    .single();

  if (!booking) throw new AuthError("Booking not found.");
  if (booking.status !== "confirmed")
    throw new AuthError("Only confirmed bookings can check in or out.");

  const { data: gig } = await supabase
    .from("gigs")
    .select("start_time, end_time")
    .eq("id", booking.gig_id)
    .single();

  if (!gig || !isWithinGigWindow(gig.start_time, gig.end_time))
    throw new AuthError(
      "Check-in is allowed from 1 hour before start until 15 minutes after end."
    );

  const { data: checkin, error } = await supabase
    .from("checkins")
    .insert({
      booking_id: bookingId,
      type,
      lat: lat ?? null,
      lon: lon ?? null,
    })
    .select("id")
    .single();

  if (error) throw new AuthError("Could not record check-in.");
  if (checkin)
    await logAudit("checkin", checkin.id, "created", {
      booking_id: bookingId,
      type,
      has_location: lat != null && lon != null,
    });

  if (type === "in") {
    const { data: gig } = await supabase
      .from("gigs")
      .select("id, title, merchant_user_id")
      .eq("id", booking.gig_id)
      .single();
    const { data: profile } = await supabase
      .from("participant_profiles")
      .select("full_name")
      .eq("user_id", user.id)
      .maybeSingle();
    const participantName =
      profile?.full_name?.trim() || user.email?.split("@")[0] || "A participant";
    if (gig?.merchant_user_id) {
      await notifyParticipantCheckedIn(
        gig.merchant_user_id,
        participantName,
        gig.title,
        gig.id
      );
    }
  }

  revalidatePath(`/dashboard/participant/bookings/${bookingId}`);
  revalidatePath("/dashboard/participant/bookings");
  revalidatePath("/dashboard/participant/bookings/calendar");
}

export async function getCheckinsForBooking(bookingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: booking } = await supabase
    .from("bookings")
    .select("id")
    .eq("id", bookingId)
    .eq("participant_user_id", user.id)
    .single();

  if (!booking) return [];

  const { data } = await supabase
    .from("checkins")
    .select("*")
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: true });

  return data ?? [];
}

/** Get checkins for multiple bookings (for list view). Returns map of booking_id -> checkins[]. */
export async function getCheckinsForBookings(bookingIds: string[]) {
  if (bookingIds.length === 0) return {} as Record<string, { id: string; type: string; created_at: string }[]>;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return {} as Record<string, { id: string; type: string; created_at: string }[]>;

  const { data: myBookings } = await supabase
    .from("bookings")
    .select("id")
    .in("id", bookingIds)
    .eq("participant_user_id", user.id);
  const allowed = new Set((myBookings ?? []).map((b) => b.id));

  const { data } = await supabase
    .from("checkins")
    .select("booking_id, id, type, created_at")
    .in("booking_id", bookingIds)
    .order("created_at", { ascending: true });

  const map: Record<string, { id: string; type: string; created_at: string }[]> = {};
  for (const id of bookingIds) {
    if (allowed.has(id)) map[id] = [];
  }
  for (const c of data ?? []) {
    if (map[c.booking_id]) map[c.booking_id].push({ id: c.id, type: c.type, created_at: c.created_at });
  }
  return map;
}
