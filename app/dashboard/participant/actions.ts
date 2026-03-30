"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/auth";
import { AuthError } from "@/lib/auth";
import { isProfileComplete } from "@/lib/participant";
import { PHOTO_VISIBILITY_VALUES, type PhotoVisibility } from "@/lib/photo-privacy";
import type { VerificationStatusDisplay } from "@/types/participant";

export type ParticipantProfileForm = {
  full_name: string | null;
  bio: string | null;
  skills: unknown;
  location_general: string | null;
  availability: unknown;
  rate: number | null;
  emergency_contact: string | null;
  photo_url: string | null;
  disclaimer_accepted_at: string | null;
};

export async function getParticipantProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("participant_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return data;
}

/** True if user has submitted a participant_id verification (locks name/identity). */
export async function isIdentityLocked(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return true;

  const { data } = await supabase
    .from("verifications")
    .select("id")
    .eq("user_id", user.id)
    .eq("type", "participant_id")
    .limit(1)
    .maybeSingle();

  return !!data;
}

/** Allow updating full_name when identity is locked but name is still empty (one-time complete after verification). */
export async function canSetFullNameWhenLocked(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("participant_profiles")
    .select("full_name")
    .eq("user_id", userId)
    .single();
  return !isProfileComplete(data);
}

export async function upsertParticipantProfile(
  input: ParticipantProfileForm,
  identityLocked: boolean
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new AuthError("Authentication required");

  const row: Record<string, unknown> = {
    user_id: user.id,
    bio: input.bio ?? null,
    skills: input.skills ?? [],
    location_general: input.location_general ?? null,
    availability: input.availability ?? {},
    rate: input.rate ?? null,
    emergency_contact: input.emergency_contact ?? null,
    disclaimer_accepted_at: input.disclaimer_accepted_at ?? null,
    updated_at: new Date().toISOString(),
  };

  const allowNameUpdate = !identityLocked || (await canSetFullNameWhenLocked(user.id));
  if (allowNameUpdate) {
    row.full_name = input.full_name ?? null;
  }

  const { data: existing } = await supabase
    .from("participant_profiles")
    .select("photo_source, photo_url")
    .eq("user_id", user.id)
    .maybeSingle();
  const existingProfile = existing as { photo_source?: string; photo_url?: string | null } | null;
  const photoSource = existingProfile?.photo_source;
  if (photoSource === "verification_selfie") {
    row.photo_url = existingProfile?.photo_url ?? null;
  } else {
    row.photo_url = input.photo_url ?? null;
  }

  const { error } = await supabase.from("participant_profiles").upsert(row, {
    onConflict: "user_id",
  });

  if (error) throw new AuthError("Could not save profile.");
  revalidatePath("/dashboard/participant");
  revalidatePath("/dashboard/participant/profile");
  revalidatePath("/dashboard/participant/verification");
}

export async function updatePhotoVisibility(visibility: string): Promise<{ ok: boolean; error?: string }> {
  if (!PHOTO_VISIBILITY_VALUES.includes(visibility as PhotoVisibility)) {
    return { ok: false, error: "Invalid visibility value." };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Authentication required." };

  const { error } = await supabase
    .from("participant_profiles")
    .update({
      photo_visibility: visibility,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/participant");
  revalidatePath("/dashboard/participant/profile");
  return { ok: true };
}

export async function getVerificationStatus(): Promise<{
  status: VerificationStatusDisplay;
  latestVerification: { status: string } | null;
  verified: boolean;
  profileComplete: boolean;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { status: "unverified", latestVerification: null, verified: false, profileComplete: false };
  }

  const { data: profile } = await supabase
    .from("participant_profiles")
    .select("verified, full_name")
    .eq("user_id", user.id)
    .single();

  const { data: latest } = await supabase
    .from("verifications")
    .select("status")
    .eq("user_id", user.id)
    .eq("type", "participant_id")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const verified = profile?.verified === true;
  const approved = latest?.status === "approved";
  const pending = latest?.status === "pending";

  let status: VerificationStatusDisplay = "unverified";
  if (verified || approved) status = "verified";
  else if (pending) status = "pending";

  return {
    status,
    latestVerification: latest,
    verified: verified || approved || false,
    profileComplete: isProfileComplete(profile),
  };
}

export async function submitVerification(idDocUrl: string, selfieUrl: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new AuthError("Authentication required");

  const { data: profile } = await supabase
    .from("participant_profiles")
    .select("full_name")
    .eq("user_id", user.id)
    .single();
  if (!isProfileComplete(profile)) {
    throw new AuthError(
      "Complete your profile before submitting verification. Add your full name in Profile, then return here."
    );
  }

  const { error } = await supabase.from("verifications").insert({
    user_id: user.id,
    type: "participant_id",
    id_doc_url: idDocUrl,
    selfie_url: selfieUrl,
    status: "pending",
  });

  if (error) throw new AuthError("Could not submit verification.");
  revalidatePath("/dashboard/participant");
  revalidatePath("/dashboard/participant/verification");
}

export async function logSosEvent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new AuthError("Authentication required");

  const { error } = await supabase.from("sos_events").insert({
    user_id: user.id,
  });

  if (error) throw new AuthError("Could not log event.");
  revalidatePath("/dashboard/participant");
}

/** Outcomes of reports where the current user was the reported party. Only resolved/dismissed; only id, status, outcome_message, updated_at. */
export type ReportOutcomeRow = {
  id: string;
  status: string;
  outcome_message: string | null;
  updated_at: string;
};

export async function getReportOutcomesForCurrentUser(): Promise<ReportOutcomeRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("reports")
    .select("id, status, outcome_message, updated_at")
    .eq("reported_id", user.id)
    .in("status", ["resolved", "dismissed"])
    .order("updated_at", { ascending: false });

  return (data ?? []) as ReportOutcomeRow[];
}

/** Dashboard payload: reused queries only, no new backend logic. */
export type ParticipantDashboardData = {
  verificationStatus: VerificationStatusDisplay;
  profileComplete: boolean;
  profileCompletionPercent: number;
  photoVisibilityMode: string | null;
  nextConfirmedGig: { bookingId: string; gigTitle: string; startTime: string | null; status: string } | null;
  upcomingBookings: { bookingId: string; gigTitle: string; startTime: string | null; status: string; teamLabel?: string }[];
  applicationCounts: { pending: number; accepted: number; rejected: number };
  recentChats: { id: string; gigTitle: string; createdAt: string }[];
  reportOutcomes: ReportOutcomeRow[];
};

export async function getParticipantDashboardData(): Promise<ParticipantDashboardData | null> {
  const [verification, profile, bookings, applications, chats, reportOutcomes] = await Promise.all([
    getVerificationStatus(),
    getParticipantProfile(),
    import("@/app/dashboard/participant/bookings/actions").then((m) => m.listMyBookings()),
    import("@/app/dashboard/participant/gigs/actions").then((m) => m.listMyApplications()),
    import("@/app/actions/chat").then((m) => m.listMyChats()),
    getReportOutcomesForCurrentUser(),
  ]);

  const profileRow = profile as { full_name?: string | null; bio?: string | null; rate?: number | null; photo_url?: string | null; photo_visibility?: string | null } | null;
  let profileCompletionPercent = 0;
  if (profileRow) {
    if (profileRow.full_name?.trim()) profileCompletionPercent += 40;
    if (profileRow.bio?.trim()) profileCompletionPercent += 20;
    if (profileRow.rate != null && profileRow.rate > 0) profileCompletionPercent += 20;
    if (profileRow.photo_url?.trim()) profileCompletionPercent += 20;
  }

  const now = new Date();
  const withGig = bookings.filter((b) => {
    const g = Array.isArray(b.gigs) ? b.gigs[0] : b.gigs;
    return g && (b.status === "confirmed" || b.status === "pending" || b.status === "completed");
  }) as { id: string; status: string; gigs: { title?: string; start_time?: string | null } | { title?: string; start_time?: string | null }[] }[];
  const sorted = [...withGig].sort((a, b) => {
    const gA = Array.isArray(a.gigs) ? a.gigs[0] : a.gigs;
    const gB = Array.isArray(b.gigs) ? b.gigs[0] : b.gigs;
    const tA = gA?.start_time ? new Date(gA.start_time).getTime() : 0;
    const tB = gB?.start_time ? new Date(gB.start_time).getTime() : 0;
    return tA - tB;
  });
  const upcoming = sorted.filter((b) => {
    const g = Array.isArray(b.gigs) ? b.gigs[0] : b.gigs;
    const start = g?.start_time ? new Date(g.start_time) : null;
    return start && start >= now;
  });
  const nextConfirmedGig = upcoming[0]
    ? {
        bookingId: upcoming[0].id,
        gigTitle: (Array.isArray(upcoming[0].gigs) ? upcoming[0].gigs[0] : upcoming[0].gigs)?.title ?? "Gig",
        startTime: (Array.isArray(upcoming[0].gigs) ? upcoming[0].gigs[0] : upcoming[0].gigs)?.start_time ?? null,
        status: upcoming[0].status,
      }
    : null;
  const upcomingBookings = upcoming.slice(0, 3).map((b) => {
    const g = Array.isArray(b.gigs) ? b.gigs[0] : b.gigs;
    return {
      bookingId: b.id,
      gigTitle: g?.title ?? "Gig",
      startTime: g?.start_time ?? null,
      status: b.status,
    };
  });

  const pending = applications.filter((a: { status: string }) => a.status === "pending").length;
  const accepted = applications.filter((a: { status: string }) => a.status === "accepted").length;
  const rejected = applications.filter((a: { status: string }) => a.status === "rejected").length;

  const recentChats = (chats as { id: string; gig?: { title?: string }; created_at: string }[])
    .slice(0, 3)
    .map((c) => ({ id: c.id, gigTitle: c.gig?.title ?? "Chat", createdAt: c.created_at }));

  return {
    verificationStatus: verification.status,
    profileComplete: verification.profileComplete,
    profileCompletionPercent,
    photoVisibilityMode: profileRow?.photo_visibility ?? null,
    nextConfirmedGig,
    upcomingBookings,
    applicationCounts: { pending, accepted, rejected },
    recentChats,
    reportOutcomes,
  };
}
