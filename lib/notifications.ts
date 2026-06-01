import { createClient, createAdminClient } from "@/lib/auth";

export type NotificationType =
  // Participant
  | "booking_offer"
  | "booking_confirmed"
  | "booking_cancelled"
  | "gig_invitation"
  | "application_rejected"
  | "verification_approved"
  | "verification_rejected"
  | "gig_starting_soon"
  | "rating_received"
  | "new_gig_match"
  // Merchant
  | "new_application"
  | "participant_accepted"
  | "participant_declined"
  | "participant_checked_in"
  | "merchant_verified"
  | "plan_limit_reached"
  | "merchant_rating_received"
  // Admin
  | "verification_submitted"
  | "report_filed"
  | "sos_triggered";

type NotificationPayload = {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link: string;
};

/** Legacy grouped keys saved in notification_settings before per-type keys. */
const NOTIFICATION_PREF_ALIASES: Partial<Record<NotificationType, string[]>> = {
  new_gig_match: ["new_gig_matches"],
  application_rejected: ["application_updates"],
  gig_invitation: ["application_updates"],
  booking_offer: ["booking_reminders"],
  booking_confirmed: ["booking_reminders"],
  booking_cancelled: ["booking_reminders"],
  new_application: ["new_applicants"],
  participant_accepted: ["booking_confirmations"],
  participant_declined: ["booking_confirmations"],
  participant_checked_in: ["event_reminders"],
  merchant_verified: ["reports_issues"],
  plan_limit_reached: ["reports_issues"],
  merchant_rating_received: ["reports_issues"],
};

function isNotificationTypeEnabled(
  prefs: Record<string, boolean> | null,
  type: NotificationType
): boolean {
  if (!prefs) return true;
  if (prefs[type] === false) return false;
  const aliases = NOTIFICATION_PREF_ALIASES[type];
  if (aliases?.some((key) => prefs[key] === false)) return false;
  return true;
}

export async function createNotification(payload: NotificationPayload) {
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("notification_settings")
    .eq("id", payload.userId)
    .single();

  const prefs = profile?.notification_settings as Record<string, boolean> | null;
  if (!isNotificationTypeEnabled(prefs, payload.type)) {
    return;
  }

  const { error } = await supabase.from("notifications").insert({
    user_id: payload.userId,
    type: payload.type,
    title: payload.title,
    body: payload.body,
    link: payload.link,
  });
  if (error) console.error("Notification error:", error);
}

export async function notifyBookingOffer(
  participantId: string,
  gigTitle: string,
  bookingId: string
) {
  await createNotification({
    userId: participantId,
    type: "booking_offer",
    title: "New booking offer",
    body: `You have been booked for "${gigTitle}". Accept or decline.`,
    link: `/dashboard/participant/bookings/${bookingId}`,
  });
}

export async function notifyBookingConfirmed(
  merchantId: string,
  participantName: string,
  gigId: string
) {
  await createNotification({
    userId: merchantId,
    type: "participant_accepted",
    title: "Booking confirmed",
    body: `${participantName} confirmed their booking for your gig.`,
    link: `/dashboard/merchant/gigs/${gigId}`,
  });
}

export async function notifyBookingDeclined(
  merchantId: string,
  participantName: string,
  gigId: string
) {
  await createNotification({
    userId: merchantId,
    type: "participant_declined",
    title: "Booking declined",
    body: `${participantName} declined their booking. The spot is now open.`,
    link: `/dashboard/merchant/gigs/${gigId}`,
  });
}

export async function notifyNewApplication(
  merchantId: string,
  participantName: string,
  gigTitle: string,
  gigId: string
) {
  await createNotification({
    userId: merchantId,
    type: "new_application",
    title: "New application",
    body: `${participantName} applied for "${gigTitle}".`,
    link: `/dashboard/merchant/gigs/${gigId}`,
  });
}

export async function notifyApplicationRejected(
  participantId: string,
  gigTitle: string
) {
  await createNotification({
    userId: participantId,
    type: "application_rejected",
    title: "Application not selected",
    body: `Your application for "${gigTitle}" was not selected this time.`,
    link: `/dashboard/participant/applications`,
  });
}

export async function notifyVerificationApproved(
  userId: string,
  role: "participant" | "merchant"
) {
  await createNotification({
    userId,
    type: "verification_approved",
    title: "Verification approved ✓",
    body: "Your identity has been verified. You are now fully visible on the platform.",
    link:
      role === "participant"
        ? `/dashboard/participant/profile`
        : `/dashboard/merchant/profile`,
  });
}

export async function notifyVerificationRejected(
  userId: string,
  role: "participant" | "merchant"
) {
  await createNotification({
    userId,
    type: "verification_rejected",
    title: "Verification needs attention",
    body: "Your verification was not approved. Please resubmit with clearer documents.",
    link:
      role === "participant"
        ? `/dashboard/participant/verification`
        : `/dashboard/merchant/verification`,
  });
}

export async function notifyGigInvitation(
  participantId: string,
  businessName: string,
  gigTitle: string
) {
  await createNotification({
    userId: participantId,
    type: "gig_invitation",
    title: "Gig invitation",
    body: `${businessName} invited you to "${gigTitle}".`,
    link: `/dashboard/participant/invitations`,
  });
}

export async function notifyParticipantCheckedIn(
  merchantId: string,
  participantName: string,
  gigTitle: string,
  gigId: string
) {
  await createNotification({
    userId: merchantId,
    type: "participant_checked_in",
    title: "Participant checked in",
    body: `${participantName} has checked in for "${gigTitle}".`,
    link: `/dashboard/merchant/gigs/${gigId}`,
  });
}

export async function notifyRatingReceived(
  userId: string,
  role: "participant" | "merchant",
  fromName: string
) {
  await createNotification({
    userId,
    type: role === "participant" ? "rating_received" : "merchant_rating_received",
    title: "New review received",
    body: `${fromName} left you a review.`,
    link:
      role === "participant"
        ? `/dashboard/participant/profile`
        : `/dashboard/merchant/profile`,
  });
}

export async function notifyPlanLimitReached(merchantId: string) {
  await createNotification({
    userId: merchantId,
    type: "plan_limit_reached",
    title: "Gig limit reached",
    body: "You have reached your plan limit. Upgrade to post more gigs.",
    link: `/dashboard/settings/billing`,
  });
}

export async function notifyAdminsVerificationSubmitted(
  adminIds: string[],
  submitterName: string,
  verificationId: string
) {
  for (const adminId of adminIds) {
    await createNotification({
      userId: adminId,
      type: "verification_submitted",
      title: "Verification submitted",
      body: `${submitterName} submitted documents for verification.`,
      link: `/dashboard/admin/verifications/${verificationId}`,
    });
  }
}

export async function notifyAdminsReportFiled(
  adminIds: string[],
  reportId: string,
  category: string
) {
  for (const adminId of adminIds) {
    await createNotification({
      userId: adminId,
      type: "report_filed",
      title: "New report filed",
      body: `A ${category} report has been submitted and needs review.`,
      link: `/dashboard/admin/reports`,
    });
  }
}

export async function getAdminUserIds(): Promise<string[]> {
  const supabase = await createClient();
  const { data: admins } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin");
  return admins?.map((a) => a.id) ?? [];
}
