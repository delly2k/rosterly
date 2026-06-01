"use client";

import Link from "next/link";
import {
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Lock,
  Send,
  MessageCircle,
} from "lucide-react";
import AddressMap from "@/components/ui/AddressMap";
import { ApplyButton } from "./ApplyButton";

type Application = {
  id: string;
  status: string;
};

type Booking = {
  id: string;
  status: string;
};

type GigHeroData = {
  id: string;
  title: string;
  duties: unknown;
  pay_rate: number | null;
  location_general: string | null;
  location_city?: string | null;
  location_parish?: string | null;
  location_exact?: string | null;
  start_time: string | null;
  end_time: string | null;
  status: string;
  spots?: number;
};

function parseDuties(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((d): d is string => typeof d === "string" && d.trim().length > 0);
}

function gigStatusStyle(status: string) {
  switch (status) {
    case "open":
      return {
        background: "var(--color-green-light)",
        border: "0.5px solid var(--color-green-border)",
        color: "var(--color-green)",
        dot: "var(--color-green)",
      };
    case "filled":
      return {
        background: "var(--color-gold-light)",
        border: "0.5px solid var(--color-gold-border)",
        color: "var(--color-gold)",
        dot: "var(--color-gold)",
      };
    case "cancelled":
      return {
        background: "var(--color-danger-light)",
        border: "0.5px solid rgba(220,38,38,0.2)",
        color: "var(--color-danger)",
        dot: "var(--color-danger)",
      };
    default:
      return {
        background: "#FAFAF8",
        border: "0.5px solid var(--color-border)",
        color: "var(--color-ink-muted)",
        dot: "var(--color-ink-muted)",
      };
  }
}

export function ParticipantGigHero({
  gig,
  application,
  booking,
  filledSpots,
}: {
  gig: GigHeroData;
  application: Application | null;
  booking: Booking | null;
  filledSpots: number;
}) {
  const duties = parseDuties(gig.duties);
  const spots = gig.spots ?? 1;
  const isBooked =
    booking?.status === "confirmed" || booking?.status === "completed";
  const statusStyle = gigStatusStyle(gig.status);

  const mapQuery =
    isBooked && gig.location_exact
      ? gig.location_exact
      : [gig.location_city, gig.location_parish, "Jamaica"]
          .filter(Boolean)
          .join(", ") ||
        (gig.location_general ? `${gig.location_general}, Jamaica` : "");

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
                  border: statusStyle.border,
                  color: statusStyle.color,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: statusStyle.dot,
                  }}
                />
                {gig.status.charAt(0).toUpperCase() + gig.status.slice(1)}
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
                  J${gig.pay_rate.toLocaleString()}/hr
                </span>
              )}
            </div>
          </div>

          {application && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 500,
                flexShrink: 0,
                background:
                  application.status === "accepted"
                    ? "var(--color-green-light)"
                    : application.status === "rejected"
                      ? "var(--color-danger-light)"
                      : "var(--color-warning-light)",
                border: `0.5px solid ${
                  application.status === "accepted"
                    ? "var(--color-green-border)"
                    : application.status === "rejected"
                      ? "rgba(220,38,38,0.2)"
                      : "rgba(217,119,6,0.3)"
                }`,
                color:
                  application.status === "accepted"
                    ? "var(--color-green)"
                    : application.status === "rejected"
                      ? "var(--color-danger)"
                      : "var(--color-warning)",
              }}
            >
              {application.status === "accepted" && <CheckCircle size={14} />}
              {application.status === "rejected" && <XCircle size={14} />}
              {application.status === "pending" && <Clock size={14} />}
              Application:{" "}
              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
            </div>
          )}
        </div>

        <div
          style={{
            borderTop: "0.5px solid var(--color-border)",
            margin: "20px 0",
          }}
        />

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
              Spots available
            </div>
            <div style={{ fontSize: 20, fontWeight: 600, color: "var(--color-ink)" }}>
              {Math.max(0, spots - filledSpots)}{" "}
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 400,
                  color: "var(--color-ink-muted)",
                }}
              >
                of {spots}
              </span>
            </div>
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
              background: isBooked ? "#FAFAF8" : "var(--color-gold-light)",
              borderRadius: 8,
              border: `0.5px solid ${isBooked ? "var(--color-border)" : "var(--color-gold-border)"}`,
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
            {isBooked ? (
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-ink)" }}>
                {gig.location_exact ?? "Not provided"}
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
                <Lock size={11} /> Revealed after booking
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
              Duties
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

        {mapQuery && (
          <div>
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
              {isBooked ? "Exact location" : "General area"}
            </div>
            <AddressMap query={mapQuery} />
            {!isBooked && (
              <div
                style={{
                  fontSize: 11,
                  color: "var(--color-ink-hint)",
                  marginTop: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Lock size={10} /> Exact address shown only after your booking is confirmed
              </div>
            )}
          </div>
        )}

        <div
          style={{
            borderTop: "0.5px solid var(--color-border)",
            margin: "24px 0 0",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            paddingTop: 20,
            flexWrap: "wrap",
          }}
        >
          {!application && (
            <ApplyButton
              gigId={gig.id}
              variant="hero"
              icon={<Send size={13} />}
            />
          )}

          {application && (
            <Link
              href={`/dashboard/participant/chats/start?gigId=${gig.id}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 20px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                border: "1px solid var(--color-border)",
                background: "white",
                color: "var(--color-ink)",
                textDecoration: "none",
              }}
            >
              <MessageCircle size={13} /> Message about this gig
            </Link>
          )}

          {application && (
            <Link
              href="/dashboard/participant/applications"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 20px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                color: "var(--color-ink-muted)",
                textDecoration: "none",
              }}
            >
              View all applications
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
