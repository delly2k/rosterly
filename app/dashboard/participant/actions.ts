"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/auth";
import { AuthError } from "@/lib/auth";
import { isProfileComplete } from "@/lib/participant";
import { calculateCompletion } from "@/lib/participant-profile-completion";
import { PHOTO_VISIBILITY_VALUES, normalizePhotoVisibility, type PhotoVisibility } from "@/lib/photo-privacy";
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
  const normalized = normalizePhotoVisibility(visibility);
  if (!PHOTO_VISIBILITY_VALUES.includes(normalized)) {
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
      photo_visibility: normalized,
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

  const { data: verification, error } = await supabase
    .from("verifications")
    .insert({
      user_id: user.id,
      type: "participant_id",
      id_doc_url: idDocUrl,
      selfie_url: selfieUrl,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) throw new AuthError("Could not submit verification.");

  const { getAdminUserIds, notifyAdminsVerificationSubmitted } = await import(
    "@/lib/notifications"
  );
  const submitterName =
    profile?.full_name?.trim() || user.email?.split("@")[0] || "A user";
  const adminIds = await getAdminUserIds();
  if (verification) {
    await notifyAdminsVerificationSubmitted(
      adminIds,
      submitterName,
      verification.id
    );
    const { triggerVerificationAiAnalysis } = await import(
      "@/lib/trigger-verification-ai-analysis"
    );
    triggerVerificationAiAnalysis(verification.id);
  }

  revalidatePath("/dashboard/participant");
  revalidatePath("/dashboard/participant/verification");
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

function countSkills(raw: unknown): number {
  if (!Array.isArray(raw)) return 0;
  return raw.filter((s): s is string => typeof s === "string" && s.trim().length > 0).length;
}

/** Dashboard payload: reused queries only, no new backend logic. */
export type ParticipantDashboardData = {
  verificationStatus: VerificationStatusDisplay;
  profileComplete: boolean;
  profileCompletionPercent: number;
  profileCompletionMissing: string[];
  photoVisibilityMode: string | null;
  hasName: boolean;
  hasBio: boolean;
  hasAnySkills: boolean;
  hasSkills: boolean;
  hasRate: boolean;
  hasAvailability: boolean;
  hasLocation: boolean;
  reputationScore: number;
  averageRating: number | null;
  totalRatings: number;
  verified: boolean;
  gigsCompleted: number;
  nextConfirmedGig: { bookingId: string; gigTitle: string; startTime: string | null; status: string } | null;
  upcomingBookings: {
    bookingId: string;
    gigTitle: string;
    startTime: string | null;
    status: string;
    locationGeneral: string | null;
    payRate: number | null;
    teamLabel?: string;
  }[];
  applicationCounts: { pending: number; accepted: number; rejected: number };
  recentChats: {
    id: string;
    gigTitle: string;
    merchantName: string;
    created_at: string;
  }[];
  reportOutcomes: ReportOutcomeRow[];
  userId: string;
  bookingsForEarnings: {
    status: string;
    startTime: string | null;
    endTime: string | null;
    payRate: number | null;
  }[];
};

export async function getParticipantDashboardData(): Promise<ParticipantDashboardData | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [verification, profile, bookings, applications, reportOutcomes, recentChats] =
    await Promise.all([
      getVerificationStatus(),
      getParticipantProfile(),
      import("@/app/dashboard/participant/bookings/actions").then((m) => m.listMyBookings()),
      import("@/app/dashboard/participant/gigs/actions").then((m) => m.listMyApplications()),
      getReportOutcomesForCurrentUser(),
      user
        ? import("@/lib/chats").then((m) => m.getRecentChatsForDashboard(user.id, 3))
        : Promise.resolve([]),
    ]);

  const profileRow = profile as {
    full_name?: string | null;
    bio?: string | null;
    location_general?: string | null;
    rate?: number | null;
    photo_url?: string | null;
    photo_visibility?: string | null;
    skills?: unknown;
    availability?: unknown;
    reputation_score?: number | null;
    average_rating?: number | null;
    total_ratings?: number | null;
    verified?: boolean;
  } | null;

  const { pct: profileCompletionPercent, missing: profileCompletionMissing } =
    calculateCompletion(profileRow);

  const skillsCount = countSkills(profileRow?.skills);
  const hasName = !profileCompletionMissing.includes("Full name");
  const hasBio = !profileCompletionMissing.includes("Bio");
  const hasLocation = !profileCompletionMissing.includes("Location");
  const hasRate = !profileCompletionMissing.includes("Hourly rate");
  const hasAnySkills = skillsCount > 0;
  const hasSkills = !profileCompletionMissing.includes("At least 1 skill");
  const hasAvailability = !profileCompletionMissing.includes("Availability");

  const now = new Date();
  const withGig = bookings.filter((b) => {
    const g = Array.isArray(b.gigs) ? b.gigs[0] : b.gigs;
    return g && (b.status === "confirmed" || b.status === "pending" || b.status === "completed");
  }) as {
    id: string;
    status: string;
    gigs:
      | {
          title?: string;
          start_time?: string | null;
          location_general?: string | null;
          pay_rate?: number | null;
        }
      | {
          title?: string;
          start_time?: string | null;
          location_general?: string | null;
          pay_rate?: number | null;
        }[];
  }[];
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
      locationGeneral: g?.location_general ?? null,
      payRate: g?.pay_rate ?? null,
    };
  });

  const gigsCompleted = bookings.filter(
    (b: { status: string }) => b.status === "completed"
  ).length;

  const pending = applications.filter((a: { status: string }) => a.status === "pending").length;
  const accepted = applications.filter((a: { status: string }) => a.status === "accepted").length;
  const rejected = applications.filter((a: { status: string }) => a.status === "rejected").length;

  return {
    verificationStatus: verification.status,
    profileComplete: verification.profileComplete,
    profileCompletionPercent,
    profileCompletionMissing,
    photoVisibilityMode: profileRow?.photo_visibility ?? null,
    hasName,
    hasBio,
    hasAnySkills,
    hasSkills,
    hasRate,
    hasAvailability,
    hasLocation,
    reputationScore: profileRow?.reputation_score ?? 0,
    averageRating:
      profileRow?.average_rating != null ? Number(profileRow.average_rating) : null,
    totalRatings: profileRow?.total_ratings ?? 0,
    verified: profileRow?.verified ?? verification.status === "verified",
    gigsCompleted,
    nextConfirmedGig,
    upcomingBookings,
    applicationCounts: { pending, accepted, rejected },
    recentChats,
    reportOutcomes,
    userId: user.id,
    bookingsForEarnings: bookings.map((b) => {
      const g = Array.isArray(b.gigs) ? b.gigs[0] : b.gigs;
      return {
        status: b.status,
        startTime: g?.start_time ?? null,
        endTime: g?.end_time ?? null,
        payRate: g?.pay_rate != null ? Number(g.pay_rate) : null,
      };
    }),
  };
}
