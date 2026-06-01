"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Eye,
  Star,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  CheckCircle,
  XCircle,
  MessageCircle,
  Calendar,
  Users,
} from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import { CertPill } from "@/components/ui/CertPill";
import { badgeColorToVariant } from "@/lib/academy";
import type { ApplicationWithApplicant } from "@/app/dashboard/merchant/gigs/actions";

type DayAvailability = {
  available: boolean;
  from: string;
  to: string;
};

function parseSkills(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((s): s is string => typeof s === "string" && s.trim().length > 0);
}

function getInitials(name: string | null | undefined): string {
  if (!name?.trim()) return "??";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function availabilitySummary(raw: unknown): string | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const days = Object.entries(raw as Record<string, DayAvailability>).filter(
    ([, v]) => v?.available
  );
  if (days.length === 0) return null;
  const labels = days.map(([day]) => day.charAt(0).toUpperCase() + day.slice(1, 3));
  if (labels.length <= 3) return labels.join(", ");
  return `${labels.slice(0, 3).join(", ")} +${labels.length - 3}`;
}

function statusStyles(status: string) {
  if (status === "accepted") {
    return {
      background: "var(--color-green-light)",
      color: "var(--color-green)",
      border: "var(--color-green-border)",
    };
  }
  if (status === "rejected") {
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

export function MerchantApplicantCards({
  gigId,
  gigStatus,
  applications,
  onAccept,
  onReject,
  embedded = false,
}: {
  gigId: string;
  gigStatus: string;
  applications: ApplicationWithApplicant[];
  onAccept: (appId: string) => void;
  onReject: (appId: string) => void;
  /** When true, render list only (no outer section — used inside tabbed panel). */
  embedded?: boolean;
}) {
  const [viewingApplicant, setViewingApplicant] =
    useState<ApplicationWithApplicant | null>(null);

  const profile = viewingApplicant?.participant_profiles;

  const applicationsContent = (
    <>
        {applications.length === 0 ? (
          <div style={{ marginTop: 16 }}>
            <EmptyState
              icon={Users}
              title="No applications yet"
              description="Share your gig or use AI matching to find candidates"
              action={{ label: "Find candidates", href: "/dashboard/merchant/officers" }}
              variant="gold"
            />
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginTop: 16,
            }}
          >
            {applications.map((applicant) => {
              const p = applicant.participant_profiles;
              const skills = parseSkills(p?.skills);
              const avail = availabilitySummary(p?.availability);
              const appStatus = statusStyles(applicant.status);

              return (
                <div
                  key={applicant.id}
                  style={{
                    background: "white",
                    border: "0.5px solid var(--color-border)",
                    borderRadius: 12,
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: "var(--color-gold-light)",
                      border: "1px solid var(--color-gold-border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--color-gold)",
                      flexShrink: 0,
                      cursor: "pointer",
                      overflow: "hidden",
                    }}
                    onClick={() => setViewingApplicant(applicant)}
                  >
                    {p?.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.photo_url}
                        alt=""
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      getInitials(p?.full_name)
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 4,
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "var(--color-ink)",
                          cursor: "pointer",
                        }}
                        onClick={() => setViewingApplicant(applicant)}
                      >
                        {p?.full_name ?? "Unknown"}
                      </span>

                      {p?.verified && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 3,
                            fontSize: 10,
                            fontWeight: 500,
                            color: "var(--color-green)",
                            background: "var(--color-green-light)",
                            border: "0.5px solid var(--color-green-border)",
                            padding: "2px 7px",
                            borderRadius: 20,
                          }}
                        >
                          <ShieldCheck size={9} /> Verified
                        </span>
                      )}

                      {applicant.academy_certificates?.map((cert, ci) => (
                        <CertPill
                          key={`${applicant.id}-cert-${ci}`}
                          label={cert.levelSubtitle || cert.levelTitle}
                          variant={badgeColorToVariant(cert.badge_color)}
                          size="sm"
                        />
                      ))}

                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 500,
                          padding: "2px 8px",
                          borderRadius: 20,
                          background: appStatus.background,
                          color: appStatus.color,
                          border: `0.5px solid ${appStatus.border}`,
                        }}
                      >
                        {applicant.status}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 12,
                          color: "var(--color-ink-muted)",
                        }}
                      >
                        <Star size={12} color="var(--color-gold)" fill="var(--color-gold)" />
                        {p && p.average_rating != null && p.average_rating > 0
                          ? `${Number(p.average_rating).toFixed(1)} (${p.total_ratings})`
                          : "No ratings yet"}
                      </span>

                      {p && p.reputation_score > 0 && (
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 12,
                            color: "var(--color-ink-muted)",
                          }}
                        >
                          <TrendingUp size={12} color="var(--color-gold)" />
                          Score:{" "}
                          <strong style={{ color: "var(--color-ink)" }}>
                            {p.reputation_score}
                          </strong>
                        </span>
                      )}

                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 12,
                          color: "var(--color-ink-muted)",
                        }}
                      >
                        <DollarSign size={12} color="var(--color-gold)" />
                        {p && p.rate != null && p.rate > 0
                          ? `J$${Number(p.rate).toLocaleString()}/hr`
                          : "Rate not set"}
                      </span>

                      {avail && (
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 12,
                            color: "var(--color-ink-muted)",
                          }}
                        >
                          <Calendar size={12} color="var(--color-gold)" />
                          {avail}
                        </span>
                      )}

                      <span style={{ fontSize: 12, color: "var(--color-ink-hint)" }}>
                        Applied{" "}
                        {new Date(applicant.created_at).toLocaleDateString("en-JM", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>

                    {skills.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                          marginTop: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        {skills.slice(0, 3).map((skill, i) => (
                          <span
                            key={i}
                            style={{
                              padding: "2px 9px",
                              borderRadius: 20,
                              fontSize: 10,
                              fontWeight: 500,
                              background: "#F4F3EF",
                              border: "0.5px solid var(--color-border)",
                              color: "var(--color-ink-muted)",
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                        {skills.length > 3 && (
                          <span
                            style={{
                              padding: "2px 9px",
                              borderRadius: 20,
                              fontSize: 10,
                              background: "#F4F3EF",
                              border: "0.5px solid var(--color-border)",
                              color: "var(--color-ink-hint)",
                            }}
                          >
                            +{skills.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flexShrink: 0,
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setViewingApplicant(applicant)}
                      style={{
                        padding: "7px 14px",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 500,
                        border: "0.5px solid var(--color-border)",
                        background: "white",
                        color: "var(--color-ink)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <Eye size={12} /> View profile
                    </button>
                    <Link
                      href={`/dashboard/merchant/chats/start?gigId=${gigId}&participantId=${applicant.participant_user_id}`}
                      style={{
                        padding: "7px 14px",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 500,
                        border: "0.5px solid var(--color-border)",
                        background: "white",
                        color: "var(--color-ink)",
                        cursor: "pointer",
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <MessageCircle size={12} /> Message
                    </Link>
                    {applicant.status === "pending" && gigStatus === "open" && (
                      <>
                        <button
                          type="button"
                          onClick={() => onAccept(applicant.id)}
                          style={{
                            padding: "7px 16px",
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 600,
                            background: "var(--color-green)",
                            color: "white",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <CheckCircle size={12} /> Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => onReject(applicant.id)}
                          style={{
                            padding: "7px 14px",
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 500,
                            background: "var(--color-danger-light)",
                            color: "var(--color-danger)",
                            border: "0.5px solid rgba(220,38,38,0.2)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <XCircle size={12} /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </>
  );

  return (
    <>
      {embedded ? (
        applicationsContent
      ) : (
        <section
          style={{
            background: "white",
            border: "0.5px solid var(--color-border)",
            borderRadius: 12,
            padding: "24px 28px",
          }}
        >
          <h2
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "var(--color-ink)",
              margin: 0,
            }}
          >
            Applications ({applications.length})
          </h2>
          {applicationsContent}
        </section>
      )}

      {viewingApplicant && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewingApplicant(null);
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 16,
              width: "100%",
              maxWidth: 560,
              maxHeight: "85vh",
              overflow: "auto",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
            }}
          >
            <div
              style={{
                height: 4,
                background:
                  "linear-gradient(90deg, #C8973A 0%, #D4A843 50%, #A07828 100%)",
              }}
            />
            <div style={{ padding: "24px 28px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "var(--color-gold-light)",
                    border: "2px solid var(--color-gold-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    fontWeight: 700,
                    color: "var(--color-gold)",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  {profile?.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.photo_url}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    getInitials(profile?.full_name)
                  )}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: "var(--color-ink)",
                    }}
                  >
                    {profile?.full_name ?? "Unknown"}
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                    {profile?.verified && (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 3,
                          fontSize: 11,
                          color: "var(--color-green)",
                          background: "var(--color-green-light)",
                          border: "0.5px solid var(--color-green-border)",
                          padding: "3px 9px",
                          borderRadius: 20,
                          fontWeight: 500,
                        }}
                      >
                        <ShieldCheck size={10} /> Verified
                      </span>
                    )}
                    {profile?.rate != null && profile.rate > 0 && (
                      <span
                        style={{
                          fontSize: 11,
                          color: "var(--color-ink-muted)",
                          display: "flex",
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                        <DollarSign size={10} />
                        J${Number(profile.rate).toLocaleString()}/hr
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingApplicant(null)}
                  style={{
                    marginLeft: "auto",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--color-ink-muted)",
                    fontSize: 20,
                  }}
                >
                  ×
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    background: "#FAFAF8",
                    border: "0.5px solid var(--color-border)",
                    borderRadius: 8,
                    padding: "10px 14px",
                    textAlign: "center",
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
                    Score
                  </div>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: "var(--color-gold)",
                    }}
                  >
                    {profile?.reputation_score ?? 0}
                  </div>
                </div>
                <div
                  style={{
                    background: "#FAFAF8",
                    border: "0.5px solid var(--color-border)",
                    borderRadius: 8,
                    padding: "10px 14px",
                    textAlign: "center",
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
                    Rating
                  </div>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: "var(--color-ink)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 4,
                    }}
                  >
                    <Star size={14} color="var(--color-gold)" fill="var(--color-gold)" />
                    {profile?.average_rating != null && profile.average_rating > 0
                      ? Number(profile.average_rating).toFixed(1)
                      : "—"}
                  </div>
                </div>
                <div
                  style={{
                    background: "#FAFAF8",
                    border: "0.5px solid var(--color-border)",
                    borderRadius: 8,
                    padding: "10px 14px",
                    textAlign: "center",
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
                    Reviews
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "var(--color-ink)" }}>
                    {profile?.total_ratings ?? 0}
                  </div>
                </div>
              </div>

              {profile?.bio && (
                <div style={{ marginBottom: 20 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: "var(--color-ink-muted)",
                      marginBottom: 8,
                    }}
                  >
                    About
                  </div>
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--color-ink)",
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {profile.bio}
                  </p>
                </div>
              )}

              {parseSkills(profile?.skills).length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: "var(--color-ink-muted)",
                      marginBottom: 8,
                    }}
                  >
                    Skills
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {parseSkills(profile?.skills).map((skill, i) => (
                      <span
                        key={i}
                        style={{
                          padding: "4px 12px",
                          borderRadius: 20,
                          fontSize: 12,
                          background: "var(--color-gold-light)",
                          border: "0.5px solid var(--color-gold-border)",
                          color: "var(--color-ink-muted)",
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {profile?.availability &&
              typeof profile.availability === "object" &&
              !Array.isArray(profile.availability) ? (
                  <div style={{ marginBottom: 24 }}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: "var(--color-ink-muted)",
                        marginBottom: 8,
                      }}
                    >
                      Availability
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {Object.entries(
                        profile.availability as Record<string, DayAvailability>
                      )
                        .filter(([, v]) => v?.available)
                        .map(([day, v]) => (
                          <div
                            key={day}
                            style={{
                              padding: "4px 12px",
                              borderRadius: 20,
                              fontSize: 11,
                              background: "var(--color-green-light)",
                              border: "0.5px solid var(--color-green-border)",
                              color: "var(--color-green)",
                              fontWeight: 500,
                            }}
                          >
                            {day.charAt(0).toUpperCase() + day.slice(1, 3)} · {v.from}–{v.to}
                          </div>
                        ))}
                    </div>
                  </div>
                ) : null}

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  paddingTop: 16,
                  borderTop: "0.5px solid var(--color-border)",
                  flexWrap: "wrap",
                }}
              >
                {viewingApplicant.status === "pending" && gigStatus === "open" && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        onAccept(viewingApplicant.id);
                        setViewingApplicant(null);
                      }}
                      style={{
                        flex: 1,
                        minWidth: 140,
                        padding: "10px 0",
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 600,
                        background: "var(--color-green)",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                      }}
                    >
                      <CheckCircle size={14} /> Accept applicant
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onReject(viewingApplicant.id);
                        setViewingApplicant(null);
                      }}
                      style={{
                        flex: 1,
                        minWidth: 140,
                        padding: "10px 0",
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 500,
                        background: "var(--color-danger-light)",
                        color: "var(--color-danger)",
                        border: "0.5px solid rgba(220,38,38,0.2)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                      }}
                    >
                      <XCircle size={14} /> Reject applicant
                    </button>
                  </>
                )}
                <Link
                  href={`/dashboard/merchant/chats/start?gigId=${gigId}&participantId=${viewingApplicant.participant_user_id}`}
                  style={{
                    flex: 1,
                    minWidth: 140,
                    padding: "10px 0",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 500,
                    border: "0.5px solid var(--color-border)",
                    background: "white",
                    color: "var(--color-ink)",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <MessageCircle size={14} /> Send message
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
