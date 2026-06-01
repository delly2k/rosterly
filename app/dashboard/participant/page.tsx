import { requireRole, createClient } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { getParticipantDashboardData } from "@/app/dashboard/participant/actions";
import { getPendingInvitationCount } from "@/lib/invitations";
import { SosButton } from "./SosButton";
import { ParticipantDashboardPageView } from "./ParticipantDashboardPageView";

export default async function ParticipantDashboardPage() {
  await requireRole(ROLES.PARTICIPANT);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [data, pendingInvitations, profile] = await Promise.all([
    getParticipantDashboardData(),
    getPendingInvitationCount(user.id),
    supabase
      .from("participant_profiles")
      .select("full_name")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (!data) return null;

  return (
    <ParticipantDashboardPageView
      data={data}
      participantName={profile.data?.full_name ?? null}
      pendingInvitations={pendingInvitations}
      sosButton={
        <SosButton
          gigTitle={
            data.nextConfirmedGig?.gigTitle ??
            data.upcomingBookings[0]?.gigTitle
          }
          gigAddress={data.upcomingBookings[0]?.locationGeneral ?? undefined}
        />
      }
    />
  );
}
