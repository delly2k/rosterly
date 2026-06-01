import { requireRole, createClient } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { ParticipantInvitationsPageView } from "./ParticipantInvitationsPageView";

type GigEmbed = {
  id: string;
  title: string;
  location_general: string | null;
  pay_rate: number | null;
  start_time: string | null;
  end_time: string | null;
  duties: unknown;
};

type InvitationRow = {
  id: string;
  status: string;
  message: string | null;
  match_score: number | null;
  created_at: string;
  merchant_user_id: string;
  gigs: GigEmbed | GigEmbed[] | null;
};

export default async function InvitationsPage() {
  await requireRole(ROLES.PARTICIPANT);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: invitationsRaw } = await supabase
    .from("gig_invitations")
    .select(
      `
      id, status, message, match_score, created_at, merchant_user_id,
      gigs (
        id, title, location_general, pay_rate, start_time, end_time, duties
      )
    `
    )
    .eq("participant_user_id", user.id)
    .order("created_at", { ascending: false });

  const invitations = (invitationsRaw ?? []) as InvitationRow[];

  const merchantIds = [
    ...new Set(invitations.map((i) => i.merchant_user_id).filter(Boolean)),
  ];
  const { data: merchants } =
    merchantIds.length > 0
      ? await supabase
          .from("merchant_profiles")
          .select("user_id, business_name")
          .in("user_id", merchantIds)
      : { data: [] };

  const businessByMerchant: Record<string, string> = {};
  for (const m of merchants ?? []) {
    businessByMerchant[m.user_id] = m.business_name?.trim() || "Unknown merchant";
  }

  return (
    <ParticipantInvitationsPageView
      invitations={invitations}
      businessByMerchant={businessByMerchant}
    />
  );
}
