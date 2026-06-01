"use client";

import Link from "next/link";
import { MapPin, Users, CalendarCheck, ArrowRight, Sparkles } from "lucide-react";

export type GigBrowseItem = {
  id: string;
  title: string;
  duties: unknown;
  pay_rate: number | null;
  location_general: string | null;
  start_time: string | null;
  end_time: string | null;
  spots?: number;
};

function parseDuties(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((d): d is string => typeof d === "string" && d.trim().length > 0);
}

export function ParticipantGigCard({
  gig,
  matched = false,
  matchScore,
  matchReasons,
}: {
  gig: GigBrowseItem;
  matched?: boolean;
  matchScore?: number;
  matchReasons?: string[];
}) {
  const duties = parseDuties(gig.duties);
  const showMatch = matched && matchScore !== undefined;

  return (
    <Link
      href={`/dashboard/participant/gigs/${gig.id}`}
      style={{
        background: "white",
        border: "0.5px solid var(--color-border)",
        borderLeft: "3px solid var(--color-gold)",
        borderRadius: "12px",
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
        <div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "var(--color-ink)",
              marginBottom: 6,
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
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "3px 10px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 500,
                background: "var(--color-green-light)",
                border: "0.5px solid var(--color-green-border)",
                color: "var(--color-green)",
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "var(--color-green)",
                }}
              />
              Open
            </span>
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
              <Users size={12} /> {gig.spots ?? 1} spots
            </span>
          </div>
        </div>

        <div style={{ textAlign: "right", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          {showMatch && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 10px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 600,
                background:
                  matchScore >= 70
                    ? "var(--color-green-light)"
                    : matchScore >= 40
                      ? "var(--color-gold-light)"
                      : "#F4F3EF",
                border: `0.5px solid ${
                  matchScore >= 70
                    ? "var(--color-green-border)"
                    : matchScore >= 40
                      ? "var(--color-gold-border)"
                      : "var(--color-border)"
                }`,
                color:
                  matchScore >= 70
                    ? "var(--color-green)"
                    : matchScore >= 40
                      ? "var(--color-gold)"
                      : "var(--color-ink-muted)",
              }}
            >
              <Sparkles size={10} />
              {matchScore}% match
            </div>
          )}
          {gig.pay_rate != null && (
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "var(--color-gold)" }}>
                J${gig.pay_rate.toLocaleString()}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--color-ink-muted)",
                  marginTop: 2,
                }}
              >
                per hour
              </div>
            </div>
          )}
        </div>
      </div>

      {showMatch && matchReasons && matchReasons.length > 0 && (
        <div style={{ fontSize: 11, color: "var(--color-ink-muted)", marginBottom: 8 }}>
          {matchReasons.slice(0, 2).join(" · ")}
        </div>
      )}

      <div
        style={{
          borderTop: "0.5px solid var(--color-border)",
          margin: "12px 0",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        {gig.start_time && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: "var(--color-ink-muted)",
            }}
          >
            <CalendarCheck size={12} color="var(--color-gold)" />
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
            {gig.end_time && (
              <>
                {" → "}
                {new Date(gig.end_time).toLocaleTimeString("en-JM", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </>
            )}
          </div>
        )}

        {duties.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {duties.slice(0, 2).map((duty, i) => (
              <span
                key={i}
                style={{
                  padding: "3px 10px",
                  borderRadius: 20,
                  background: "var(--color-gold-light)",
                  border: "0.5px solid var(--color-gold-border)",
                  fontSize: 11,
                  color: "var(--color-ink-muted)",
                }}
              >
                {duty}
              </span>
            ))}
            {duties.length > 2 && (
              <span
                style={{
                  padding: "3px 10px",
                  borderRadius: 20,
                  background: "#F4F3EF",
                  border: "0.5px solid var(--color-border)",
                  fontSize: 11,
                  color: "var(--color-ink-muted)",
                }}
              >
                +{duties.length - 2} more
              </span>
            )}
          </div>
        )}

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
            flexShrink: 0,
          }}
        >
          View gig <ArrowRight size={12} />
        </span>
      </div>
    </Link>
  );
}
