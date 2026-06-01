import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import {
  getParticipantProfile,
  isIdentityLocked,
} from "@/app/dashboard/participant/actions";
import { listMyBookings } from "@/app/dashboard/participant/bookings/actions";
import { isProfileComplete } from "@/lib/participant";
import { calculateCompletion } from "@/lib/participant-profile-completion";
import { ParticipantProfilePageView } from "./ParticipantProfilePageView";
import { getValidCertificatesForUser } from "@/lib/academy";
import { createClient } from "@/lib/auth";

export default async function ParticipantProfilePage() {
  await requireRole(ROLES.PARTICIPANT);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [profile, identityLocked, bookings, certifications] = await Promise.all([
    getParticipantProfile(),
    isIdentityLocked(),
    listMyBookings(),
    user ? getValidCertificatesForUser(user.id) : Promise.resolve([]),
  ]);
  const gigsCompleted = bookings.filter((b) => b.status === "completed").length;
  const nameEditable = !identityLocked || !isProfileComplete(profile);
  const { pct: completionPct, missing: missingFields } = calculateCompletion(profile);

  return (
    <ParticipantProfilePageView
      profile={profile}
      identityLocked={identityLocked}
      nameEditable={nameEditable}
      completionPct={completionPct}
      missingFields={missingFields}
      gigsCompleted={gigsCompleted}
      certifications={certifications}
    />
  );
}
