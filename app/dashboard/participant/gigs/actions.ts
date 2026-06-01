"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/auth";
import { AuthError } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { notifyNewApplication } from "@/lib/notifications";

const BOOKING_STATUSES_TAKING_SPOT = ["pending", "confirmed", "completed", "no_show"];

export async function listOpenGigs() {
  const supabase = await createClient();
  const { data: gigs } = await supabase
    .from("gigs")
    .select(
      "id, title, duties, pay_rate, location_general, start_time, end_time, status, spots, created_at, merchant_user_id"
    )
    .eq("status", "open")
    .order("created_at", { ascending: false });

  if (!gigs?.length) return [];

  const gigIds = gigs.map((g) => g.id);
  const merchantIds = [...new Set(gigs.map((g) => g.merchant_user_id))];

  const [{ data: bookings }, { data: merchantProfiles }] = await Promise.all([
    supabase
      .from("bookings")
      .select("gig_id")
      .in("gig_id", gigIds)
      .in("status", BOOKING_STATUSES_TAKING_SPOT),
    supabase
      .from("merchant_profiles")
      .select("user_id, average_rating, total_ratings")
      .in("user_id", merchantIds),
  ]);

  const countByGig: Record<string, number> = {};
  for (const id of gigIds) countByGig[id] = 0;
  for (const b of bookings ?? []) {
    countByGig[b.gig_id] = (countByGig[b.gig_id] ?? 0) + 1;
  }

  const merchantRatingById = new Map(
    (merchantProfiles ?? []).map((m) => [
      m.user_id,
      {
        average_rating: m.average_rating != null ? Number(m.average_rating) : null,
        total_ratings: m.total_ratings ?? 0,
      },
    ])
  );

  return gigs.map((g) => {
    const merchantRating = merchantRatingById.get(g.merchant_user_id);
    return {
      ...g,
      spots: g.spots ?? 1,
      spots_filled: countByGig[g.id] ?? 0,
      merchant_average_rating: merchantRating?.average_rating ?? null,
      merchant_total_ratings: merchantRating?.total_ratings ?? 0,
    };
  });
}

/** Get gig for participant. Returns any non-draft gig (open, filled, cancelled) so detail page works for applied/booked gigs. Includes location_exact only if participant has a confirmed/completed booking. */
export async function getGigForParticipant(gigId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: gig } = await supabase
    .from("gigs")
    .select("*")
    .eq("id", gigId)
    .neq("status", "draft")
    .single();

  if (!gig) return null;

  const { data: booking } = await supabase
    .from("bookings")
    .select("id")
    .eq("gig_id", gigId)
    .eq("participant_user_id", user.id)
    .in("status", ["confirmed", "completed"])
    .maybeSingle();

  let location_exact: string | null = null;
  if (booking) {
    const { data: loc } = await supabase
      .from("gig_locations")
      .select("location_exact")
      .eq("gig_id", gigId)
      .single();
    location_exact = loc?.location_exact ?? null;
  }

  const { count: spotsFilled } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("gig_id", gigId)
    .in("status", BOOKING_STATUSES_TAKING_SPOT);

  return {
    ...gig,
    location_exact,
    spots: gig.spots ?? 1,
    spots_filled: spotsFilled ?? 0,
  };
}

export async function applyToGig(gigId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new AuthError("Authentication required.");

  const { data: gig } = await supabase
    .from("gigs")
    .select("id, spots, title, merchant_user_id")
    .eq("id", gigId)
    .eq("status", "open")
    .single();

  if (!gig) throw new AuthError("Gig not found or not open for applications.");

  const spots = Math.max(1, gig.spots ?? 1);
  const { count } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("gig_id", gigId)
    .in("status", BOOKING_STATUSES_TAKING_SPOT);
  if ((count ?? 0) >= spots)
    throw new AuthError("This gig has no more spots available.");

  const { data: existing } = await supabase
    .from("applications")
    .select("id, status")
    .eq("gig_id", gigId)
    .eq("participant_user_id", user.id)
    .maybeSingle();

  if (existing) {
    if (existing.status === "pending")
      throw new AuthError("You have already applied to this gig.");
    if (existing.status === "accepted")
      throw new AuthError("Your application was already accepted.");
    throw new AuthError("You cannot apply again to this gig.");
  }

  const { data: app, error } = await supabase
    .from("applications")
    .insert({
      gig_id: gigId,
      participant_user_id: user.id,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) throw new AuthError("Could not submit application.");
  if (app) await logAudit("application", app.id, "created", { gig_id: gigId });

  const { data: profile } = await supabase
    .from("participant_profiles")
    .select("full_name")
    .eq("user_id", user.id)
    .maybeSingle();
  const participantName =
    profile?.full_name?.trim() || user.email?.split("@")[0] || "A participant";
  await notifyNewApplication(
    gig.merchant_user_id,
    participantName,
    gig.title,
    gigId
  );

  revalidatePath(`/dashboard/participant/gigs/${gigId}`);
  revalidatePath("/dashboard/participant/applications");
}

export async function getMyApplicationForGig(gigId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("applications")
    .select("*")
    .eq("gig_id", gigId)
    .eq("participant_user_id", user.id)
    .maybeSingle();

  return data;
}

export async function listMyApplications() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("applications")
    .select(`
      id,
      gig_id,
      status,
      created_at,
      gigs (
        id,
        title,
        pay_rate,
        location_general,
        start_time,
        status
      )
    `)
    .eq("participant_user_id", user.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}
