import { requireRole, createClient } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { ParticipantApplicationsPageView } from "./ParticipantApplicationsPageView";
import type { ApplicationListItem } from "./ParticipantApplicationCard";

export default async function ParticipantApplicationsPage() {
  await requireRole(ROLES.PARTICIPANT);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: applications } = await supabase
    .from("applications")
    .select(
      `
      id,
      status,
      created_at,
      gig_id,
      gigs (
        title,
        location_general,
        pay_rate,
        start_time
      )
    `
    )
    .eq("participant_user_id", user.id)
    .order("created_at", { ascending: false });

  const items = (applications ?? []) as ApplicationListItem[];

  return <ParticipantApplicationsPageView applications={items} />;
}
