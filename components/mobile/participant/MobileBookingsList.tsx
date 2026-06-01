"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  CalendarCheck,
  CheckCircle,
  XCircle,
  Clock,
  Star,
} from "lucide-react";
import MobileParticipantShell from "./MobileParticipantShell";
import EmptyState from "@/components/ui/EmptyState";
import type { BookingListItem } from "@/app/dashboard/participant/bookings/ParticipantBookingCard";
import {
  MOBILE_BODY_SIZE,
  MOBILE_HEADING_SIZE,
  MOBILE_LABEL_SIZE,
  mobileCardStyle,
} from "./mobileTokens";

type GigSummary = {
  title: string;
  location_general: string | null;
  pay_rate: number | null;
  start_time: string | null;
};

function unwrapGig(gigs: BookingListItem["gigs"]): GigSummary | null {
  if (!gigs) return null;
  return Array.isArray(gigs) ? gigs[0] ?? null : gigs;
}

function borderAccent(status: string) {
  if (status === "completed") return "var(--color-gold)";
  if (status === "confirmed") return "var(--color-green)";
  if (status === "cancelled") return "var(--color-danger)";
  return "var(--color-gold)";
}

function statusStyles(status: string) {
  if (status === "confirmed") {
    return { background: "var(--color-green-light)", color: "var(--color-green)", border: "var(--color-green-border)" };
  }
  if (status === "completed") {
    return { background: "var(--color-gold-light)", color: "var(--color-gold)", border: "var(--color-gold-border)" };
  }
  if (status === "cancelled") {
    return { background: "var(--color-danger-light)", color: "var(--color-danger)", border: "rgba(220,38,38,0.2)" };
  }
  return { background: "var(--color-warning-light)", color: "var(--color-warning)", border: "rgba(217,119,6,0.3)" };
}

function statusLabel(status: string) {
  if (status === "confirmed") return "Accepted";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

type FilterKey = "all" | "pending" | "accepted" | "completed";

function matchesFilter(status: string, filter: FilterKey): boolean {
  if (filter === "all") return true;
  if (filter === "accepted") return status === "confirmed";
  return status === filter;
}

export default function MobileBookingsList({ bookings }: { bookings: BookingListItem[] }) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const filtered = bookings.filter((b) => matchesFilter(b.status, filter));

  return (
    <MobileParticipantShell title="Bookings">
      <div
        style={{
          display: "flex",
          gap: 6,
          margin: "-4px 0 12px",
          padding: "10px 0",
          overflowX: "auto",
        }}
      >
        {(["all", "pending", "accepted", "completed"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 500,
              border: "none",
              cursor: "pointer",
              whiteSpace: "nowrap",
              minHeight: 36,
              background: filter === f ? "var(--color-gold)" : "#F4F3EF",
              color: filter === f ? "white" : "var(--color-ink-muted)",
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No bookings yet"
          description="Once a merchant accepts your application you will see bookings here"
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((booking) => {
            const gig = unwrapGig(booking.gigs);
            const styles = statusStyles(booking.status);
            return (
              <Link
                key={booking.id}
                href={`/dashboard/participant/bookings/${booking.id}`}
                style={{ textDecoration: "none", display: "block" }}
              >
                <article
                  style={{
                    ...mobileCardStyle,
                    borderLeft: `3px solid ${borderAccent(booking.status)}`,
                    padding: "18px 16px",
                    minHeight: 48,
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
                        lineHeight: 1.3,
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
                      {booking.status === "confirmed" && <CheckCircle size={12} />}
                      {booking.status === "completed" && <Star size={12} />}
                      {booking.status === "cancelled" && <XCircle size={12} />}
                      {booking.status === "pending" && <Clock size={12} />}
                      {statusLabel(booking.status)}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {gig?.location_general && (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: MOBILE_BODY_SIZE,
                          color: "var(--color-ink-muted)",
                        }}
                      >
                        <MapPin size={14} /> {gig.location_general}
                      </span>
                    )}
                    {gig?.start_time && (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: MOBILE_BODY_SIZE,
                          color: "var(--color-ink-muted)",
                        }}
                      >
                        <CalendarCheck size={14} />
                        {new Date(gig.start_time).toLocaleDateString("en-JM", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                  {booking.status === "pending" && (
                    <p
                      style={{
                        margin: "10px 0 0",
                        fontSize: MOBILE_LABEL_SIZE,
                        fontWeight: 600,
                        color: "var(--color-warning)",
                      }}
                    >
                      Action required — tap to accept or decline
                    </p>
                  )}
                </article>
              </Link>
            );
          })}
        </div>
      )}
    </MobileParticipantShell>
  );
}
