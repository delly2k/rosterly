"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient, getCurrentUser } from "@/lib/auth";
import { AuthError } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import type { ProfileStatus } from "@/lib/roles";
import { promoteSelfieToProfilePhoto } from "@/lib/promote-selfie-to-avatar";
import { VERIFICATION_DOCS_BUCKET } from "@/lib/storage";

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
};

/** List verifications that need review: pending and rejected (rejected can be approved later). */
export async function listPendingVerifications(): Promise<VerificationRow[]> {
  const { supabase } = await requireAdmin();
  const { data: rows } = await supabase
    .from("verifications")
    .select("id, user_id, type, status, created_at, reviewed_at")
    .in("status", ["pending", "rejected"])
    .order("created_at", { ascending: false });
  if (!rows?.length) return [];

  const participantIds = rows.filter((r) => r.type === "participant_id").map((r) => r.user_id);
  const merchantIds = rows.filter((r) => r.type === "merchant_officer").map((r) => r.user_id);
  const nameByUserId = new Map<string, string>();

  if (participantIds.length > 0) {
    const { data: participants } = await supabase
      .from("participant_profiles")
      .select("user_id, full_name")
      .in("user_id", participantIds);
    (participants ?? []).forEach((r: { user_id: string; full_name: string | null }) => {
      if (r.full_name?.trim()) nameByUserId.set(r.user_id, r.full_name.trim());
    });
  }
  if (merchantIds.length > 0) {
    const { data: merchants } = await supabase
      .from("merchant_profiles")
      .select("user_id, officer_name, business_name")
      .in("user_id", merchantIds);
    (merchants ?? []).forEach((r: { user_id: string; officer_name: string | null; business_name: string | null }) => {
      const name = r.officer_name?.trim() || r.business_name?.trim() || null;
      if (name) nameByUserId.set(r.user_id, name);
    });
  }

  return rows.map((r) => ({
    ...r,
    display_name: nameByUserId.get(r.user_id) ?? null,
  })) as VerificationRow[];
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
};

/** Fetch one verification with signed URLs for ID and selfie (admin only). */
export async function getVerificationDetail(
  verificationId: string
): Promise<VerificationDetail | null> {
  const { supabase } = await requireAdmin();
  const { data: verification } = await supabase
    .from("verifications")
    .select("id, user_id, type, status, id_doc_url, selfie_url, created_at")
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
    .select("id")
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
};

export async function listProfilesForAdmin(): Promise<ProfileRow[]> {
  const { supabase } = await requireAdmin();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, role, status, created_at")
    .order("created_at", { ascending: false });
  if (!profiles?.length) return [];

  const ids = profiles.map((p) => p.id);
  const [participantRes, merchantRes] = await Promise.all([
    supabase.from("participant_profiles").select("user_id, full_name").in("user_id", ids),
    supabase.from("merchant_profiles").select("user_id, officer_name, business_name").in("user_id", ids),
  ]);
  const nameByUserId = new Map<string, string>();
  (participantRes.data ?? []).forEach((r: { user_id: string; full_name: string | null }) => {
    if (r.full_name?.trim()) nameByUserId.set(r.user_id, r.full_name.trim());
  });
  (merchantRes.data ?? []).forEach((r: { user_id: string; officer_name: string | null; business_name: string | null }) => {
    if (!nameByUserId.has(r.user_id)) {
      const name = r.officer_name?.trim() || r.business_name?.trim() || null;
      if (name) nameByUserId.set(r.user_id, name);
    }
  });

  return profiles.map((p) => ({
    id: p.id,
    role: p.role,
    status: p.status,
    created_at: p.created_at,
    display_name: nameByUserId.get(p.id) ?? null,
  })) as ProfileRow[];
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
    supabase.from("participant_profiles").select("full_name, photo_url, photo_source, photo_visibility, bio, location_general, rate, emergency_contact, verified").eq("user_id", userId).maybeSingle(),
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
  created_at: string;
};

export async function listAuditLog(limit = 100): Promise<AuditLogRow[]> {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("audit_log")
    .select("id, entity_type, entity_id, action, actor_id, payload, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as AuditLogRow[];
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
};

export async function listBookingsForAdmin(): Promise<BookingAdminRow[]> {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("bookings")
    .select("id, gig_id, participant_user_id, status, payment_confirmed, transport_assigned, created_at, gigs(id, title)")
    .order("created_at", { ascending: false });
  const rows = data ?? [];
  return rows.map((r: Record<string, unknown>) => {
    const gigs = r.gigs;
    const gig = gigs && !Array.isArray(gigs) ? gigs : Array.isArray(gigs) && gigs.length ? gigs[0] : null;
    return {
      id: r.id,
      gig_id: r.gig_id,
      participant_user_id: r.participant_user_id,
      status: r.status,
      payment_confirmed: r.payment_confirmed ?? false,
      transport_assigned: r.transport_assigned ?? false,
      created_at: r.created_at,
      gigs: gig,
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
