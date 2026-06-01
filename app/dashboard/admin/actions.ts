"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient, getCurrentUser } from "@/lib/auth";
import { AuthError } from "@/lib/auth";
import { ROLES, PROFILE_STATUS } from "@/lib/roles";
import type { ProfileStatus } from "@/lib/roles";
import { promoteSelfieToProfilePhoto } from "@/lib/promote-selfie-to-avatar";
import { VERIFICATION_DOCS_BUCKET } from "@/lib/storage";
import { formatAuditPayloadSummary } from "@/lib/audit-display";

const ADMIN_PATHS = ["/dashboard/admin", "/dashboard/admin/verifications", "/dashboard/admin/reports", "/dashboard/admin/users", "/dashboard/admin/audit", "/dashboard/admin/bookings", "/dashboard/admin/chats"];

async function requireAdmin() {
  const current = await getCurrentUser();
  if (!current?.user) throw new AuthError("Authentication required.");
  if (!current.profile || current.profile.role !== ROLES.ADMIN)
    throw new AuthError("Admin access required.");
  return { current, supabase: await createClient() };
}

async function logAdminAction(
  supabase: Awaited<ReturnType<typeof createClient>>,
  action: string,
  targetTable: string | null,
  targetId: string | null,
  reason: string | null
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("admin_actions").insert({
    admin_id: user.id,
    action,
    target_table: targetTable,
    target_id: targetId,
    reason,
  });
}

// ---------- Verifications ----------

export type VerificationRow = {
  id: string;
  user_id: string;
  type: string;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  display_name: string | null;
  ai_verdict: string | null;
  ai_confidence: number | null;
};

export type ParticipantVerificationQueueRow = {
  id: string;
  user_id: string;
  type: string;
  status: string;
  created_at: string;
  ai_verdict: string | null;
  ai_confidence: number | null;
  full_name: string | null;
  location_general: string | null;
  verified: boolean;
};

export type MerchantVerificationQueueRow = {
  id: string;
  user_id: string;
  type: string;
  status: string;
  created_at: string;
  ai_verdict: string | null;
  ai_confidence: number | null;
  business_name: string | null;
  business_type: string | null;
  verified: boolean;
};

const QUEUE_STATUSES = ["pending", "rejected"] as const;

/** Participant ID verifications needing review (pending + rejected). */
export async function listParticipantVerificationQueue(): Promise<
  ParticipantVerificationQueueRow[]
> {
  const { supabase } = await requireAdmin();
  const { data: rows } = await supabase
    .from("verifications")
    .select("id, user_id, type, status, created_at, ai_verdict, ai_confidence")
    .eq("type", "participant_id")
    .in("status", [...QUEUE_STATUSES])
    .order("ai_verdict", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (!rows?.length) return [];

  const userIds = rows.map((r) => r.user_id);
  const { data: profiles } = await supabase
    .from("participant_profiles")
    .select("user_id, full_name, location_general, verified")
    .in("user_id", userIds);

  const profileByUserId = new Map(
    (profiles ?? []).map((p) => [p.user_id, p])
  );

  return rows.map((r) => {
    const profile = profileByUserId.get(r.user_id);
    return {
      id: r.id,
      user_id: r.user_id,
      type: r.type,
      status: r.status,
      created_at: r.created_at,
      ai_verdict: r.ai_verdict ?? null,
      ai_confidence: r.ai_confidence ?? null,
      full_name: profile?.full_name?.trim() ?? null,
      location_general: profile?.location_general?.trim() ?? null,
      verified: profile?.verified ?? false,
    };
  });
}

/** Merchant officer verifications needing review (pending + rejected). */
export async function listMerchantVerificationQueue(): Promise<
  MerchantVerificationQueueRow[]
> {
  const { supabase } = await requireAdmin();
  const { data: rows } = await supabase
    .from("verifications")
    .select("id, user_id, type, status, created_at, ai_verdict, ai_confidence")
    .eq("type", "merchant_officer")
    .in("status", [...QUEUE_STATUSES])
    .order("ai_verdict", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (!rows?.length) return [];

  const userIds = rows.map((r) => r.user_id);
  const { data: profiles } = await supabase
    .from("merchant_profiles")
    .select("user_id, business_name, business_type, verified")
    .in("user_id", userIds);

  const profileByUserId = new Map(
    (profiles ?? []).map((p) => [p.user_id, p])
  );

  return rows.map((r) => {
    const profile = profileByUserId.get(r.user_id);
    return {
      id: r.id,
      user_id: r.user_id,
      type: r.type,
      status: r.status,
      created_at: r.created_at,
      ai_verdict: r.ai_verdict ?? null,
      ai_confidence: r.ai_confidence ?? null,
      business_name: profile?.business_name?.trim() ?? null,
      business_type: profile?.business_type?.trim() ?? null,
      verified: profile?.verified ?? false,
    };
  });
}

/** @deprecated Use listParticipantVerificationQueue / listMerchantVerificationQueue */
export async function listPendingVerifications(): Promise<VerificationRow[]> {
  const [participants, merchants] = await Promise.all([
    listParticipantVerificationQueue(),
    listMerchantVerificationQueue(),
  ]);
  return [
    ...participants.map((p) => ({
      id: p.id,
      user_id: p.user_id,
      type: p.type,
      status: p.status,
      created_at: p.created_at,
      reviewed_at: null,
      display_name: p.full_name,
      ai_verdict: p.ai_verdict,
      ai_confidence: p.ai_confidence,
    })),
    ...merchants.map((m) => ({
      id: m.id,
      user_id: m.user_id,
      type: m.type,
      status: m.status,
      created_at: m.created_at,
      reviewed_at: null,
      display_name: m.business_name,
      ai_verdict: m.ai_verdict,
      ai_confidence: m.ai_confidence,
    })),
  ];
}

export type VerificationDetail = {
  id: string;
  user_id: string;
  type: string;
  status: string;
  id_doc_url: string | null;
  selfie_url: string | null;
  created_at: string;
  idDocSignedUrl: string | null;
  selfieSignedUrl: string | null;
  userFullName: string | null;
  ai_verdict: string | null;
  ai_confidence: number | null;
  ai_analysis: Record<string, unknown> | null;
};

/** Fetch one verification with signed URLs for ID and selfie (admin only). */
export async function getVerificationDetail(
  verificationId: string
): Promise<VerificationDetail | null> {
  const { supabase } = await requireAdmin();
  const { data: verification } = await supabase
    .from("verifications")
    .select(
      "id, user_id, type, status, id_doc_url, selfie_url, created_at, ai_verdict, ai_confidence, ai_analysis, ai_reviewed_at"
    )
    .eq("id", verificationId)
    .single();
  if (!verification) return null;

  const admin = createAdminClient();
  const expiresIn = 3600;

  let idDocSignedUrl: string | null = null;
  let selfieSignedUrl: string | null = null;
  if (verification.id_doc_url) {
    const { data: idDoc } = await admin.storage
      .from(VERIFICATION_DOCS_BUCKET)
      .createSignedUrl(verification.id_doc_url, expiresIn);
    idDocSignedUrl = idDoc?.signedUrl ?? null;
  }
  if (verification.selfie_url) {
    const { data: selfie } = await admin.storage
      .from(VERIFICATION_DOCS_BUCKET)
      .createSignedUrl(verification.selfie_url, expiresIn);
    selfieSignedUrl = selfie?.signedUrl ?? null;
  }

  let userFullName: string | null = null;
  if (verification.type === "participant_id") {
    const { data: profile } = await supabase
      .from("participant_profiles")
      .select("full_name")
      .eq("user_id", verification.user_id)
      .single();
    userFullName = profile?.full_name ?? null;
  } else if (verification.type === "merchant_officer") {
    const { data: profile } = await supabase
      .from("merchant_profiles")
      .select("officer_name")
      .eq("user_id", verification.user_id)
      .single();
    userFullName = (profile as { officer_name?: string } | null)?.officer_name ?? null;
  }

  return {
    id: verification.id,
    user_id: verification.user_id,
    type: verification.type,
    status: verification.status,
    id_doc_url: verification.id_doc_url,
    selfie_url: verification.selfie_url,
    created_at: verification.created_at,
    idDocSignedUrl,
    selfieSignedUrl,
    userFullName,
    ai_verdict: verification.ai_verdict ?? null,
    ai_confidence: verification.ai_confidence ?? null,
    ai_analysis: (verification.ai_analysis as Record<string, unknown> | null) ?? null,
  };
}

export async function approveVerification(verificationId: string, reason?: string) {
  const { current, supabase } = await requireAdmin();

  const { data: verification } = await supabase
    .from("verifications")
    .select("id, user_id, type, selfie_url")
    .eq("id", verificationId)
    .single();
  if (!verification) throw new AuthError("Verification not found.");

  await supabase
    .from("verifications")
    .update({
      status: "approved",
      reviewed_by: current.user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", verificationId);

  const adminClient = createAdminClient();
  if (verification.type === "participant_id") {
    let photoUrl: string | null = null;
    let photoSource: string = "none";

    const { data: profile } = await adminClient
      .from("participant_profiles")
      .select("photo_url, photo_source")
      .eq("user_id", verification.user_id)
      .single();

    if (profile) {
      photoUrl = (profile as { photo_url?: string | null }).photo_url ?? null;
      photoSource = (profile as { photo_source?: string }).photo_source ?? "none";
    }

    const shouldPromoteSelfie =
      verification.selfie_url &&
      (photoUrl == null || photoUrl === "" || photoSource === "none");

    if (shouldPromoteSelfie && verification.selfie_url) {
      const avatarUrl = await promoteSelfieToProfilePhoto(
        verification.selfie_url,
        verification.user_id
      );
      if (avatarUrl) {
        await adminClient
          .from("participant_profiles")
          .update({
            verified: true,
            updated_at: new Date().toISOString(),
            photo_url: avatarUrl,
            photo_source: "verification_selfie",
          })
          .eq("user_id", verification.user_id);
        await logAdminAction(
          supabase,
          "PROMOTE_SELFIE_TO_PROFILE_PHOTO",
          "participant_profiles",
          verification.user_id,
          null
        );
      } else {
        await adminClient
          .from("participant_profiles")
          .update({ verified: true, updated_at: new Date().toISOString() })
          .eq("user_id", verification.user_id);
      }
    } else {
      await adminClient
        .from("participant_profiles")
        .update({ verified: true, updated_at: new Date().toISOString() })
        .eq("user_id", verification.user_id);
    }
  } else if (verification.type === "merchant_officer") {
    await adminClient
      .from("merchant_profiles")
      .update({ verified: true, updated_at: new Date().toISOString() })
      .eq("user_id", verification.user_id);
  }

  await logAdminAction(supabase, "approve_verification", "verifications", verificationId, reason ?? null);

  const { createNotification, notifyVerificationApproved } = await import(
    "@/lib/notifications"
  );
  await notifyVerificationApproved(
    verification.user_id,
    verification.type === "merchant_officer" ? "merchant" : "participant"
  );

  if (verification.type === "merchant_officer") {
    await createNotification({
      userId: verification.user_id,
      type: "merchant_verified",
      title: "Business verified ✓",
      body: "Your business has been verified. You are now fully visible to talent on the platform.",
      link: `/dashboard/merchant/profile`,
    });
  }

  ADMIN_PATHS.forEach((p) => revalidatePath(p));
  revalidatePath(`/dashboard/admin/verifications/${verificationId}`);
  revalidatePath("/dashboard/participant/profile");
}

/**
 * Backfill profile photo from the participant's latest approved verification selfie.
 * Use when a participant was verified before selfie-as-profile was deployed, or when promotion failed.
 */
export async function backfillProfilePhotoFromVerification(userId: string): Promise<{ ok: boolean; error?: string }> {
  const { supabase } = await requireAdmin();

  const { data: verification } = await supabase
    .from("verifications")
    .select("id, selfie_url")
    .eq("user_id", userId)
    .eq("type", "participant_id")
    .eq("status", "approved")
    .not("selfie_url", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!verification?.selfie_url) {
    return { ok: false, error: "No approved verification with selfie found for this user." };
  }

  const avatarUrl = await promoteSelfieToProfilePhoto(verification.selfie_url, userId);
  if (!avatarUrl) {
    return { ok: false, error: "Could not copy selfie to profile photo. Check server logs." };
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from("participant_profiles")
    .update({
      photo_url: avatarUrl,
      photo_source: "verification_selfie",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (error) {
    return { ok: false, error: error.message };
  }

  await logAdminAction(supabase, "PROMOTE_SELFIE_TO_PROFILE_PHOTO", "participant_profiles", userId, "backfill");
  revalidatePath("/dashboard/participant/profile");
  revalidatePath(`/dashboard/admin/users/${userId}`);
  ADMIN_PATHS.forEach((p) => revalidatePath(p));
  return { ok: true };
}

export async function rejectVerification(verificationId: string, reason?: string) {
  const { current, supabase } = await requireAdmin();

  const { data: verification } = await supabase
    .from("verifications")
    .select("id, user_id, type")
    .eq("id", verificationId)
    .single();
  if (!verification) throw new AuthError("Verification not found.");

  await supabase
    .from("verifications")
    .update({
      status: "rejected",
      reviewed_by: current.user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", verificationId);

  await logAdminAction(supabase, "reject_verification", "verifications", verificationId, reason ?? null);

  const { notifyVerificationRejected } = await import("@/lib/notifications");
  await notifyVerificationRejected(
    verification.user_id,
    verification.type === "merchant_officer" ? "merchant" : "participant"
  );

  ADMIN_PATHS.forEach((p) => revalidatePath(p));
  revalidatePath(`/dashboard/admin/verifications/${verificationId}`);
}

// ---------- Reports (disputes) ----------

export type ReportRow = {
  id: string;
  reporter_id: string;
  reported_id: string | null;
  gig_id: string | null;
  category: string | null;
  description: string | null;
  status: string;
  outcome_message: string | null;
  created_at: string;
};

export async function listReports(filters?: { status?: string }): Promise<ReportRow[]> {
  const { supabase } = await requireAdmin();
  let q = supabase
    .from("reports")
    .select("id, reporter_id, reported_id, gig_id, category, description, status, outcome_message, created_at")
    .order("created_at", { ascending: false });
  if (filters?.status) q = q.eq("status", filters.status);
  const { data } = await q;
  return (data ?? []) as ReportRow[];
}

export async function updateReportStatus(
  reportId: string,
  status: "pending" | "reviewed" | "resolved" | "dismissed",
  reason?: string,
  outcomeMessage?: string | null
) {
  const { supabase } = await requireAdmin();

  const { data: report } = await supabase
    .from("reports")
    .select("id")
    .eq("id", reportId)
    .single();
  if (!report) throw new AuthError("Report not found.");

  const update: { status: string; updated_at: string; outcome_message?: string | null } = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (status === "resolved" || status === "dismissed") {
    update.outcome_message = outcomeMessage?.trim() || null;
  }

  await supabase
    .from("reports")
    .update(update)
    .eq("id", reportId);

  await logAdminAction(supabase, `report_${status}`, "reports", reportId, reason ?? null);
  ADMIN_PATHS.forEach((p) => revalidatePath(p));
}

// ---------- Users (suspend / ban) ----------

export type ProfileRow = {
  id: string;
  role: string;
  status: string;
  created_at: string;
  display_name: string | null;
  name: string | null;
  email: string | null;
};

async function getAuthEmailsByUserId(): Promise<Map<string, string>> {
  const admin = createAdminClient();
  const map = new Map<string, string>();
  let page = 1;
  const perPage = 1000;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error || !data?.users?.length) break;
    for (const u of data.users) {
      if (u.email) map.set(u.id, u.email);
    }
    if (data.users.length < perPage) break;
    page += 1;
  }

  return map;
}

export async function listProfilesForAdmin(): Promise<ProfileRow[]> {
  const { supabase } = await requireAdmin();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, role, status, created_at")
    .order("created_at", { ascending: false });
  if (!profiles?.length) return [];

  const ids = profiles.map((p) => p.id);
  const [participantRes, merchantRes, emailByUserId] = await Promise.all([
    supabase.from("participant_profiles").select("user_id, full_name").in("user_id", ids),
    supabase
      .from("merchant_profiles")
      .select("user_id, officer_name, business_name")
      .in("user_id", ids),
    getAuthEmailsByUserId(),
  ]);
  const nameByUserId = new Map<string, string>();
  (participantRes.data ?? []).forEach((r: { user_id: string; full_name: string | null }) => {
    if (r.full_name?.trim()) nameByUserId.set(r.user_id, r.full_name.trim());
  });
  (merchantRes.data ?? []).forEach(
    (r: {
      user_id: string;
      officer_name: string | null;
      business_name: string | null;
    }) => {
      if (!nameByUserId.has(r.user_id)) {
        const name = r.officer_name?.trim() || r.business_name?.trim() || null;
        if (name) nameByUserId.set(r.user_id, name);
      }
    }
  );

  return profiles.map((p) => {
    const name = nameByUserId.get(p.id) ?? null;
    return {
      id: p.id,
      role: p.role,
      status: p.status,
      created_at: p.created_at,
      display_name: name,
      name,
      email: emailByUserId.get(p.id) ?? null,
    };
  });
}

export type UserDetailForAdmin = {
  profile: { id: string; role: string; status: string; created_at: string };
  participant: {
    full_name: string | null;
    photo_url: string | null;
    photo_source: string | null;
    photo_visibility: string | null;
    bio: string | null;
    location_general: string | null;
    rate: number | null;
    emergency_contact: string | null;
    verified: boolean;
    reputation_score: number;
    average_rating: number | null;
    total_ratings: number;
  } | null;
  merchant: {
    business_name: string | null;
    business_type: string | null;
    officer_name: string | null;
    verified: boolean;
  } | null;
  latestVerification: { id: string; type: string; status: string; created_at: string } | null;
  paymentDisclosureAcknowledgment: {
    document_type: string;
    version: number;
    accepted_at: string;
  } | null;
};

export async function getProfileDetailForAdmin(userId: string): Promise<UserDetailForAdmin | null> {
  const { supabase } = await requireAdmin();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, status, created_at")
    .eq("id", userId)
    .single();
  if (!profile) return null;

  const [participantRes, merchantRes, verificationRes, legalRes] = await Promise.all([
    supabase.from("participant_profiles").select("full_name, photo_url, photo_source, photo_visibility, bio, location_general, rate, emergency_contact, verified, reputation_score, average_rating, total_ratings").eq("user_id", userId).maybeSingle(),
    supabase.from("merchant_profiles").select("business_name, business_type, officer_name, verified").eq("user_id", userId).maybeSingle(),
    supabase.from("verifications").select("id, type, status, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("legal_acknowledgments").select("document_type, version, accepted_at").eq("user_id", userId).eq("document_type", "payment_disclosure_v1").order("accepted_at", { ascending: false }).limit(1).maybeSingle(),
  ]);

  const participant = participantRes.data
    ? {
        full_name: participantRes.data.full_name ?? null,
        photo_url: (participantRes.data as { photo_url?: string | null }).photo_url ?? null,
        photo_source: (participantRes.data as { photo_source?: string | null }).photo_source ?? null,
        photo_visibility: (participantRes.data as { photo_visibility?: string | null }).photo_visibility ?? null,
        bio: participantRes.data.bio ?? null,
        location_general: participantRes.data.location_general ?? null,
        rate: participantRes.data.rate ?? null,
        emergency_contact: participantRes.data.emergency_contact ?? null,
        verified: participantRes.data.verified ?? false,
        reputation_score: (participantRes.data as { reputation_score?: number }).reputation_score ?? 0,
        average_rating:
          (participantRes.data as { average_rating?: number | null }).average_rating != null
            ? Number((participantRes.data as { average_rating?: number | null }).average_rating)
            : null,
        total_ratings: (participantRes.data as { total_ratings?: number }).total_ratings ?? 0,
      }
    : null;
  const merchant = merchantRes.data
    ? {
        business_name: merchantRes.data.business_name ?? null,
        business_type: merchantRes.data.business_type ?? null,
        officer_name: merchantRes.data.officer_name ?? null,
        verified: merchantRes.data.verified ?? false,
      }
    : null;
  const verList = verificationRes.data;
  const first = Array.isArray(verList) ? verList[0] : verList;
  const latestVerification =
    first && typeof first === "object" && "id" in first
      ? { id: first.id, type: first.type, status: first.status, created_at: first.created_at }
      : null;

  const legalRow = legalRes.data;
  const paymentDisclosureAcknowledgment =
    legalRow && typeof legalRow === "object" && "accepted_at" in legalRow
      ? {
          document_type: legalRow.document_type,
          version: legalRow.version,
          accepted_at: legalRow.accepted_at,
        }
      : null;

  return {
    profile: { id: profile.id, role: profile.role, status: profile.status, created_at: profile.created_at },
    participant,
    merchant,
    latestVerification,
    paymentDisclosureAcknowledgment,
  };
}

export async function activateUser(formData: FormData) {
  const userId = formData.get("userId");
  if (typeof userId !== "string" || !userId) return;
  await setProfileStatus(userId, PROFILE_STATUS.ACTIVE);
  revalidatePath("/dashboard/admin/users");
}

export async function suspendUser(formData: FormData) {
  const userId = formData.get("userId");
  if (typeof userId !== "string" || !userId) return;
  await setProfileStatus(userId, PROFILE_STATUS.SUSPENDED);
  revalidatePath("/dashboard/admin/users");
}

export async function banUser(formData: FormData) {
  const userId = formData.get("userId");
  if (typeof userId !== "string" || !userId) return;
  await setProfileStatus(userId, PROFILE_STATUS.BANNED);
  revalidatePath("/dashboard/admin/users");
}

export async function setProfileStatus(
  userId: string,
  status: ProfileStatus,
  reason?: string
) {
  const { supabase } = await requireAdmin();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .single();
  if (!profile) throw new AuthError("User not found.");

  await supabase
    .from("profiles")
    .update({ status })
    .eq("id", userId);

  await logAdminAction(supabase, `set_status_${status}`, "profiles", userId, reason ?? null);
  ADMIN_PATHS.forEach((p) => revalidatePath(p));
  revalidatePath(`/dashboard/admin/users/${userId}`);
}

// ---------- Audit log ----------

export type AuditLogRow = {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  actor_id: string | null;
  payload: Record<string, unknown>;
  payload_summary: string;
  created_at: string;
};

export async function listAuditLog(limit = 100): Promise<AuditLogRow[]> {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("audit_log")
    .select("id, entity_type, entity_id, action, actor_id, payload, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  const rows = (data ?? []) as Omit<AuditLogRow, "payload_summary">[];
  if (!rows.length) return [];

  const gigIds = new Set<string>();
  const bookingIds = new Set<string>();

  for (const e of rows) {
    if (e.entity_type === "gig") gigIds.add(e.entity_id);
    if (e.entity_type === "booking") bookingIds.add(e.entity_id);
    const p = e.payload ?? {};
    if (typeof p.gig_id === "string") gigIds.add(p.gig_id);
    if (typeof p.booking_id === "string") bookingIds.add(p.booking_id);
  }

  const bookingGigIdById = new Map<string, string>();
  if (bookingIds.size > 0) {
    const { data: bookings } = await supabase
      .from("bookings")
      .select("id, gig_id")
      .in("id", [...bookingIds]);
    for (const b of bookings ?? []) {
      if (b.gig_id) {
        bookingGigIdById.set(b.id, b.gig_id);
        gigIds.add(b.gig_id);
      }
    }
  }

  const gigTitleById = new Map<string, string>();
  if (gigIds.size > 0) {
    const { data: gigs } = await supabase
      .from("gigs")
      .select("id, title")
      .in("id", [...gigIds]);
    for (const g of gigs ?? []) {
      if (g.title) gigTitleById.set(g.id, g.title);
    }
  }

  const ctx = { gigTitleById, bookingGigIdById };

  return rows.map((e) => ({
    ...e,
    payload: (e.payload ?? {}) as Record<string, unknown>,
    payload_summary: formatAuditPayloadSummary(
      e.entity_type,
      e.entity_id,
      e.action,
      e.payload as Record<string, unknown>,
      ctx
    ),
  }));
}

// ---------- Dummy: payment & transport (no real integration) ----------
// TODO: Replace payment_confirmed with real payment provider webhook when integrating.
// TODO: Replace transport_assigned with real transport/dispatch API when integrating.

export type BookingAdminRow = {
  id: string;
  gig_id: string;
  participant_user_id: string;
  status: string;
  payment_confirmed: boolean;
  transport_assigned: boolean;
  created_at: string;
  gigs?: { id: string; title: string } | null;
  gig_title: string | null;
  participant_name: string | null;
};

export async function listBookingsForAdmin(): Promise<BookingAdminRow[]> {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("bookings")
    .select("id, gig_id, participant_user_id, status, payment_confirmed, transport_assigned, created_at, gigs(id, title)")
    .order("created_at", { ascending: false });
  const rows = data ?? [];
  if (!rows.length) return [];

  const participantIds = [
    ...new Set(
      rows.map((r: { participant_user_id: string }) => r.participant_user_id)
    ),
  ];
  const { data: profiles } = await supabase
    .from("participant_profiles")
    .select("user_id, full_name")
    .in("user_id", participantIds);
  const nameByUserId = new Map<string, string>();
  (profiles ?? []).forEach((p: { user_id: string; full_name: string | null }) => {
    if (p.full_name?.trim()) nameByUserId.set(p.user_id, p.full_name.trim());
  });

  return rows.map((r: Record<string, unknown>) => {
    const gigs = r.gigs;
    const gig =
      gigs && !Array.isArray(gigs)
        ? gigs
        : Array.isArray(gigs) && gigs.length
          ? gigs[0]
          : null;
    const gigTitle =
      (gig as { title?: string } | null)?.title?.trim() ?? null;
    const participantUserId = r.participant_user_id as string;
    return {
      id: r.id,
      gig_id: r.gig_id,
      participant_user_id: participantUserId,
      status: r.status,
      payment_confirmed: r.payment_confirmed ?? false,
      transport_assigned: r.transport_assigned ?? false,
      created_at: r.created_at,
      gigs: gig as { id: string; title: string } | null,
      gig_title: gigTitle,
      participant_name: nameByUserId.get(participantUserId) ?? null,
    };
  }) as BookingAdminRow[];
}

/** Dummy: toggle payment confirmed. TODO: Replace with real payment provider webhook. */
export async function setPaymentConfirmed(bookingId: string, value: boolean) {
  const { supabase } = await requireAdmin();
  const { data: booking } = await supabase
    .from("bookings")
    .select("id")
    .eq("id", bookingId)
    .single();
  if (!booking) throw new AuthError("Booking not found.");
  await supabase.from("bookings").update({ payment_confirmed: value }).eq("id", bookingId);
  await logAdminAction(
    supabase,
    "set_payment_confirmed",
    "bookings",
    bookingId,
    value ? "confirmed" : "unconfirmed"
  );
  ADMIN_PATHS.forEach((p) => revalidatePath(p));
}

/** Dummy: toggle transport assigned. TODO: Replace with real transport assignment API in future phase. */
export async function setTransportAssigned(bookingId: string, value: boolean) {
  const { supabase } = await requireAdmin();
  const { data: booking } = await supabase
    .from("bookings")
    .select("id")
    .eq("id", bookingId)
    .single();
  if (!booking) throw new AuthError("Booking not found.");
  await supabase.from("bookings").update({ transport_assigned: value }).eq("id", bookingId);
  await logAdminAction(
    supabase,
    "set_transport_assigned",
    "bookings",
    bookingId,
    value ? "assigned" : "unassigned"
  );
  ADMIN_PATHS.forEach((p) => revalidatePath(p));
}
