import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { getGigTeamPreview } from "@/app/dashboard/participant/bookings/actions";
import {
  getGigForParticipant,
  getMyApplicationForGig,
} from "@/app/dashboard/participant/gigs/actions";
import { TeamPreviewCard } from "@/components/team/TeamPreviewCard";
import { ApplyButton } from "./ApplyButton";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default async function ParticipantGigDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(ROLES.PARTICIPANT);
  const { id } = await params;
  const gig = await getGigForParticipant(id);
  if (!gig) notFound();

  const myApplication = await getMyApplicationForGig(id);
  const duties = Array.isArray(gig.duties) ? gig.duties : [];

  const gigUpcomingOrActive =
    !gig.end_time || new Date(gig.end_time) > new Date();
  const teamPreview =
    gigUpcomingOrActive ? await getGigTeamPreview(id) : [];
  const currentUser = await getCurrentUser();

  return (
    <div className="space-y-6 sm:space-y-8">
      <Link
        href="/dashboard/participant/gigs"
        className="inline-flex min-h-[44px] items-center text-sm font-bold text-black underline underline-offset-2 hover:no-underline active:no-underline"
      >
        ← Back to gigs
      </Link>

      <Card className="bg-[#06B6D4] p-4 sm:p-6">
        <h1 className="page-title tracking-tight">{gig.title}</h1>
        <p className="mt-2 text-sm text-black/90">
          {gig.location_general || "No location"}
          {gig.pay_rate != null && ` · $${gig.pay_rate}/hr`}
        </p>
        <p className="mt-1 text-sm text-black/80">
          {"spots_filled" in gig ? gig.spots_filled : 0} of {gig.spots ?? 1} spots filled
        </p>
        {duties.length > 0 && (
          <ul className="mt-4 list-inside list-disc text-sm font-medium text-black">
            {duties.map((d: unknown, i: number) => (
              <li key={i}>{String(d)}</li>
            ))}
          </ul>
        )}
        {gig.start_time && (
          <p className="mt-4 text-sm text-black/80">
            Start: {new Date(gig.start_time).toLocaleString()}
            {gig.end_time &&
              ` · End: ${new Date(gig.end_time).toLocaleString()}`}
          </p>
        )}

        {gig.location_exact && (
          <div className="mt-4 rounded-[4px] border-[3px] border-black bg-[#84CC16] p-4 text-sm font-medium text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <strong>Exact address (you are booked):</strong> {gig.location_exact}
          </div>
        )}

        <div className="mt-6">
          {myApplication ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              <Badge
                variant={
                  myApplication.status === "pending"
                    ? "pending"
                    : myApplication.status === "accepted"
                      ? "success"
                      : "inactive"
                }
              >
                Your application: {myApplication.status}
              </Badge>
              <Link
                href={`/dashboard/participant/chats/start?gigId=${id}`}
                className="inline-flex min-h-[44px] items-center text-sm font-bold text-black underline underline-offset-2 hover:no-underline active:no-underline"
              >
                Message about this gig
              </Link>
              <Link
                href="/dashboard/participant/applications"
                className="inline-flex min-h-[44px] items-center text-sm font-bold text-black underline underline-offset-2 hover:no-underline active:no-underline"
              >
                View all applications
              </Link>
            </div>
          ) : (
            <ApplyButton gigId={id} />
          )}
        </div>
      </Card>

      {teamPreview.length > 0 && currentUser?.user?.id && (
        <TeamPreviewCard
          members={teamPreview}
          currentUserId={currentUser.user.id}
        />
      )}
    </div>
  );
}
