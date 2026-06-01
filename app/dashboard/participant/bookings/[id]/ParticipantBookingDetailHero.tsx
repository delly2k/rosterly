"use client";

import AddressMap from "@/components/ui/AddressMap";
import { CheckinCheckoutSection } from "./CheckinCheckoutSection";
import { BookingPendingActions } from "./BookingPendingActions";
import { SafetyCheckIn } from "./SafetyCheckIn";
import { MapPin, DollarSign, Lock } from "lucide-react";

type GigDetail = {
  title: string;
  location_general: string | null;
  pay_rate: number | null;
  start_time: string | null;
  end_time: string | null;
  duties: unknown;
  gig_locations:
    | { location_exact: string | null }
    | { location_exact: string | null }[]
    | null;
};

type CheckinRow = {
  id: string;
  type: string;
  lat: number | null;
  lon: number | null;
  created_at: string;
};

function unwrapGigLocations(
  loc: GigDetail["gig_locations"]
): { location_exact: string | null } | null {
  if (!loc) return null;
  return Array.isArray(loc) ? loc[0] ?? null : loc;
}

function parseDuties(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((d): d is string => typeof d === "string" && d.trim().length > 0);
}

function bookingStatusStyles(status: string) {
  if (status === "confirmed") {
    return {
      background: "var(--color-green-light)",
      color: "var(--color-green)",
      border: "var(--color-green-border)",
      label: "Accepted",
    };
  }
  if (status === "completed") {
    return {
      background: "var(--color-gold-light)",
      color: "var(--color-gold)",
      border: "var(--color-gold-border)",
      label: "Completed",
    };
  }
  if (status === "cancelled") {
    return {
      background: "var(--color-danger-light)",
      color: "var(--color-danger)",
      border: "rgba(220,38,38,0.2)",
      label: "Cancelled",
    };
  }
  return {
    background: "var(--color-warning-light)",
    color: "var(--color-warning)",
    border: "rgba(217,119,6,0.3)",
    label: status.charAt(0).toUpperCase() + status.slice(1),
  };
}

function formatRole(role: string | null | undefined) {
  if (!role || role === "participant") return "Brand Ambassador";
  if (role === "team_lead") return "Team Lead";
  return role.charAt(0).toUpperCase() + role.slice(1).replace(/_/g, " ");
}

export function ParticipantBookingDetailHero({
  bookingId,
  status,
  roleInGig,
  gig,
  checkins,
  acceptError,
}: {
  bookingId: string;
  status: string;
  roleInGig: string | null;
  gig: GigDetail;
  checkins: CheckinRow[];
  acceptError?: string | null;
}) {
  const duties = parseDuties(gig.duties);
  const locationExact = unwrapGigLocations(gig.gig_locations)?.location_exact ?? null;
  const canSeeAddress = status === "confirmed" || status === "completed";
  const statusStyle = bookingStatusStyles(status);

  return (
    <div
      style={{
        background: "white",
        border: "0.5px solid var(--color-border)",
        borderRadius: "12px",
        overflow: "hidden",
        marginBottom: "24px",
      }}
    >
      <div
        style={{
          height: 4,
          background: "linear-gradient(90deg, #C8973A 0%, #D4A843 50%, #A07828 100%)",
        }}
      />
      <div style={{ padding: "28px 32px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 16,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: "var(--color-ink)",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {gig.title}
            </h1>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginTop: 10,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "4px 12px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 500,
                  background: statusStyle.background,
                  border: `0.5px solid ${statusStyle.border}`,
                  color: statusStyle.color,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "currentColor",
                  }}
                />
                Booking: {statusStyle.label}
              </span>
              {gig.location_general && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 13,
                    color: "var(--color-ink-muted)",
                  }}
                >
                  <MapPin size={13} /> {gig.location_general}
                </span>
              )}
              {gig.pay_rate != null && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--color-ink)",
                  }}
                >
                  <DollarSign size={13} color="var(--color-gold)" />
                  J${Number(gig.pay_rate).toLocaleString()}/hr
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ borderTop: "0.5px solid var(--color-border)", margin: "20px 0" }} />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              background: "#FAFAF8",
              borderRadius: 8,
              border: "0.5px solid var(--color-border)",
              padding: "12px 16px",
            }}
          >
            <div
              style={{
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--color-ink-muted)",
                marginBottom: 4,
              }}
            >
              Start
            </div>
            {gig.start_time ? (
              <>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-ink)" }}>
                  {new Date(gig.start_time).toLocaleDateString("en-JM", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
                <div style={{ fontSize: 12, color: "var(--color-ink-muted)" }}>
                  {new Date(gig.start_time).toLocaleTimeString("en-JM", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </>
            ) : (
              <div style={{ fontSize: 13, color: "var(--color-ink-muted)" }}>Not set</div>
            )}
          </div>

          <div
            style={{
              background: "#FAFAF8",
              borderRadius: 8,
              border: "0.5px solid var(--color-border)",
              padding: "12px 16px",
            }}
          >
            <div
              style={{
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--color-ink-muted)",
                marginBottom: 4,
              }}
            >
              End
            </div>
            {gig.end_time ? (
              <>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-ink)" }}>
                  {new Date(gig.end_time).toLocaleDateString("en-JM", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
                <div style={{ fontSize: 12, color: "var(--color-ink-muted)" }}>
                  {new Date(gig.end_time).toLocaleTimeString("en-JM", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </>
            ) : (
              <div style={{ fontSize: 13, color: "var(--color-ink-muted)" }}>Not set</div>
            )}
          </div>

          <div
            style={{
              background: "#FAFAF8",
              borderRadius: 8,
              border: "0.5px solid var(--color-border)",
              padding: "12px 16px",
            }}
          >
            <div
              style={{
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--color-ink-muted)",
                marginBottom: 4,
              }}
            >
              Role
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-ink)" }}>
              {formatRole(roleInGig)}
            </div>
          </div>

          <div
            style={{
              background: canSeeAddress ? "#FAFAF8" : "var(--color-gold-light)",
              borderRadius: 8,
              border: `0.5px solid ${canSeeAddress ? "var(--color-border)" : "var(--color-gold-border)"}`,
              padding: "12px 16px",
            }}
          >
            <div
              style={{
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--color-ink-muted)",
                marginBottom: 4,
              }}
            >
              Exact address
            </div>
            {canSeeAddress ? (
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-ink)" }}>
                {locationExact ?? "Not provided"}
              </div>
            ) : (
              <div
                style={{
                  fontSize: 12,
                  color: "var(--color-warning)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Lock size={11} /> Accept to reveal
              </div>
            )}
          </div>
        </div>

        {duties.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--color-ink-muted)",
                marginBottom: 10,
              }}
            >
              Your duties
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {duties.map((duty, i) => (
                <div
                  key={i}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 14px",
                    borderRadius: 8,
                    background: "var(--color-gold-light)",
                    border: "0.5px solid var(--color-gold-border)",
                    fontSize: 13,
                    color: "var(--color-ink)",
                  }}
                >
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: "var(--color-gold)",
                      color: "white",
                      fontSize: 9,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </span>
                  {duty}
                </div>
              ))}
            </div>
          </div>
        )}

        {canSeeAddress && locationExact && (
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--color-ink-muted)",
                marginBottom: 10,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <MapPin size={13} color="var(--color-gold)" />
              Gig location
            </div>
            <AddressMap query={locationExact} />
          </div>
        )}

        {status === "pending" && (
          <BookingPendingActions bookingId={bookingId} acceptError={acceptError} />
        )}

        {status === "confirmed" && (
          <>
            <SafetyCheckIn bookingId={bookingId} />
            <div style={{ borderTop: "0.5px solid var(--color-border)", margin: "20px 0" }} />
            <CheckinCheckoutSection
              bookingId={bookingId}
              gigStartTime={gig.start_time}
              gigEndTime={gig.end_time}
              checkins={checkins}
              variant="hero"
            />
          </>
        )}
      </div>
    </div>
  );
}
