import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { listOpenGigs } from "@/app/dashboard/participant/gigs/actions";
import { ParticipantGigsPageView } from "./ParticipantGigsPageView";

export default async function ParticipantGigsPage() {
  await requireRole(ROLES.PARTICIPANT);
  const gigs = await listOpenGigs();

  return <ParticipantGigsPageView gigs={gigs} />;
}
