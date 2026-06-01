"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/auth";
import { AuthError } from "@/lib/auth";
import { resolveParticipantPhotoUrl } from "@/lib/photo-privacy";
import { logAudit } from "@/lib/audit";
import {
  notifyApplicationRejected,
  notifyBookingOffer,
} from "@/lib/notifications";
import { LOCKED_BOOKING_STATUSES } from "@/types/gig";
import type { GigStatus } from "@/types/gig";
import { isMerchantVerified } from "@/app/dashboard/merchant/actions";
import { hasAcceptedPaymentDisclosure } from "@/app/legal/actions";
import { LEGAL_ACKNOWLEDGMENT_REQUIRED_MESSAGE } from "@/lib/legal";
import { getUsageSummary, PLAN_LIMIT_REACHED } from "@/lib/billing/gating";

export type CreateGigInput = {
  title: string;
  duties: string[];
  pay_rate: number | null;
  payment_method_dummy: string | null;
  location_street?: string | null;
  location_city?: string | null;
  location_parish?: string | null;
  location_general: string | null;
  location_exact: string | null;
  start_time: string | null;
  end_time: string | null;
  status: GigStatus;
  spots: number;
};

function resolveGigLocation(input: {
  location_street?: string | null;
  location_city?: string | null;
  location_parish?: string | null;
  location_general?: string | null;
  location_exact?: string | null;
}) {
  const street = input.location_street?.trim() || null;
  const city = input.location_city?.trim() || null;
  const parish = input.location_parish?.trim() || null;

  if (street || city || parish) {
    return {
      location_street: street,
      location_city: city,
      location_parish: parish,
      location_general: [city, parish].filter(Boolean).join(", ") || null,
      location_exact:
        [street, city, parish, "Jamaica"].filter(Boolean).join(", ") || null,
    };
  }

  return {
    location_street: null,
    location_city: null,
    location_parish: null,
    location_general: input.location_general?.trim() || null,
    location_exact: input.location_exact?.trim() || null,
  };
}

export async function createGig(input: CreateGigInput) {
  const accepted = await hasAcceptedPaymentDisclosure();
  if (!accepted)
    throw new AuthError(LEGAL_ACKNOWLEDGMENT_REQUIRED_MESSAGE);

  const verified = await isMerchantVerified();
  if (!verified) throw new AuthError("You must be verified to create gigs.");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new AuthError("Authentication required.");

  const usage = await getUsageSummary(user.id);
  if (usage && !usage.canCreateGig) {
    const { notifyPlanLimitReached } = await import("@/lib/notifications");
    await notifyPlanLimitReached(user.id);
    throw new AuthError(PLAN_LIMIT_REACHED);
  }

  const spots = Math.max(1, Number(input.spots) || 1);
  const location = resolveGigLocation(input);
  const { data: gig, error: gigError } = await supabase
    .from("gigs")
    .insert({
      merchant_user_id: user.id,
      title: input.title.trim(),
      duties: input.duties ?? [],
      pay_rate: input.pay_rate,
      payment_method_dummy: input.payment_method_dummy,
      location_street: location.location_street,
      location_city: location.location_city,
      location_parish: location.location_parish,
      location_general: location.location_general,
      start_time: input.start_time || null,
      end_time: input.end_time || null,
      status: input.status ?? "draft",
      spots,
    })
    .select("id")
    .single();

  if (gigError || !gig) throw new AuthError("Could not create gig.");

  if (location.location_exact) {
    await supabase.from("gig_locations").insert({
      gig_id: gig.id,
      location_exact: location.location_exact,
      street_address: location.location_street,
      city: location.location_city,
      parish: location.location_parish,
    });
  }

  await logAudit("gig", gig.id, "created", {
    title: input.title,
    status: input.status,
  });

  revalidatePath("/dashboard/merchant/gigs");
  revalidatePath("/dashboard/merchant");
  return gig.id;
}

/** True if gig has any booking in a status that locks critical fields. */
async function gigHasLockingBooking(
  supabase: Awaited<ReturnType<typeof createClient>>,
  gigId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("bookings")
    .select("id")
    .eq("gig_id", gigId)
    .in("status", LOCKED_BOOKING_STATUSES)
    .limit(1)
    .maybeSingle();
  return !!data;
}

export type UpdateGigInput = {
  title?: string;
  duties?: string[];
  pay_rate?: number | null;
  payment_method_dummy?: string | null;
  location_street?: string | null;
  location_city?: string | null;
  location_parish?: string | null;
  location_general?: string | null;
  location_exact?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  status?: GigStatus;
  spots?: number;
};

export async function updateGig(gigId: string, input: UpdateGigInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new AuthError("Authentication required.");

  const locked = await gigHasLockingBooking(supabase, gigId);
  if (locked) {
    const allowedKeys = new Set([
      "start_time",
      "end_time",
      "status",
      "updated_at",
    ]);
    const disallowed = Object.keys(input).filter((k) => !allowedKeys.has(k));
    if (disallowed.length > 0) {
      throw new AuthError(
        "Cannot edit job details after a booking has been accepted."
      );
    }
  }

  if (input.spots !== undefined && !locked) {
    const spots = Math.max(1, Number(input.spots) || 1);
    const { count } = await supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("gig_id", gigId)
      .in("status", ["pending", "confirmed", "completed", "no_show"]);
    if (count != null && spots < count) {
      throw new AuthError(
        `Cannot set spots to ${spots}; there are already ${count} accepted bookings.`
      );
    }
  }

  const gigRow: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.title !== undefined && !locked) gigRow.title = input.title.trim();
  if (input.duties !== undefined && !locked) gigRow.duties = input.duties;
  if (input.pay_rate !== undefined && !locked)
    gigRow.pay_rate = input.pay_rate;
  if (input.payment_method_dummy !== undefined && !locked)
    gigRow.payment_method_dummy = input.payment_method_dummy;
  if (
    (input.location_general !== undefined ||
      input.location_street !== undefined ||
      input.location_city !== undefined ||
      input.location_parish !== undefined ||
      input.location_exact !== undefined) &&
    !locked
  ) {
    const location = resolveGigLocation(input);
    gigRow.location_street = location.location_street;
    gigRow.location_city = location.location_city;
    gigRow.location_parish = location.location_parish;
    gigRow.location_general = location.location_general;
  }
  if (input.start_time !== undefined) gigRow.start_time = input.start_time;
  if (input.end_time !== undefined) gigRow.end_time = input.end_time;
  if (input.status !== undefined) gigRow.status = input.status;
  if (input.spots !== undefined && !locked)
    gigRow.spots = Math.max(1, Number(input.spots) || 1);

  const { error: gigError } = await supabase
    .from("gigs")
    .update(gigRow)
    .eq("id", gigId)
    .eq("merchant_user_id", user.id);

  if (gigError) throw new AuthError("Could not update gig.");

  if (
    (input.location_exact !== undefined ||
      input.location_street !== undefined ||
      input.location_city !== undefined ||
      input.location_parish !== undefined ||
      input.location_general !== undefined) &&
    !locked
  ) {
    const location = resolveGigLocation(input);
    await supabase.from("gig_locations").upsert(
      {
        gig_id: gigId,
        location_exact: location.location_exact,
        street_address: location.location_street,
        city: location.location_city,
        parish: location.location_parish,
      },
      { onConflict: "gig_id" }
    );
  }

  await logAudit("gig", gigId, "updated", { locked, keys: Object.keys(input) });

  revalidatePath("/dashboard/merchant/gigs");
  revalidatePath(`/dashboard/merchant/gigs/${gigId}`);
}

const BOOKING_STATUSES_TAKING_SPOT = ["pending", "confirmed", "completed", "no_show"];

export async function listMyGigs() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: gigs } = await supabase
    .from("gigs")
    .select("*")
    .eq("merchant_user_id", user.id)
    .order("created_at", { ascending: false });

  if (!gigs?.length) return [];

  const gigIds = gigs.map((g) => g.id);
  const { data: bookings } = await supabase
    .from("bookings")
    .select("gig_id")
    .in("gig_id", gigIds)
    .in("status", BOOKING_STATUSES_TAKING_SPOT);

  const countByGig: Record<string, number> = {};
  for (const id of gigIds) countByGig[id] = 0;
  for (const b of bookings ?? []) {
    countByGig[b.gig_id] = (countByGig[b.gig_id] ?? 0) + 1;
  }

  return gigs.map((g) => ({
    ...g,
    spots: g.spots ?? 1,
    spots_filled: countByGig[g.id] ?? 0,
  }));
}

export async function getGigForMerchant(gigId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: gig } = await supabase
    .from("gigs")
    .select("*")
    .eq("id", gigId)
    .eq("merchant_user_id", user.id)
    .single();

  if (!gig) return null;

  const [locationRes, countRes] = await Promise.all([
    supabase
      .from("gig_locations")
      .select("location_exact, street_address, city, parish")
      .eq("gig_id", gigId)
      .single(),
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("gig_id", gigId)
      .in("status", BOOKING_STATUSES_TAKING_SPOT),
  ]);

  const location_exact = locationRes.data?.location_exact ?? null;
  const spots_filled = countRes.count ?? 0;

  return {
    ...gig,
    location_exact,
    location_street:
      gig.location_street ?? locationRes.data?.street_address ?? null,
    location_city: gig.location_city ?? locationRes.data?.city ?? null,
    location_parish: gig.location_parish ?? locationRes.data?.parish ?? null,
    spots: gig.spots ?? 1,
    spots_filled,
  };
}

/** Participant profile fields visible to merchants for an application. */
export type ApplicantProfileSnapshot = {
  full_name: string | null;
  photo_url: string | null;
  bio: string | null;
  skills: unknown;
  availability: unknown;
  rate: number | null;
  verified: boolean;
  reputation_score: number;
  average_rating: number | null;
  total_ratings: number;
};

export type ApplicantCertificate = {
  levelTitle: string;
  levelSubtitle: string;
  badge_color: string;
};

export type ApplicationWithApplicant = {
  id: string;
  gig_id: string;
  participant_user_id: string;
  status: string;
  created_at: string;
  participant_profiles: ApplicantProfileSnapshot | null;
  academy_certificates: ApplicantCertificate[];
};

function mapApplicantProfile(
  profile: {
    full_name: string | null;
    photo_url: string | null;
    photo_visibility?: string | null;
    bio: string | null;
    skills: unknown;
    availability: unknown;
    rate: number | null;
    verified: boolean;
    reputation_score: number | null;
    average_rating: number | null;
    total_ratings: number | null;
  },
  hasConfirmedBooking: boolean
): ApplicantProfileSnapshot {
  return {
    full_name: profile.full_name ?? null,
    photo_url: resolveParticipantPhotoUrl(profile.photo_url, profile.photo_visibility, {
      viewer: "merchant",
      hasApplication: true,
      hasConfirmedBooking,
    }),
    bio: profile.bio ?? null,
    skills: profile.skills ?? [],
    availability: profile.availability ?? {},
    rate: profile.rate != null ? Number(profile.rate) : null,
    verified: profile.verified ?? false,
    reputation_score: profile.reputation_score ?? 0,
    average_rating:
      profile.average_rating != null ? Number(profile.average_rating) : null,
    total_ratings: profile.total_ratings ?? 0,
  };
}

export async function getApplicationsForGig(gigId: string): Promise<ApplicationWithApplicant[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: gig } = await supabase
    .from("gigs")
    .select("id")
    .eq("id", gigId)
    .eq("merchant_user_id", user.id)
    .single();

  if (!gig) return [];

  const { data: rows, error: joinError } = await supabase
    .from("applications")
    .select(
      `
      id,
      status,
      created_at,
      participant_user_id,
      gig_id,
      participant_profiles (
        full_name,
        photo_url,
        photo_visibility,
        bio,
        skills,
        availability,
        rate,
        verified,
        reputation_score,
        average_rating,
        total_ratings
      )
    `
    )
    .eq("gig_id", gigId)
    .order("created_at", { ascending: false });

  if (joinError || !rows?.length) {
    const { data: fallbackRows } = await supabase
      .from("applications")
      .select("id, gig_id, participant_user_id, status, created_at")
      .eq("gig_id", gigId)
      .order("created_at", { ascending: false });

    if (!fallbackRows?.length) return [];

    const participantIds = [...new Set(fallbackRows.map((r) => r.participant_user_id))];
    const { data: profiles } = await supabase
      .from("participant_profiles")
      .select(
        "user_id, full_name, photo_url, photo_visibility, bio, skills, availability, rate, verified, reputation_score, average_rating, total_ratings"
      )
      .in("user_id", participantIds);

    const confirmedBookingParticipantIds = await getConfirmedBookingParticipantIds(
      supabase,
      user.id,
      participantIds
    );

    const profileByUserId = new Map(
      (profiles ?? []).map((p) => [
        p.user_id,
        mapApplicantProfile(p, confirmedBookingParticipantIds.has(p.user_id)),
      ])
    );

    const certsByUserFallback = await import("@/lib/academy").then((m) =>
      m.getValidCertificatesForUsers(participantIds)
    );

    return fallbackRows.map((r) => {
      const certs = certsByUserFallback.get(r.participant_user_id) ?? [];
      return {
        ...r,
        participant_profiles: profileByUserId.get(r.participant_user_id) ?? null,
        academy_certificates: certs.map((c) => ({
          levelTitle: c.levelTitle,
          levelSubtitle: c.levelSubtitle,
          badge_color: c.badge_color,
        })),
      };
    });
  }

  if (!rows.length) return [];

  const participantIds = [...new Set(rows.map((r) => r.participant_user_id))];
  const [confirmedBookingParticipantIds, certsByUser] = await Promise.all([
    getConfirmedBookingParticipantIds(supabase, user.id, participantIds),
    import("@/lib/academy").then((m) => m.getValidCertificatesForUsers(participantIds)),
  ]);

  return rows.map((row) => {
    const rawProfile = row.participant_profiles as
      | {
          full_name: string | null;
          photo_url: string | null;
          photo_visibility: string | null;
          bio: string | null;
          skills: unknown;
          availability: unknown;
          rate: number | null;
          verified: boolean;
          reputation_score: number | null;
          average_rating: number | null;
          total_ratings: number | null;
        }
      | {
          full_name: string | null;
          photo_url: string | null;
          photo_visibility: string | null;
          bio: string | null;
          skills: unknown;
          availability: unknown;
          rate: number | null;
          verified: boolean;
          reputation_score: number | null;
          average_rating: number | null;
          total_ratings: number | null;
        }[]
      | null;

    const profile = Array.isArray(rawProfile) ? rawProfile[0] : rawProfile;

    const certs = certsByUser.get(row.participant_user_id) ?? [];

    return {
      id: row.id,
      gig_id: row.gig_id,
      participant_user_id: row.participant_user_id,
      status: row.status,
      created_at: row.created_at,
      participant_profiles: profile
        ? mapApplicantProfile(
            profile,
            confirmedBookingParticipantIds.has(row.participant_user_id)
          )
        : null,
      academy_certificates: certs.map((c) => ({
        levelTitle: c.levelTitle,
        levelSubtitle: c.levelSubtitle,
        badge_color: c.badge_color,
      })),
    };
  });
}

async function getConfirmedBookingParticipantIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  merchantUserId: string,
  participantIds: string[]
): Promise<Set<string>> {
  const confirmed = new Set<string>();
  if (participantIds.length === 0) return confirmed;

  const { data: bookingRows } = await supabase
    .from("bookings")
    .select("participant_user_id, gigs!inner(merchant_user_id)")
    .eq("gigs.merchant_user_id", merchantUserId)
    .in("participant_user_id", participantIds)
    .in("status", ["confirmed", "completed"]);

  for (const row of bookingRows ?? []) {
    confirmed.add((row as { participant_user_id: string }).participant_user_id);
  }
  return confirmed;
}

/** Bookings for this gig with checkins (attendance log). */
export async function getAttendanceForGig(gigId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: gig } = await supabase
    .from("gigs")
    .select("id")
    .eq("id", gigId)
    .eq("merchant_user_id", user.id)
    .single();

  if (!gig) return [];

  const { data: bookings } = await supabase
    .from("bookings")
    .select(
      `
      id,
      participant_user_id,
      status,
      accepted_at,
      created_at,
      checkins (
        id,
        type,
        lat,
        lon,
        created_at
      )
    `
    )
    .eq("gig_id", gigId)
    .order("created_at", { ascending: false });

  return bookings ?? [];
}

export async function acceptApplication(applicationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new AuthError("Authentication required.");

  const { data: app } = await supabase
    .from("applications")
    .select("id, gig_id, participant_user_id")
    .eq("id", applicationId)
    .single();

  if (!app) throw new AuthError("Application not found.");

  const { data: gig } = await supabase
    .from("gigs")
    .select("id, merchant_user_id, spots, title")
    .eq("id", app.gig_id)
    .eq("merchant_user_id", user.id)
    .single();

  if (!gig) throw new AuthError("Not authorised to accept this application.");

  const spots = Math.max(1, gig.spots ?? 1);
  const { count: currentBookings } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("gig_id", app.gig_id)
    .in("status", ["pending", "confirmed", "completed", "no_show"]);
  if ((currentBookings ?? 0) >= spots) {
    throw new AuthError("All spots for this gig are already filled.");
  }

  const { error: updateErr } = await supabase
    .from("applications")
    .update({ status: "accepted", updated_at: new Date().toISOString() })
    .eq("id", applicationId);

  if (updateErr) throw new AuthError("Could not accept application.");

  const { data: booking, error: bookErr } = await supabase
    .from("bookings")
    .insert({
      gig_id: app.gig_id,
      participant_user_id: app.participant_user_id,
      status: "pending",
      accepted_at: null,
    })
    .select("id")
    .single();

  if (bookErr || !booking) throw new AuthError("Could not create booking.");

  await supabase
    .from("applications")
    .update({
      status: "rejected",
      updated_at: new Date().toISOString(),
    })
    .eq("gig_id", app.gig_id)
    .neq("id", applicationId)
    .eq("status", "pending");

  const newTotal = (currentBookings ?? 0) + 1;
  if (newTotal >= spots) {
    await supabase
      .from("gigs")
      .update({
        status: "filled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", app.gig_id);
  }

  await logAudit("application", applicationId, "accepted", {
    gig_id: app.gig_id,
    booking_id: booking.id,
  });
  await logAudit("booking", booking.id, "created", { gig_id: app.gig_id });

  await notifyBookingOffer(
    app.participant_user_id,
    gig.title,
    booking.id
  );

  revalidatePath(`/dashboard/merchant/gigs/${app.gig_id}`);
  revalidatePath("/dashboard/merchant/gigs");
}

export async function rejectApplication(applicationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new AuthError("Authentication required.");

  const { data: app } = await supabase
    .from("applications")
    .select("id, gig_id, participant_user_id")
    .eq("id", applicationId)
    .single();

  if (!app) throw new AuthError("Application not found.");

  const { data: gig } = await supabase
    .from("gigs")
    .select("id, title")
    .eq("id", app.gig_id)
    .eq("merchant_user_id", user.id)
    .single();

  if (!gig) throw new AuthError("Not authorised to reject this application.");

  const { error } = await supabase
    .from("applications")
    .update({
      status: "rejected",
      updated_at: new Date().toISOString(),
    })
    .eq("id", applicationId);

  if (error) throw new AuthError("Could not reject application.");

  await logAudit("application", applicationId, "rejected", {});

  await notifyApplicationRejected(app.participant_user_id, gig.title);

  revalidatePath(`/dashboard/merchant/gigs/${app.gig_id}`);
  revalidatePath("/dashboard/merchant/gigs");
}
