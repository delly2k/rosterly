"use client";

import { useMediaQuery } from "@/hooks/useMediaQuery";
import MobileApplicationsList from "@/components/mobile/participant/MobileApplicationsList";
import { PageHeader } from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import {
  ParticipantApplicationCard,
  type ApplicationListItem,
} from "./ParticipantApplicationCard";
import { FileText } from "lucide-react";

export function ParticipantApplicationsPageView({
  applications,
}: {
  applications: ApplicationListItem[];
}) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (isMobile) {
    return <MobileApplicationsList applications={applications} />;
  }

  return (
    <div className="page-bg space-y-6 sm:space-y-8">
      <PageHeader
        icon={FileText}
        title="Applications"
        description="Track your pending and past applications"
      />

      {applications.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No applications yet"
          description="Apply to gigs that match your skills and availability"
          action={{ label: "Browse gigs", href: "/dashboard/participant/gigs" }}
          variant="gold"
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {applications.map((application) => (
            <ParticipantApplicationCard key={application.id} application={application} />
          ))}
        </div>
      )}
    </div>
  );
}
