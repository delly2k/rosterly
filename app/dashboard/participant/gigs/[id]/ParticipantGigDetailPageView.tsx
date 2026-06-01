"use client";

import { useMediaQuery } from "@/hooks/useMediaQuery";
import MobileGigDetail from "@/components/mobile/participant/MobileGigDetail";
import Link from "next/link";
import { ParticipantGigHero } from "./ParticipantGigHero";
import { TeamPreviewCard } from "@/components/team/TeamPreviewCard";
import type { TeamPreviewMember } from "@/app/dashboard/participant/bookings/actions";

type GigData = Parameters<typeof ParticipantGigHero>[0]["gig"];

export function ParticipantGigDetailPageView({
  gig,
  application,
  booking,
  filledSpots,
  teamPreview,
  currentUserId,
}: {
  gig: GigData;
  application: { id: string; status: string } | null;
  booking: { id: string; status: string } | null;
  filledSpots: number;
  teamPreview: TeamPreviewMember[];
  currentUserId: string | undefined;
}) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (isMobile) {
    return (
      <MobileGigDetail
        gig={gig}
        application={application}
        booking={booking}
        filledSpots={filledSpots}
        teamPreview={teamPreview}
        currentUserId={currentUserId ?? ""}
      />
    );
  }

  return (
    <div className="page-bg space-y-6 sm:space-y-8" style={{ padding: "32px 40px" }}>
      <Link
        href="/dashboard/participant/gigs"
        className="inline-flex min-h-[44px] items-center text-sm font-bold text-[var(--color-ink)] underline underline-offset-2 hover:no-underline active:no-underline"
      >
        ← Back to gigs
      </Link>

      <ParticipantGigHero
        gig={gig}
        application={application}
        booking={booking}
        filledSpots={filledSpots}
      />

      {teamPreview.length > 0 && currentUserId && (
        <TeamPreviewCard members={teamPreview} currentUserId={currentUserId} />
      )}
    </div>
  );
}
