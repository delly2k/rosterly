"use client";

import Link from "next/link";
import { MapPin, Users, ArrowRight } from "lucide-react";

export type MerchantGigListItem = {
  id: string;
  title: string;
  status: string;
  location_general: string | null;
  pay_rate: number | null;
  spots: number;
  spots_filled?: number;
};

function statusPillStyle(status: string): {
  bg: string;
  border: string;
  color: string;
  dot?: string;
} {
  if (status === "open") {
    return {
      bg: "var(--color-green-light)",
      border: "var(--color-green-border)",
      color: "var(--color-green)",
      dot: "var(--color-green)",
    };
  }
  if (status === "filled" || status === "closed") {
    return {
      bg: "var(--color-gold-light)",
      border: "var(--color-gold-border)",
      color: "var(--color-gold)",
    };
  }
  if (status === "cancelled") {
    return {
      bg: "var(--color-danger-light)",
      border: "rgba(220,38,38,0.2)",
      color: "var(--color-danger)",
    };
  }
  return {
    bg: "#F4F3EF",
    border: "var(--color-border)",
    color: "var(--color-ink-muted)",
  };
}

function GigStatusPill({ status }: { status: string }) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  const s = statusPillStyle(status);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 500,
        background: s.bg,
        border: `0.5px solid ${s.border}`,
        color: s.color,
        flexShrink: 0,
      }}
    >
      {s.dot && (
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: s.dot,
          }}
          aria-hidden
        />
      )}
      {label}
    </span>
  );
}

export function MerchantGigCard({ gig }: { gig: MerchantGigListItem }) {
  const spots = gig.spots ?? 1;
  const filled = gig.spots_filled ?? 0;
  const accentBorder =
    gig.status === "open"
      ? "var(--color-gold)"
      : gig.status === "filled"
        ? "var(--color-gold-border)"
        : "var(--color-border)";

  return (
    <Link
      href={`/dashboard/merchant/gigs/${gig.id}`}
      style={{
        background: "white",
        border: "0.5px solid var(--color-border)",
        borderLeft: `3px solid ${accentBorder}`,
        borderRadius: 12,
        padding: "20px 24px",
        cursor: "pointer",
        transition: "box-shadow 0.15s ease, transform 0.15s ease",
        textDecoration: "none",
        display: "block",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(200,151,58,0.12)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 12,
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "var(--color-ink)",
              marginBottom: 8,
            }}
          >
            {gig.title}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <GigStatusPill status={gig.status} />
            {gig.location_general && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                  color: "var(--color-ink-muted)",
                }}
              >
                <MapPin size={12} /> {gig.location_general}
              </span>
            )}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
                color: "var(--color-ink-muted)",
              }}
            >
              <Users size={12} />
              {filled} of {spots} spots filled
            </span>
          </div>
        </div>

        {gig.pay_rate != null && (
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--color-gold)" }}>
              J${gig.pay_rate.toLocaleString()}
            </div>
            <div style={{ fontSize: 11, color: "var(--color-ink-muted)", marginTop: 2 }}>
              per hour
            </div>
          </div>
        )}
      </div>

      <div style={{ borderTop: "0.5px solid var(--color-border)", margin: "12px 0" }} />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "7px 16px",
            borderRadius: 8,
            background: "var(--color-gold)",
            color: "white",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          Manage gig <ArrowRight size={12} />
        </span>
      </div>
    </Link>
  );
}
