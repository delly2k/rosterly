"use client";

import Link from "next/link";
import {
  MapPin,
  DollarSign,
  CalendarCheck,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
} from "lucide-react";

type GigSummary = {
  title: string;
  location_general: string | null;
  pay_rate: number | null;
  start_time: string | null;
};

export type ApplicationListItem = {
  id: string;
  status: string;
  created_at: string;
  gig_id: string;
  gigs: GigSummary | GigSummary[] | null;
};

function unwrapGig(gigs: ApplicationListItem["gigs"]): GigSummary | null {
  if (!gigs) return null;
  return Array.isArray(gigs) ? gigs[0] ?? null : gigs;
}

function statusStyles(status: string) {
  if (status === "accepted") {
    return {
      background: "var(--color-green-light)",
      color: "var(--color-green)",
      border: "var(--color-green-border)",
      accent: "var(--color-green)",
    };
  }
  if (status === "rejected") {
    return {
      background: "var(--color-danger-light)",
      color: "var(--color-danger)",
      border: "rgba(220,38,38,0.2)",
      accent: "var(--color-danger)",
    };
  }
  return {
    background: "var(--color-warning-light)",
    color: "var(--color-warning)",
    border: "rgba(217,119,6,0.3)",
    accent: "var(--color-gold)",
  };
}

export function ParticipantApplicationCard({
  application,
}: {
  application: ApplicationListItem;
}) {
  const gig = unwrapGig(application.gigs);
  const styles = statusStyles(application.status);

  return (
    <Link
      href={`/dashboard/participant/gigs/${application.gig_id}`}
      style={{ textDecoration: "none", display: "block" }}
    >
      <div
        style={{
          background: "white",
          border: "0.5px solid var(--color-border)",
          borderLeft: `3px solid ${styles.accent}`,
          borderRadius: "12px",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          transition: "box-shadow 0.15s ease",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "var(--color-ink)",
              marginBottom: 6,
            }}
          >
            {gig?.title ?? "Gig"}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            {gig?.location_general && (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                  color: "var(--color-ink-muted)",
                }}
              >
                <MapPin size={12} /> {gig.location_general}
              </span>
            )}
            {gig?.pay_rate != null && (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--color-ink)",
                }}
              >
                <DollarSign size={12} color="var(--color-gold)" />
                J${Number(gig.pay_rate).toLocaleString()}/hr
              </span>
            )}
            {gig?.start_time && (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                  color: "var(--color-ink-muted)",
                }}
              >
                <CalendarCheck size={12} />
                {new Date(gig.start_time).toLocaleDateString("en-JM", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            )}
            <span style={{ fontSize: 12, color: "var(--color-ink-hint)" }}>
              Applied{" "}
              {new Date(application.created_at).toLocaleDateString("en-JM", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "5px 14px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 500,
              background: styles.background,
              border: `0.5px solid ${styles.border}`,
              color: styles.color,
            }}
          >
            {application.status === "accepted" && <CheckCircle size={11} />}
            {application.status === "rejected" && <XCircle size={11} />}
            {application.status === "pending" && <Clock size={11} />}
            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
          </span>
          <ArrowRight size={14} color="var(--color-ink-hint)" />
        </div>
      </div>
    </Link>
  );
}
