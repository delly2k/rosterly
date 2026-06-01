"use client";

import { useState } from "react";
import Link from "next/link";
import MobileParticipantShell from "./MobileParticipantShell";
import EmptyState from "@/components/ui/EmptyState";
import type { GigBrowseItem } from "@/app/dashboard/participant/gigs/ParticipantGigCard";
import {
  Briefcase,
  MapPin,
  CalendarCheck,
  Sparkles,
  ArrowRight,
  Users,
} from "lucide-react";
import { MOBILE_BODY_SIZE, MOBILE_LABEL_SIZE } from "./mobileTokens";

function parseDuties(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((d): d is string => typeof d === "string" && d.trim().length > 0);
}

export default function MobileGigFeed({ gigs }: { gigs: GigBrowseItem[] }) {
  const [matchScores, setMatchScores] = useState<Record<string, number>>({});
  const [matchReasons, setMatchReasons] = useState<Record<string, string[]>>({});
  const [matching, setMatching] = useState(false);
  const [matched, setMatched] = useState(false);

  async function runMatching() {
    setMatching(true);
    try {
      const res = await fetch("/api/matching/participant");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Matching failed");
      const scores: Record<string, number> = {};
      const reasons: Record<string, string[]> = {};
      (data.scores ?? []).forEach(
        (s: { gigId: string; score: number; reasons: string[] }) => {
          scores[s.gigId] = s.score;
          reasons[s.gigId] = s.reasons ?? [];
        }
      );
      setMatchScores(scores);
      setMatchReasons(reasons);
      setMatched(true);
    } catch {
      /* keep list stable */
    } finally {
      setMatching(false);
    }
  }

  const sortedGigs = matched
    ? [...gigs].sort((a, b) => (matchScores[b.id] ?? 0) - (matchScores[a.id] ?? 0))
    : gigs;

  return (
    <MobileParticipantShell title="Find gigs" contentStyle={{ padding: 0 }}>
      <div
        style={{
          position: "sticky",
          top: 56,
          zIndex: 30,
          background: "white",
          borderBottom: "0.5px solid var(--color-border)",
          padding: "10px 16px",
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}
      >
        <button
          type="button"
          onClick={() => void runMatching()}
          disabled={matching}
          style={{
            flex: 1,
            padding: "10px 0",
            borderRadius: 8,
            background: matched ? "var(--color-green)" : "var(--color-gold)",
            color: "white",
            border: "none",
            fontWeight: 600,
            fontSize: 13,
            cursor: matching ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            opacity: matching ? 0.8 : 1,
            minHeight: 48,
          }}
        >
          <Sparkles size={14} />
          {matching
            ? "Finding matches..."
            : matched
              ? "✓ Matched — sorted by fit"
              : "AI match me"}
        </button>
        <div style={{ fontSize: 12, color: "var(--color-ink-muted)", flexShrink: 0 }}>
          {gigs.length} gigs
        </div>
      </div>

      <div style={{ padding: "12px 14px" }}>
        {sortedGigs.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No gigs available right now"
            description="New gigs are posted regularly — check back soon"
          />
        ) : (
          sortedGigs.map((gig) => {
            const duties = parseDuties(gig.duties);
            const score = matchScores[gig.id];
            const showMatch = matched && score !== undefined;
            return (
              <Link
                key={gig.id}
                href={`/dashboard/participant/gigs/${gig.id}`}
                style={{ textDecoration: "none", display: "block", marginBottom: 12 }}
              >
                <div
                  style={{
                    background: "white",
                    borderRadius: 14,
                    border: "0.5px solid var(--color-border)",
                    borderLeft: "3px solid var(--color-gold)",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ padding: "14px 16px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 8,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 15,
                            fontWeight: 600,
                            color: "var(--color-ink)",
                            marginBottom: 4,
                          }}
                        >
                          {gig.title}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            flexWrap: "wrap",
                          }}
                        >
                          {gig.location_general && (
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 3,
                                fontSize: MOBILE_BODY_SIZE,
                                color: "var(--color-ink-muted)",
                              }}
                            >
                              <MapPin size={11} /> {gig.location_general}
                            </span>
                          )}
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 3,
                              fontSize: MOBILE_BODY_SIZE,
                              color: "var(--color-ink-muted)",
                            }}
                          >
                            <Users size={11} /> {gig.spots ?? 1} spots
                          </span>
                        </div>
                      </div>
                      {gig.pay_rate != null && (
                        <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 10 }}>
                          <div
                            style={{
                              fontSize: 17,
                              fontWeight: 700,
                              color: "var(--color-gold)",
                            }}
                          >
                            J${gig.pay_rate.toLocaleString()}
                          </div>
                          <div style={{ fontSize: 10, color: "var(--color-ink-hint)" }}>
                            per hr
                          </div>
                        </div>
                      )}
                    </div>

                    {gig.start_time && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: MOBILE_BODY_SIZE,
                          color: "var(--color-ink-muted)",
                          marginBottom: 8,
                        }}
                      >
                        <CalendarCheck size={11} color="var(--color-gold)" />
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
                      </div>
                    )}

                    {duties.length > 0 && (
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
                        {duties.slice(0, 2).map((duty, i) => (
                          <span
                            key={i}
                            style={{
                              padding: "2px 8px",
                              borderRadius: 20,
                              background: "var(--color-gold-light)",
                              border: "0.5px solid var(--color-gold-border)",
                              fontSize: MOBILE_LABEL_SIZE,
                              color: "var(--color-ink-muted)",
                            }}
                          >
                            {duty}
                          </span>
                        ))}
                        {duties.length > 2 && (
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: 20,
                              background: "#F4F3EF",
                              border: "0.5px solid var(--color-border)",
                              fontSize: MOBILE_LABEL_SIZE,
                              color: "var(--color-ink-hint)",
                            }}
                          >
                            +{duties.length - 2}
                          </span>
                        )}
                      </div>
                    )}

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      {showMatch ? (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "3px 9px",
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 600,
                            background:
                              score >= 70
                                ? "var(--color-green-light)"
                                : "var(--color-gold-light)",
                            border: `0.5px solid ${
                              score >= 70
                                ? "var(--color-green-border)"
                                : "var(--color-gold-border)"
                            }`,
                            color: score >= 70 ? "var(--color-green)" : "var(--color-gold)",
                          }}
                        >
                          <Sparkles size={10} /> {score}% match
                        </span>
                      ) : (
                        <span
                          style={{
                            padding: "3px 9px",
                            borderRadius: 20,
                            fontSize: 11,
                            background: "#F4F3EF",
                            border: "0.5px solid var(--color-border)",
                            color: "var(--color-ink-muted)",
                          }}
                        >
                          Open
                        </span>
                      )}
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 12,
                          color: "var(--color-gold)",
                          fontWeight: 500,
                        }}
                      >
                        View gig <ArrowRight size={12} />
                      </span>
                    </div>
                    {showMatch && matchReasons[gig.id]?.length > 0 && (
                      <p
                        style={{
                          margin: "8px 0 0",
                          fontSize: MOBILE_LABEL_SIZE,
                          color: "var(--color-ink-muted)",
                        }}
                      >
                        {matchReasons[gig.id].slice(0, 2).join(" · ")}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </MobileParticipantShell>
  );
}
