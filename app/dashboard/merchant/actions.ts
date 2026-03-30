"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/auth";
import { AuthError } from "@/lib/auth";
import type { VerificationStatusDisplay } from "@/types/participant";
import type { MerchantProfileForm, MerchantResponsibleOfficerForm } from "@/types/merchant";
import { VERIFICATION_DOCS_BUCKET } from "@/lib/storage";

export async function getMerchantProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("merchant_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return data;
}

export async function upsertMerchantProfile(input: MerchantProfileForm) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new AuthError("Authentication required");

  const payload: Record<string, unknown> = {
    user_id: user.id,
    business_name: input.business_name ?? null,
    business_type: input.business_type ?? null,
    address: input.address ?? null,
    trn: input.trn ?? null,
    payment_method: input.payment_method ?? null,
    updated_at: new Date().toISOString(),
  };
  if (input.accept_disclaimer === true) {
    payload.disclaimer_accepted_at = new Date().toISOString();
  }

  let result = await supabase.from("merchant_profiles").upsert(payload, {
    onConflict: "user_id",
  });

  if (result.error) {
    const isMissingColumn =
      result.error.code === "42703" ||
      (typeof result.error.message === "string" &&
        result.error.message.includes("disclaimer_accepted_at"));
    if (isMissingColumn && payload.disclaimer_accepted_at !== undefined) {
      delete payload.disclaimer_accepted_at;
      result = await supabase.from("merchant_profiles").upsert(payload, {
        onConflict: "user_id",
      });
    }
    if (result.error) {
      throw new AuthError(
        "Could not save profile: " + (result.error.message ?? "Unknown error")
      );
    }
  }

  revalidatePath("/dashboard/merchant");
  revalidatePath("/dashboard/merchant/profile");
}

export async function getMerchantOfficers() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("merchant_responsible_officers")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  return data ?? [];
}

export async function addMerchantOfficer(input: MerchantResponsibleOfficerForm) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new AuthError("Authentication required");

  const payload: Record<string, unknown> = {
    user_id: user.id,
    name: input.name.trim(),
    position: input.position?.trim() || null,
    email: input.email?.trim() || null,
    phone: input.phone?.trim() || null,
  };
  if (input.id_doc_url != null) {
    payload.id_doc_url = input.id_doc_url;
  }

  let result = await supabase.from("merchant_responsible_officers").insert(payload);

  if (result.error) {
    const isMissingColumn =
      result.error.code === "42703" ||
      (typeof result.error.message === "string" &&
        result.error.message.includes("id_doc_url"));
    if (isMissingColumn && payload.id_doc_url !== undefined) {
      delete payload.id_doc_url;
      result = await supabase.from("merchant_responsible_officers").insert(payload);
    }
    if (result.error) {
      throw new AuthError(
        "Could not add officer: " + (result.error.message ?? "Unknown error")
      );
    }
  }

  revalidatePath("/dashboard/merchant/profile");
  revalidatePath("/dashboard/merchant/officers");
}

export async function updateMerchantOfficerIdDoc(
  officerId: string,
  idDocUrl: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new AuthError("Authentication required");

  const { error } = await supabase
    .from("merchant_responsible_officers")
    .update({ id_doc_url: idDocUrl })
    .eq("id", officerId)
    .eq("user_id", user.id);

  if (error) throw new AuthError("Could not update officer ID document.");
  revalidatePath("/dashboard/merchant/officers");
}

export async function updateMerchantOfficer(
  officerId: string,
  data: { name: string; position: string | null; email: string | null; phone: string | null }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new AuthError("Authentication required");

  const { error } = await supabase
    .from("merchant_responsible_officers")
    .update({
      name: data.name.trim(),
      position: data.position?.trim() || null,
      email: data.email?.trim() || null,
      phone: data.phone?.trim() || null,
    })
    .eq("id", officerId)
    .eq("user_id", user.id);

  if (error) throw new AuthError("Could not update officer.");
  revalidatePath("/dashboard/merchant/officers");
}

/** Returns a signed URL to view an officer's ID document (valid 1 hour). */
export async function getOfficerIdDocSignedUrl(path: string): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new AuthError("Authentication required");

  const { data, error } = await supabase.storage
    .from(VERIFICATION_DOCS_BUCKET)
    .createSignedUrl(path, 3600);

  if (error || !data?.signedUrl) throw new AuthError("Could not load document.");
  return data.signedUrl;
}

export async function deleteMerchantOfficer(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new AuthError("Authentication required");

  const { error } = await supabase
    .from("merchant_responsible_officers")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new AuthError("Could not remove officer.");
  revalidatePath("/dashboard/merchant/profile");
  revalidatePath("/dashboard/merchant/officers");
}

export async function getMerchantVerificationStatus(): Promise<{
  status: VerificationStatusDisplay;
  latestVerification: { status: string } | null;
  verified: boolean;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { status: "unverified", latestVerification: null, verified: false };
  }

  const { data: profile } = await supabase
    .from("merchant_profiles")
    .select("verified")
    .eq("user_id", user.id)
    .single();

  const { data: latest } = await supabase
    .from("verifications")
    .select("status")
    .eq("user_id", user.id)
    .eq("type", "merchant_officer")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const verified = profile?.verified === true;
  const pending =
    latest?.status === "pending" ||
    (!!latest && !verified && latest.status !== "rejected");

  let status: VerificationStatusDisplay = "unverified";
  if (verified) status = "verified";
  else if (pending) status = "pending";

  return {
    status,
    latestVerification: latest,
    verified: verified ?? false,
  };
}

/** True if merchant can post gigs (verified). */
export async function isMerchantVerified(): Promise<boolean> {
  const { verified } = await getMerchantVerificationStatus();
  return verified;
}

export async function submitMerchantVerification(officerIdDocUrl: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new AuthError("Authentication required");

  const { error } = await supabase.from("verifications").insert({
    user_id: user.id,
    type: "merchant_officer",
    id_doc_url: officerIdDocUrl,
    selfie_url: null,
    status: "pending",
  });

  if (error) throw new AuthError("Could not submit verification.");
  revalidatePath("/dashboard/merchant");
  revalidatePath("/dashboard/merchant/profile");
}

/** Read-only dashboard data: gigs, counts, verification, reports. Reuses existing queries + minimal extra reads. */
export type MerchantDashboardData = {
  gigs: { id: string; title: string; status: string; start_time: string | null; end_time: string | null; spots: number; spots_filled: number; location_general: string | null; [key: string]: unknown }[];
  todayGigs: { id: string; title: string; status: string; start_time: string | null; end_time: string | null; spots: number; spots_filled: number; location_general: string | null; [key: string]: unknown }[];
  todayCheckinsByGig: Record<string, number>;
  activeGigsCount: number;
  applicantsAwaitingReview: number;
  pendingApplicationsByGig: { gigId: string; gigTitle: string; count: number }[];
  confirmedThisWeek: number;
  noShowCount: number;
  verificationStatus: import("@/types/participant").VerificationStatusDisplay;
  canPostGigs: boolean;
  reportOutcomes: { id: string; status: string; outcome_message: string | null; updated_at: string }[];
  pendingReportsAboutYou: number;
  usageSummary: { tier: string; status: string; activeGigs: number; maxActiveGigs: number | null; atLimit: boolean; canCreateGig: boolean } | null;
};

export async function getMerchantDashboardData(): Promise<MerchantDashboardData | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [verification, canPostGigs, reportOutcomes, gigs, usageSummaryResult] = await Promise.all([
    getMerchantVerificationStatus(),
    isMerchantVerified(),
    import("@/app/dashboard/participant/actions").then((m) => m.getReportOutcomesForCurrentUser()),
    import("@/app/dashboard/merchant/gigs/actions").then((m) => m.listMyGigs()),
    import("@/lib/billing/gating")
      .then((m) => m.getUsageSummary(user.id))
      .catch(() => null),
  ]);
  const usageSummary = usageSummaryResult ?? null;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 7);
  weekStart.setHours(0, 0, 0, 0);

  const todayGigs = gigs.filter((g) => {
    const start = g.start_time ? new Date(g.start_time) : null;
    return start && start >= todayStart && start < todayEnd;
  });
  const todayGigIds = todayGigs.map((g) => g.id);
  let todayCheckinsByGig: Record<string, number> = {};
  if (todayGigIds.length > 0) {
    const { data: todayBookings } = await supabase
      .from("bookings")
      .select("id, gig_id, checkins(id)")
      .in("gig_id", todayGigIds)
      .in("status", ["confirmed", "completed", "no_show"]);
    for (const b of todayBookings ?? []) {
      const gigId = b.gig_id;
      const checkins = (b as { checkins?: { id: string }[] }).checkins ?? [];
      if (checkins.length > 0) {
        todayCheckinsByGig[gigId] = (todayCheckinsByGig[gigId] ?? 0) + 1;
      }
    }
  }
  const activeGigsCount = gigs.filter(
    (g) => g.status === "open" || g.status === "filled"
  ).length;

  const gigIds = gigs.map((g) => g.id);
  let pendingApplicationsByGig: { gigId: string; gigTitle: string; count: number }[] = [];
  let applicantsAwaitingReview = 0;
  let confirmedThisWeek = 0;
  let noShowCount = 0;
  let pendingReportsAboutYou = 0;

  if (gigIds.length > 0) {
    const [pendingRes, bookingsRes, reportsRes] = await Promise.all([
      supabase
        .from("applications")
        .select("gig_id")
        .in("gig_id", gigIds)
        .eq("status", "pending"),
      supabase
        .from("bookings")
        .select("gig_id, status, accepted_at")
        .in("gig_id", gigIds),
      supabase
        .from("reports")
        .select("id", { count: "exact", head: true })
        .eq("reported_id", user.id)
        .eq("status", "pending"),
    ]);

    const pendingByGig: Record<string, number> = {};
    for (const r of pendingRes.data ?? []) {
      pendingByGig[r.gig_id] = (pendingByGig[r.gig_id] ?? 0) + 1;
      applicantsAwaitingReview += 1;
    }
    const gigMap = new Map(gigs.map((g) => [g.id, g]));
    pendingApplicationsByGig = Object.entries(pendingByGig)
      .map(([gigId, count]) => ({
        gigId,
        gigTitle: gigMap.get(gigId)?.title ?? "Gig",
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    for (const b of bookingsRes.data ?? []) {
      if (b.status === "confirmed" && b.accepted_at) {
        const at = new Date(b.accepted_at);
        if (at >= weekStart) confirmedThisWeek += 1;
      }
      if (b.status === "no_show") noShowCount += 1;
    }
    pendingReportsAboutYou = reportsRes.count ?? 0;
  }

  return {
    gigs,
    todayGigs,
    todayCheckinsByGig,
    activeGigsCount,
    applicantsAwaitingReview,
    pendingApplicationsByGig,
    confirmedThisWeek,
    noShowCount,
    verificationStatus: verification.status,
    canPostGigs,
    reportOutcomes,
    pendingReportsAboutYou,
    usageSummary,
  };
}
