"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/auth";
import { AuthError } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
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
  location_general: string | null;
  location_exact: string | null;
  start_time: string | null;
  end_time: string | null;
  status: GigStatus;
  spots: number;
};

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
    throw new AuthError(PLAN_LIMIT_REACHED);
  }

  const spots = Math.max(1, Number(input.spots) || 1);
  const { data: gig, error: gigError } = await supabase
    .from("gigs")
    .insert({
      merchant_user_id: user.id,
      title: input.title.trim(),
      duties: input.duties ?? [],
      pay_rate: input.pay_rate,
      payment_method_dummy: input.payment_method_dummy,
      location_general: input.location_general?.trim() || null,
      start_time: input.start_time || null,
      end_time: input.end_time || null,
      status: input.status ?? "draft",
      spots,
    })
    .select("id")
    .single();

  if (gigError || !gig) throw new AuthError("Could not create gig.");

  if (input.location_exact?.trim()) {
    await supabase.from("gig_locations").insert({
      gig_id: gig.id,
      location_exact: input.location_exact.trim(),
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
  if (input.location_general !== undefined && !locked)
    gigRow.location_general = input.location_general?.trim() || null;
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
    input.location_exact !== undefined &&
    !locked
  ) {
    await supabase
      .from("gig_locations")
      .upsert(
        { gig_id: gigId, location_exact: input.location_exact?.trim() || null },
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
      .select("location_exact")
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
    spots: gig.spots ?? 1,
    spots_filled,
  };
}

/** Display-only participant fields for merchants (excludes address, phone, emergency_contact). */
export type ApplicantDisplay = {
  full_name: string | null;
  bio: string | null;
  location_general: string | null;
  rate: number | null;
};

export type ApplicationWithApplicant = {
  id: string;
  gig_id: string;
  participant_user_id: string;
  status: string;
  created_at: string;
  participant_display: ApplicantDisplay | null;
};

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

  const { data: rows } = await supabase
    .from("applications")
    .select("id, gig_id, participant_user_id, status, created_at")
    .eq("gig_id", gigId)
    .order("created_at", { ascending: false });

  if (!rows?.length) return [];

  const participantIds = [...new Set(rows.map((r) => r.participant_user_id))];
  const { data: profiles } = await supabase
    .from("participant_profiles")
    .select("user_id, full_name, bio, location_general, rate")
    .in("user_id", participantIds);

  const displayByUserId = new Map<string, ApplicantDisplay>();
  (profiles ?? []).forEach((p: { user_id: string; full_name: string | null; bio: string | null; location_general: string | null; rate: number | null }) => {
    displayByUserId.set(p.user_id, {
      full_name: p.full_name ?? null,
      bio: p.bio ?? null,
      location_general: p.location_general ?? null,
      rate: p.rate ?? null,
    });
  });

  return rows.map((r) => ({
    ...r,
    participant_display: displayByUserId.get(r.participant_user_id) ?? null,
  })) as ApplicationWithApplicant[];
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
    .select("id, merchant_user_id, spots")
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
    .select("id, gig_id")
    .eq("id", applicationId)
    .single();

  if (!app) throw new AuthError("Application not found.");

  const { data: gig } = await supabase
    .from("gigs")
    .select("id")
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

  revalidatePath(`/dashboard/merchant/gigs/${app.gig_id}`);
  revalidatePath("/dashboard/merchant/gigs");
}
