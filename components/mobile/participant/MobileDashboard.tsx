"use client";

import Link from "next/link";
import NotificationBell from "@/components/ui/NotificationBell";
import {
  Briefcase,
  CalendarCheck,
  Star,
  ShieldAlert,
  Sparkles,
  MapPin,
  Mail,
  Shield,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import type { ParticipantDashboardData } from "@/app/dashboard/participant/actions";
import type { DashboardChatPreview } from "@/lib/chats";

type Props = {
  data: ParticipantDashboardData;
  participantName: string | null;
  pendingInvitations: number;
  recentChats: DashboardChatPreview[];
  rejectedApplications: number;
};

function initialsFromName(name: string | null): string {
  if (!name?.trim()) return "?";
  return name
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function MobileDashboard({
  data,
  participantName,
  pendingInvitations,
  recentChats,
  rejectedApplications,
}: Props) {
  const firstName = participantName?.split(" ")[0] ?? "there";
  const initials = initialsFromName(participantName);
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const completionPct = data.profileCompletionPercent;
  const reputationScore = data.reputationScore;
  const pendingApplications = data.applicationCounts.pending;
  const acceptedApplications = data.applicationCounts.accepted;

  return (
    <div
      className="mobile-safe-bottom"
      style={{
        background: "var(--color-page)",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "0.5px solid var(--color-border)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <svg
          viewBox="0 0 480 100"
          width="110"
          height="23"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Rosterly"
        >
          <text
            x="4"
            y="74"
            fontFamily="Georgia, serif"
            fontSize="80"
            fontStyle="italic"
            fontWeight="900"
            fill="#C8973A"
            letterSpacing="-2"
            opacity="0.6"
          >
            Rosterly
          </text>
          <text
            x="2"
            y="71"
            fontFamily="Georgia, serif"
            fontSize="80"
            fontStyle="italic"
            fontWeight="900"
            fill="#1A1A1A"
            letterSpacing="-2"
          >
            Rosterly
          </text>
          <path
            d="M 2 84 Q 160 100 330 88 Q 410 82 458 70"
            stroke="#C8973A"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="460" cy="69" r="3" fill="#C8973A" />
        </svg>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <NotificationBell compact />
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "rgba(200,151,58,0.15)",
              border: "1px solid rgba(200,151,58,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 600,
              color: "#C8973A",
            }}
          >
            {initials}
          </div>
        </div>
      </div>

      <div
        style={{
          padding: "20px 16px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--color-ink)" }}>
            {greeting}, {firstName} 👋
          </div>
          <div style={{ fontSize: 13, color: "var(--color-ink-muted)", marginTop: 4 }}>
            {new Date().toLocaleDateString("en-JM", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 10,
            marginBottom: 16,
          }}
        >
          {[
            {
              label: "Score",
              value: reputationScore,
              icon: Star,
              iconColor: "#C8973A",
              tileBg: "#FBF7EF",
              tileBorder: "rgba(200,151,58,0.3)",
            },
            {
              label: "Pending",
              value: pendingApplications,
              icon: Briefcase,
              iconColor: "#D97706",
              tileBg: "#FFFBEB",
              tileBorder: "rgba(217,119,6,0.3)",
            },
            {
              label: "Booked",
              value: acceptedApplications,
              icon: CalendarCheck,
              iconColor: "#16A34A",
              tileBg: "#F0FDF4",
              tileBorder: "rgba(22,163,74,0.3)",
            },
          ].map(({ label, value, icon: Icon, iconColor, tileBg, tileBorder }) => (
            <div
              key={label}
              style={{
                background: "white",
                borderRadius: 12,
                border: "0.5px solid var(--color-border)",
                padding: "14px 10px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 9,
                  background: tileBg,
                  border: `0.5px solid ${tileBorder}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 8px",
                }}
              >
                <Icon size={18} color={iconColor} />
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 600,
                  color: "var(--color-ink)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {value}
              </div>
              <div style={{ fontSize: 11, color: "var(--color-ink-muted)", marginTop: 2 }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {!data.verified && data.verificationStatus !== "pending" && (
          <Link
            href="/dashboard/participant/verification"
            style={{ textDecoration: "none", display: "block", marginBottom: 14 }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #1A1D23 0%, #2A2D35 100%)",
                borderRadius: 14,
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: "rgba(200,151,58,0.15)",
                  border: "1px solid rgba(200,151,58,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <ShieldAlert size={18} color="#C8973A" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#F5F4F0" }}>
                  Verify your identity
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.45)",
                    marginTop: 2,
                  }}
                >
                  Get seen by more merchants →
                </div>
              </div>
            </div>
          </Link>
        )}

        {data.verificationStatus === "pending" && (
          <Link
            href="/dashboard/participant/verification"
            style={{ textDecoration: "none", display: "block", marginBottom: 14 }}
          >
            <div
              style={{
                background: "var(--color-warning-light)",
                border: "0.5px solid rgba(217,119,6,0.3)",
                borderRadius: 14,
                padding: "14px 16px",
                fontSize: 13,
                fontWeight: 500,
                color: "var(--color-warning)",
              }}
            >
              Verification pending review →
            </div>
          </Link>
        )}

        {completionPct < 100 && (
          <Link
            href="/dashboard/participant/onboarding"
            style={{ textDecoration: "none", display: "block", marginBottom: 14 }}
          >
            <div
              style={{
                background: "white",
                borderRadius: 12,
                border: "0.5px solid var(--color-border)",
                padding: "12px 14px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 7,
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-ink)" }}>
                  Profile completion
                </span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#C8973A" }}>
                  {completionPct}%
                </span>
              </div>
              <div
                style={{
                  height: 5,
                  background: "#F0EEE8",
                  borderRadius: 3,
                  overflow: "hidden",
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    height: 5,
                    borderRadius: 3,
                    background: "#C8973A",
                    width: `${completionPct}%`,
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#C8973A",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontWeight: 500,
                }}
              >
                <Sparkles size={11} /> Finish with Ros AI →
              </div>
            </div>
          </Link>
        )}

        <div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--color-ink)",
              marginBottom: 10,
            }}
          >
            Upcoming bookings
          </div>
          {data.upcomingBookings.length === 0 ? (
            <div
              style={{
                background: "white",
                borderRadius: 12,
                border: "0.5px solid var(--color-border)",
                padding: "24px 16px",
                textAlign: "center",
              }}
            >
              <CalendarCheck
                size={28}
                color="var(--color-ink-hint)"
                style={{ margin: "0 auto 8px", display: "block" }}
              />
              <div style={{ fontSize: 13, color: "var(--color-ink-muted)" }}>
                No upcoming bookings
              </div>
              <Link
                href="/dashboard/participant/gigs"
                style={{
                  display: "inline-block",
                  marginTop: 10,
                  fontSize: 13,
                  color: "#C8973A",
                  fontWeight: 600,
                }}
              >
                Browse gigs →
              </Link>
            </div>
          ) : (
            data.upcomingBookings.map((booking) => (
              <Link
                key={booking.bookingId}
                href={`/dashboard/participant/bookings/${booking.bookingId}`}
                style={{ textDecoration: "none", display: "block", marginBottom: 10 }}
              >
                <div
                  style={{
                    background: "white",
                    borderRadius: 12,
                    border: "0.5px solid var(--color-border)",
                    borderLeft: "3px solid #16A34A",
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--color-ink)",
                        marginBottom: 4,
                      }}
                    >
                      {booking.gigTitle}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--color-ink-muted)",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        flexWrap: "wrap",
                      }}
                    >
                      {booking.startTime && (
                        <>
                          <CalendarCheck size={11} />
                          {new Date(booking.startTime).toLocaleDateString("en-JM", {
                            day: "numeric",
                            month: "short",
                          })}
                        </>
                      )}
                      {booking.startTime && booking.locationGeneral && (
                        <span>·</span>
                      )}
                      {booking.locationGeneral && (
                        <>
                          <MapPin size={11} />
                          {booking.locationGeneral}
                        </>
                      )}
                      {!booking.startTime && !booking.locationGeneral && (
                        <span>Details TBC</span>
                      )}
                    </div>
                  </div>
                  {booking.payRate != null && (
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#C8973A" }}>
                        J${booking.payRate.toLocaleString()}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--color-ink-hint)" }}>
                        per shift
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Application pipeline */}
        <div
          style={{
            background: "white",
            borderRadius: 12,
            border: "0.5px solid var(--color-border)",
            padding: "14px 16px",
            marginBottom: 12,
            marginTop: 12,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--color-ink)",
              marginBottom: 12,
            }}
          >
            Applications
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
            {[
              {
                label: "Pending",
                value: pendingApplications,
                color: "#D97706",
                bg: "#FFFBEB",
                border: "rgba(217,119,6,0.2)",
              },
              {
                label: "Accepted",
                value: acceptedApplications,
                color: "#16A34A",
                bg: "#F0FDF4",
                border: "rgba(22,163,74,0.2)",
              },
              {
                label: "Rejected",
                value: rejectedApplications,
                color: "#6B7280",
                bg: "#F9F8F5",
                border: "var(--color-border)",
              },
            ].map(({ label, value, color, bg, border }) => (
              <div
                key={label}
                style={{
                  background: bg,
                  borderRadius: 8,
                  border: `0.5px solid ${border}`,
                  padding: "10px 8px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 20, fontWeight: 700, color }}>{value}</div>
                <div
                  style={{
                    fontSize: 10,
                    color: "var(--color-ink-muted)",
                    marginTop: 2,
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/dashboard/participant/applications"
            style={{
              display: "block",
              textAlign: "center",
              marginTop: 10,
              fontSize: 12,
              color: "var(--color-gold)",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            View all applications →
          </Link>
        </div>

        {pendingInvitations > 0 && (
          <Link
            href="/dashboard/participant/invitations"
            style={{ textDecoration: "none", display: "block", marginBottom: 12 }}
          >
            <div
              style={{
                background: "var(--color-gold-light)",
                border: "0.5px solid var(--color-gold-border)",
                borderRadius: 12,
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "white",
                  border: "1px solid var(--color-gold-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  position: "relative",
                }}
              >
                <Mail size={16} color="var(--color-gold)" />
                <div
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -4,
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "var(--color-danger)",
                    border: "2px solid white",
                    fontSize: 9,
                    fontWeight: 700,
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {pendingInvitations}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-gold)" }}>
                  {pendingInvitations} gig invitation{pendingInvitations > 1 ? "s" : ""} waiting
                </div>
                <div style={{ fontSize: 11, color: "var(--color-ink-muted)", marginTop: 1 }}>
                  Tap to review and respond →
                </div>
              </div>
            </div>
          </Link>
        )}

        {recentChats.length > 0 && (
          <div
            style={{
              background: "white",
              borderRadius: 12,
              border: "0.5px solid var(--color-border)",
              padding: "14px 16px",
              marginBottom: 12,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-ink)" }}>
                Recent chats
              </div>
              <Link
                href="/dashboard/participant/chats"
                style={{ fontSize: 12, color: "var(--color-gold)", textDecoration: "none" }}
              >
                See all
              </Link>
            </div>
            {recentChats.slice(0, 3).map((chat, index) => (
              <Link
                key={chat.id}
                href={`/dashboard/participant/chats/${chat.id}`}
                style={{ textDecoration: "none", display: "block" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 0",
                    borderBottom:
                      index < Math.min(recentChats.length, 3) - 1
                        ? "0.5px solid var(--color-border)"
                        : "none",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "var(--color-gold-light)",
                      border: "1px solid var(--color-gold-border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--color-gold)",
                      flexShrink: 0,
                    }}
                  >
                    {chat.merchantName.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "var(--color-ink)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {chat.merchantName}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--color-ink-muted)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {chat.gigTitle}
                    </div>
                  </div>
                  <ChevronRight size={14} color="var(--color-ink-hint)" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Safety quick actions */}
        <div
          style={{
            background: "white",
            borderRadius: 12,
            border: "0.5px solid var(--color-border)",
            padding: "14px 16px",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--color-ink)",
              marginBottom: 10,
            }}
          >
            Safety
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <Link href="/dashboard/participant/report" style={{ textDecoration: "none" }}>
              <div
                style={{
                  padding: "12px",
                  borderRadius: 10,
                  textAlign: "center",
                  background: "#FEF2F2",
                  border: "0.5px solid rgba(220,38,38,0.2)",
                }}
              >
                <AlertTriangle
                  size={20}
                  color="#DC2626"
                  style={{ margin: "0 auto 6px", display: "block" }}
                />
                <div style={{ fontSize: 12, fontWeight: 500, color: "#DC2626" }}>
                  Report issue
                </div>
              </div>
            </Link>
            <Link href="/dashboard/participant/safety" style={{ textDecoration: "none" }}>
              <div
                style={{
                  padding: "12px",
                  borderRadius: 10,
                  textAlign: "center",
                  background: "var(--color-gold-light)",
                  border: "0.5px solid var(--color-gold-border)",
                }}
              >
                <Shield
                  size={20}
                  color="var(--color-gold)"
                  style={{ margin: "0 auto 6px", display: "block" }}
                />
                <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-gold)" }}>
                  Safety hub
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
