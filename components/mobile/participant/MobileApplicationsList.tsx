"use client";

import Link from "next/link";
import {
  MapPin,
  CalendarCheck,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import MobileParticipantShell from "./MobileParticipantShell";
import EmptyState from "@/components/ui/EmptyState";
import type { ApplicationListItem } from "@/app/dashboard/participant/applications/ParticipantApplicationCard";
import {
  MOBILE_BODY_SIZE,
  MOBILE_HEADING_SIZE,
  MOBILE_LABEL_SIZE,
  mobileCardStyle,
} from "./mobileTokens";
import { FileText } from "lucide-react";

type GigSummary = {
  title: string;
  location_general: string | null;
  pay_rate: number | null;
  start_time: string | null;
};

function unwrapGig(gigs: ApplicationListItem["gigs"]): GigSummary | null {
  if (!gigs) return null;
  return Array.isArray(gigs) ? gigs[0] ?? null : gigs;
}

function statusStyles(status: string) {
  if (status === "accepted") {
    return { background: "var(--color-green-light)", color: "var(--color-green)", border: "var(--color-green-border)", accent: "var(--color-green)" };
  }
  if (status === "rejected") {
    return { background: "var(--color-danger-light)", color: "var(--color-danger)", border: "rgba(220,38,38,0.2)", accent: "var(--color-danger)" };
  }
  return { background: "var(--color-warning-light)", color: "var(--color-warning)", border: "rgba(217,119,6,0.3)", accent: "var(--color-gold)" };
}

export default function MobileApplicationsList({
  applications,
}: {
  applications: ApplicationListItem[];
}) {
  return (
    <MobileParticipantShell title="Applications">
      {applications.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No applications yet"
          description="Apply to gigs that match your skills and availability"
          action={{ label: "Browse gigs", href: "/dashboard/participant/gigs" }}
          variant="gold"
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {applications.map((application) => {
            const gig = unwrapGig(application.gigs);
            const styles = statusStyles(application.status);
            return (
              <Link
                key={application.id}
                href={`/dashboard/participant/gigs/${application.gig_id}`}
                style={{ textDecoration: "none", display: "block" }}
              >
                <article
                  style={{
                    ...mobileCardStyle,
                    borderLeft: `3px solid ${styles.accent}`,
                    padding: "18px 16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 12,
                      marginBottom: 8,
                    }}
                  >
                    <h2
                      style={{
                        margin: 0,
                        fontSize: MOBILE_HEADING_SIZE,
                        fontWeight: 600,
                        color: "var(--color-ink)",
                        flex: 1,
                      }}
                    >
                      {gig?.title ?? "Gig"}
                    </h2>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "6px 10px",
                        borderRadius: 20,
                        fontSize: MOBILE_LABEL_SIZE,
                        fontWeight: 600,
                        background: styles.background,
                        border: `0.5px solid ${styles.border}`,
                        color: styles.color,
                        flexShrink: 0,
                      }}
                    >
                      {application.status === "accepted" && <CheckCircle size={12} />}
                      {application.status === "rejected" && <XCircle size={12} />}
                      {application.status === "pending" && <Clock size={12} />}
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {gig?.location_general && (
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: MOBILE_BODY_SIZE, color: "var(--color-ink-muted)" }}>
                        <MapPin size={14} /> {gig.location_general}
                      </span>
                    )}
                    {gig?.start_time && (
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: MOBILE_BODY_SIZE, color: "var(--color-ink-muted)" }}>
                        <CalendarCheck size={14} />
                        {new Date(gig.start_time).toLocaleDateString("en-JM", { day: "numeric", month: "short" })}
                      </span>
                    )}
                    <span style={{ fontSize: MOBILE_LABEL_SIZE, color: "var(--color-ink-hint)" }}>
                      Applied{" "}
                      {new Date(application.created_at).toLocaleDateString("en-JM", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      )}
    </MobileParticipantShell>
  );
}
