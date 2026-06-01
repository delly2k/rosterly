"use client";

import Link from "next/link";
import {
  MapPin,
  DollarSign,
  CalendarCheck,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  ArrowRight,
} from "lucide-react";

type GigSummary = {
  title: string;
  location_general: string | null;
  pay_rate: number | null;
  start_time: string | null;
  end_time: string | null;
};

export type BookingListItem = {
  id: string;
  status: string;
  accepted_at: string | null;
  created_at: string;
  gigs: GigSummary | GigSummary[] | null;
};

function unwrapGig(gigs: BookingListItem["gigs"]): GigSummary | null {
  if (!gigs) return null;
  return Array.isArray(gigs) ? gigs[0] ?? null : gigs;
}

function borderAccent(status: string) {
  if (status === "completed") return "var(--color-gold)";
  if (status === "confirmed") return "var(--color-green)";
  if (status === "cancelled") return "var(--color-danger)";
  return "#C8973A";
}

function statusStyles(status: string) {
  if (status === "confirmed") {
    return {
      background: "var(--color-green-light)",
      color: "var(--color-green)",
      border: "var(--color-green-border)",
    };
  }
  if (status === "completed") {
    return {
      background: "var(--color-gold-light)",
      color: "var(--color-gold)",
      border: "var(--color-gold-border)",
    };
  }
  if (status === "cancelled") {
    return {
      background: "var(--color-danger-light)",
      color: "var(--color-danger)",
      border: "rgba(220,38,38,0.2)",
    };
  }
  return {
    background: "var(--color-warning-light)",
    color: "var(--color-warning)",
    border: "rgba(217,119,6,0.3)",
  };
}

function statusLabel(status: string) {
  if (status === "confirmed") return "Accepted";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function ParticipantBookingCard({ booking }: { booking: BookingListItem }) {
  const gig = unwrapGig(booking.gigs);
  const styles = statusStyles(booking.status);

  return (
    <Link
      href={`/dashboard/participant/bookings/${booking.id}`}
      style={{ textDecoration: "none", display: "block" }}
    >
      <div
        style={{
          background: "white",
          border: "0.5px solid var(--color-border)",
          borderLeft: `3px solid ${borderAccent(booking.status)}`,
          borderRadius: "12px",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          cursor: "pointer",
          transition: "box-shadow 0.15s ease",
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
                {" · "}
                {new Date(gig.start_time).toLocaleTimeString("en-JM", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
          {booking.status === "pending" && (
            <div
              style={{
                marginTop: 8,
                fontSize: 12,
                color: "var(--color-warning)",
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontWeight: 500,
              }}
            >
              <Clock size={11} /> Action required — accept or decline this booking
            </div>
          )}
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
            {booking.status === "confirmed" && <CheckCircle size={11} />}
            {booking.status === "completed" && <Star size={11} />}
            {booking.status === "cancelled" && <XCircle size={11} />}
            {booking.status === "pending" && <Clock size={11} />}
            {statusLabel(booking.status)}
          </span>
          <ArrowRight size={14} color="var(--color-ink-hint)" />
        </div>
      </div>
    </Link>
  );
}
