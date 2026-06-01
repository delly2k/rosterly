"use client";

import { LayoutDashboard } from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import MobileDashboard from "@/components/mobile/participant/MobileDashboard";
import { PageHeader } from "@/components/ui/PageHeader";
import { VerificationBanner } from "@/components/dashboard/VerificationBanner";
import type { ParticipantDashboardData } from "@/app/dashboard/participant/actions";
import { ParticipantDashboardClient } from "./ParticipantDashboardClient";

type Props = {
  data: ParticipantDashboardData;
  participantName: string | null;
  pendingInvitations: number;
  sosButton: React.ReactNode;
};

export function ParticipantDashboardPageView({
  data,
  participantName,
  pendingInvitations,
  sosButton,
}: Props) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (isMobile) {
    return (
      <MobileDashboard
        data={data}
        participantName={participantName}
        pendingInvitations={pendingInvitations}
        recentChats={data.recentChats}
        rejectedApplications={data.applicationCounts.rejected}
      />
    );
  }

  return (
    <div className="page-bg space-y-6 sm:space-y-8">
      <PageHeader
        icon={LayoutDashboard}
        title="Dashboard"
        description="Your gigs, bookings and activity"
      />

      {data.verificationStatus === "verified" && !data.profileComplete && (
        <VerificationBanner
          href="/dashboard/participant/profile"
          title="Complete your profile"
          subtitle="Add your name in Profile for a full account"
          ctaLabel="Go to Profile →"
        />
      )}

      <ParticipantDashboardClient data={data} sosButton={sosButton} />
    </div>
  );
}
