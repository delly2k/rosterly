"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  FileCheck,
  DollarSign,
  Shield,
  MessageCircle,
  ChevronRight,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  UserCircle,
  ShieldCheck,
  ShieldAlert,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";
import type { ParticipantDashboardData } from "@/app/dashboard/participant/actions";
import { formatShortDate } from "@/lib/formatDate";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { VerificationBadge } from "@/app/dashboard/participant/VerificationBadge";
import { ButtonLink } from "@/components/ui/Button";
import OnboardingDrawer from "@/components/ui/OnboardingDrawer";
import { ParticipantReputationCard } from "@/components/profile/ParticipantReputationCard";
import { normalizePhotoVisibility } from "@/lib/photo-privacy";

const DISPLAY_DATETIME_LOCALE = "en-GB";

function gigHours(startTime: string | null, endTime: string | null): number {
  if (startTime && endTime) {
    const hours =
      (new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60 * 60);
    if (hours > 0) return hours;
  }
  return 8;
}

function formatDisplayDateTime(iso: string): string {
  return new Date(iso).toLocaleString(DISPLAY_DATETIME_LOCALE, {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function getPhotoVisibilityLabel(value: string | null): string {
  const normalized = normalizePhotoVisibility(value);
  if (normalized === "team_only") return "Team only";
  if (normalized === "hidden") return "Hidden";
  if (normalized === "merchants_on_application") return "Public";
  if (normalized === "merchants_after_booking") return "After booking";
  return "Team only";
}

function ProfileStatusCard({ data }: { data: ParticipantDashboardData }) {
  const completionPct = data.profileCompletionPercent;
  const isVerified = data.verified;
  const photoVisibility = getPhotoVisibilityLabel(data.photoVisibilityMode);

  return (
    <div
      style={{
        background: "white",
        border: "0.5px solid var(--color-border)",
        borderRadius: "12px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "var(--color-gold-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <UserCircle size={16} color="var(--color-gold)" />
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: "var(--color-ink)" }}>
            Profile status
          </div>
          <div style={{ fontSize: 12, color: "var(--color-ink-muted)" }}>
            Completion and visibility
          </div>
        </div>
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: "var(--color-ink-muted)" }}>Profile complete</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-ink)" }}>
            {completionPct}%
          </span>
        </div>
        <div style={{ background: "#F0EEE8", borderRadius: 4, height: 6, overflow: "hidden" }}>
          <div
            style={{
              height: 6,
              borderRadius: 4,
              background: completionPct === 100 ? "var(--color-green)" : "var(--color-gold)",
              width: `${completionPct}%`,
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "4px 10px",
            borderRadius: 20,
            background: isVerified ? "var(--color-green-light)" : "var(--color-warning-light)",
            border: `0.5px solid ${isVerified ? "var(--color-green-border)" : "rgba(217,119,6,0.3)"}`,
            fontSize: 11,
            fontWeight: 500,
            color: isVerified ? "var(--color-green)" : "var(--color-warning)",
          }}
        >
          {isVerified ? (
            <>
              <ShieldCheck size={11} /> Verified
            </>
          ) : (
            <>
              <ShieldAlert size={11} /> Unverified
            </>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "4px 10px",
            borderRadius: 20,
            background: "#F9F8F5",
            border: "0.5px solid var(--color-border)",
            fontSize: 11,
            fontWeight: 500,
            color: "var(--color-ink-muted)",
          }}
        >
          <ImageIcon size={11} />
          Photo: {photoVisibility}
        </div>
      </div>

      {completionPct < 100 && (
        <div
          style={{
            background: "#FAFAF8",
            border: "0.5px solid var(--color-border)",
            borderRadius: 8,
            padding: "10px 12px",
            fontSize: 12,
            color: "var(--color-ink-muted)",
            lineHeight: 1.6,
          }}
        >
          <div style={{ fontWeight: 500, color: "var(--color-ink)", marginBottom: 4 }}>
            Complete your profile
          </div>
          {data.profileCompletionMissing.map((label) => (
            <div key={label}>· {label}</div>
          ))}
          {!isVerified && <div>· Complete identity verification</div>}
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <Link
          href="/dashboard/participant/profile"
          style={{
            flex: 1,
            textAlign: "center",
            background: "var(--color-gold)",
            color: "white",
            fontWeight: 600,
            fontSize: 13,
            padding: "9px 0",
            borderRadius: 8,
            textDecoration: "none",
          }}
        >
          Edit profile
        </Link>
        {!isVerified && (
          <Link
            href="/dashboard/participant/verification"
            style={{
              flex: 1,
              textAlign: "center",
              background: "white",
              color: "var(--color-ink)",
              fontWeight: 500,
              fontSize: 13,
              padding: "9px 0",
              borderRadius: 8,
              border: "1px solid var(--color-border)",
              textDecoration: "none",
            }}
          >
            Verify identity
          </Link>
        )}
      </div>
    </div>
  );
}

export function ParticipantDashboardClient({
  data,
  sosButton,
}: {
  data: ParticipantDashboardData;
  sosButton: React.ReactNode;
}) {
  const [rosOpen, setRosOpen] = useState(false);
  const [showVerifyBanner, setShowVerifyBanner] = useState(false);
  const [showVerifyPill, setShowVerifyPill] = useState(false);
  const completionPct = data.profileCompletionPercent;
  const isVerified = data.verified || data.verificationStatus === "verified";
  const userId = data.userId;

  useEffect(() => {
    if (isVerified) return;

    const key = `rosterly_verify_banner_${userId}`;
    const sessionKey = `rosterly_verify_banner_hide_${userId}`;
    if (sessionStorage.getItem(sessionKey)) return;

    const stored = localStorage.getItem(key);
    const bannerData = stored
      ? (JSON.parse(stored) as { views: number; lastSeen: string | null; dismissed?: boolean })
      : { views: 0, lastSeen: null, dismissed: false };

    if (bannerData.dismissed) return;

    const daysSinceLastSeen = bannerData.lastSeen
      ? (Date.now() - new Date(bannerData.lastSeen).getTime()) / (1000 * 60 * 60 * 24)
      : 999;

    if (bannerData.views < 3 || daysSinceLastSeen >= 7) {
      setShowVerifyBanner(true);
      setShowVerifyPill(false);
      localStorage.setItem(
        key,
        JSON.stringify({
          ...bannerData,
          views: bannerData.views + 1,
          lastSeen: new Date().toISOString(),
        })
      );
    } else {
      setShowVerifyPill(true);
    }
  }, [isVerified, userId]);

  const dismissVerifyBanner = (permanent = false) => {
    const key = `rosterly_verify_banner_${userId}`;
    const sessionKey = `rosterly_verify_banner_hide_${userId}`;
    const stored = localStorage.getItem(key);
    const bannerData = stored
      ? (JSON.parse(stored) as { views: number; lastSeen?: string | null; dismissed?: boolean })
      : { views: 0 };
    localStorage.setItem(
      key,
      JSON.stringify({
        ...bannerData,
        dismissed: permanent,
        lastSeen: new Date().toISOString(),
      })
    );
    sessionStorage.setItem(sessionKey, "1");
    setShowVerifyBanner(false);
    if ((bannerData.views ?? 0) >= 3) {
      setShowVerifyPill(true);
    }
  };

  const now = new Date();
  const bookings = data.bookingsForEarnings;
  const expectedEarnings =
    bookings
      ?.filter(
        (b) =>
          b.status === "confirmed" && b.startTime && new Date(b.startTime) > now
      )
      ?.reduce((sum, b) => sum + (b.payRate ?? 0) * gigHours(b.startTime, b.endTime), 0) ??
    0;

  const pendingEarnings =
    bookings
      ?.filter((b) => b.status === "completed")
      ?.reduce((sum, b) => sum + (b.payRate ?? 0) * gigHours(b.startTime, b.endTime), 0) ??
    0;

  const lifetimeEarnings = pendingEarnings;
  const gigsCompleted = data.gigsCompleted;
  const acceptedBookings =
    bookings?.filter(
      (b) => b.status === "confirmed" && b.startTime && new Date(b.startTime) > now
    ).length ?? 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      {showVerifyBanner && !isVerified && (
        <div
          style={{
            background: "linear-gradient(135deg, #1A1D23 0%, #2A2D35 100%)",
            borderRadius: 12,
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 20,
            position: "relative",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
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
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#F5F4F0",
                marginBottom: 3,
              }}
            >
              Verify your identity to unlock more gigs
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
              Verified participants are shown first to merchants and earn 100 reputation
              points
            </div>
          </div>
          <a
            href="/dashboard/participant/verification"
            style={{
              padding: "8px 18px",
              borderRadius: 8,
              flexShrink: 0,
              background: "#C8973A",
              color: "white",
              fontSize: 12,
              fontWeight: 600,
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            Verify now →
          </a>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => dismissVerifyBanner(false)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "rgba(255,255,255,0.3)",
                fontSize: 18,
                lineHeight: 1,
                padding: "2px 4px",
              }}
              title="Hide for now"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {showVerifyPill && !showVerifyBanner && !isVerified && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 12px",
            borderRadius: 20,
            marginBottom: 16,
            background: "var(--color-warning-light)",
            border: "0.5px solid rgba(217,119,6,0.2)",
            fontSize: 12,
            color: "var(--color-warning)",
          }}
        >
          <ShieldAlert size={11} />
          <a
            href="/dashboard/participant/verification"
            style={{ color: "inherit", textDecoration: "none", fontWeight: 500 }}
          >
            Identity not yet verified — click to complete →
          </a>
        </div>
      )}
      <div className="surface-card p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="admin-page-title">Welcome back</h1>
              {data.verificationStatus === "verified" && (
                <VerificationBadge status="verified" />
              )}
            </div>
            <p className="mt-1 text-sm leading-relaxed text-[var(--color-ink-muted)]">
              Your participant dashboard — gigs, bookings, and chats in one place.
            </p>
            {data.nextConfirmedGig && (
              <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-gold-light)] p-3">
                <Calendar className="h-4 w-4 shrink-0 text-[var(--color-gold)]" />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">
                    Next confirmed gig
                  </p>
                  <p className="font-semibold text-[var(--color-ink)]">
                    {data.nextConfirmedGig.gigTitle}
                    {data.nextConfirmedGig.startTime &&
                      ` · ${formatDisplayDateTime(data.nextConfirmedGig.startTime)}`}
                  </p>
                </div>
                <Link
                  href={`/dashboard/participant/bookings/${data.nextConfirmedGig.bookingId}`}
                  className="ml-auto inline-flex items-center text-sm font-medium text-[var(--color-gold)] hover:underline"
                >
                  View
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
          <div className="shrink-0">{sosButton}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Card>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-gold-light)]">
              <Calendar className="h-4 w-4 text-[var(--color-gold)]" />
            </span>
            Upcoming bookings
          </CardTitle>
          <CardDescription>Next 1–3 gigs by start time.</CardDescription>
          {data.upcomingBookings.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--color-ink-muted)]">
              No upcoming bookings.{" "}
              <Link href="/dashboard/participant/gigs" className="font-medium text-[var(--color-gold)] hover:underline">
                Browse gigs
              </Link>
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {data.upcomingBookings.map((b) => (
                <li key={b.bookingId}>
                  <Link
                    href={`/dashboard/participant/bookings/${b.bookingId}`}
                    className="block rounded-lg border border-[var(--color-border)] bg-white p-3 transition-colors hover:bg-[var(--color-page)]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium text-[var(--color-ink)]">{b.gigTitle}</span>
                      <span className="pill-gold capitalize">{b.status}</span>
                    </div>
                    <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                      {b.startTime ? formatDisplayDateTime(b.startTime) : "—"}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/dashboard/participant/bookings"
            className="mt-4 inline-flex items-center text-sm font-medium text-[var(--color-gold)] hover:underline"
          >
            All bookings
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Card>

        <Card>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-page)]">
              <FileCheck className="h-4 w-4 text-[var(--color-ink-muted)]" />
            </span>
            Application pipeline
          </CardTitle>
          <CardDescription>Pending, accepted, rejected.</CardDescription>
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div style={{ textAlign: "center", padding: "8px" }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "var(--color-warning-light)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 8px",
                }}
              >
                <Clock size={16} color="var(--color-warning)" />
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 600,
                  color: "var(--color-warning)",
                }}
              >
                {data.applicationCounts.pending}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--color-ink-muted)",
                  marginTop: 4,
                }}
              >
                PENDING
              </div>
            </div>
            <div style={{ textAlign: "center", padding: "8px" }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "var(--color-green-light)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 8px",
                }}
              >
                <CheckCircle size={16} color="var(--color-green)" />
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 600,
                  color: "var(--color-green)",
                }}
              >
                {data.applicationCounts.accepted}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--color-ink-muted)",
                  marginTop: 4,
                }}
              >
                ACCEPTED
              </div>
            </div>
            <div style={{ textAlign: "center", padding: "8px" }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "#F9F8F5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 8px",
                }}
              >
                <XCircle size={16} color="var(--color-ink-muted)" />
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 600,
                  color: "var(--color-ink-muted)",
                }}
              >
                {data.applicationCounts.rejected}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--color-ink-muted)",
                  marginTop: 4,
                }}
              >
                REJECTED
              </div>
            </div>
          </div>
          <div className="mt-4">
            <ButtonLink href="/dashboard/participant/applications" variant="secondary" size="sm">
              View applications
            </ButtonLink>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div
          style={{
            background: "white",
            borderRadius: 14,
            border: "0.5px solid var(--color-border)",
            overflow: "hidden",
          }}
        >
          <div
            style={{ height: 3, background: "linear-gradient(90deg, #C8973A, #D4A843, #A07828)" }}
          />

          <div style={{ padding: "20px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    background: "var(--color-gold-light)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <DollarSign size={14} color="var(--color-gold)" />
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-ink)" }}>
                  Earnings
                </div>
              </div>
              <span
                style={{
                  padding: "3px 10px",
                  borderRadius: 20,
                  fontSize: 10,
                  fontWeight: 500,
                  background: "#F4F3EF",
                  border: "0.5px solid var(--color-border)",
                  color: "var(--color-ink-muted)",
                }}
              >
                Record only — payments coming soon
              </span>
            </div>

            <div style={{ marginBottom: 18 }}>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--color-ink-muted)",
                  marginBottom: 4,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  fontWeight: 500,
                }}
              >
                Expected this month
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--color-ink-muted)",
                    marginBottom: 2,
                  }}
                >
                  J$
                </span>
                <span
                  style={{
                    fontSize: 36,
                    fontWeight: 700,
                    color: "var(--color-ink)",
                    fontVariantNumeric: "tabular-nums",
                    lineHeight: 1,
                  }}
                >
                  {expectedEarnings > 0 ? expectedEarnings.toLocaleString() : "0"}
                </span>
              </div>
            </div>

            <div style={{ borderTop: "0.5px solid var(--color-border)", margin: "0 0 14px" }} />

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {[
                {
                  label: "Expected",
                  value:
                    expectedEarnings > 0 ? `J$${expectedEarnings.toLocaleString()}` : "—",
                  sub: `${acceptedBookings} gig${acceptedBookings !== 1 ? "s" : ""}`,
                  color: "var(--color-gold)",
                  bg: "var(--color-gold-light)",
                  border: "var(--color-gold-border)",
                },
                {
                  label: "Pending confirm",
                  value: pendingEarnings > 0 ? `J$${pendingEarnings.toLocaleString()}` : "—",
                  sub: "awaiting payment",
                  color: "var(--color-warning)",
                  bg: "#FFFBEB",
                  border: "rgba(217,119,6,0.2)",
                },
                {
                  label: "Lifetime total",
                  value: lifetimeEarnings > 0 ? `J$${lifetimeEarnings.toLocaleString()}` : "—",
                  sub: `${gigsCompleted} completed`,
                  color: "var(--color-green)",
                  bg: "var(--color-green-light)",
                  border: "var(--color-green-border)",
                },
              ].map(({ label, value, sub, color, bg, border }) => (
                <div
                  key={label}
                  style={{
                    background: bg,
                    borderRadius: 8,
                    border: `0.5px solid ${border}`,
                    padding: "10px 12px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: "var(--color-ink-muted)",
                      marginBottom: 5,
                      fontWeight: 500,
                    }}
                  >
                    {label}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color, marginBottom: 2 }}>
                    {value}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--color-ink-hint)" }}>{sub}</div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: 14,
                padding: "10px 12px",
                background: "#FAFAF8",
                borderRadius: 8,
                border: "0.5px solid var(--color-border)",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12,
                color: "var(--color-ink-muted)",
              }}
            >
              <Sparkles size={12} color="var(--color-gold)" />
              Full payment escrow and direct payout features coming soon
            </div>
          </div>
        </div>

        <div>
          {completionPct < 100 && (
            <div
              style={{
                background: "linear-gradient(135deg, #1A1D23 0%, #2A2D35 100%)",
                borderRadius: 12,
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                marginBottom: 20,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: "rgba(200,151,58,0.15)",
                    border: "1px solid rgba(200,151,58,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Sparkles size={20} color="#C8973A" />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: "#F5F4F0",
                      marginBottom: 3,
                    }}
                  >
                    {completionPct >= 80
                      ? "Your profile is almost complete"
                      : "Build your profile with Ros, your AI assistant"}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                    {completionPct >= 80
                      ? "Almost there — just a few things left to complete"
                      : completionPct >= 50
                        ? "Good progress — Ros can help you finish your profile"
                        : "Takes 2 minutes · Writes your bio, sets your skills, recommends your first cert"}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRosOpen(true)}
                style={{
                  padding: "10px 20px",
                  borderRadius: 8,
                  background: "#C8973A",
                  color: "white",
                  fontWeight: 600,
                  fontSize: 13,
                  border: "none",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {completionPct >= 80 ? "Finish with Ros →" : "Set up profile →"}
              </button>
            </div>
          )}
          {completionPct === 100 && (
            <div
              style={{
                background: "linear-gradient(135deg, #16A34A 0%, #15803D 100%)",
                borderRadius: 12,
                padding: "16px 24px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <CheckCircle size={20} color="white" />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "white",
                    marginBottom: 2,
                  }}
                >
                  Profile complete — you&apos;re visible to merchants
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
                  Complete verification to unlock more gig opportunities
                </div>
              </div>
            </div>
          )}
          <div style={{ marginBottom: 20 }}>
            <ParticipantReputationCard
              reputationScore={data.reputationScore}
              averageRating={data.averageRating}
              totalRatings={data.totalRatings}
              isVerified={data.verified}
              gigsCompleted={data.gigsCompleted}
            />
          </div>
          <ProfileStatusCard data={data} />
        </div>
      </div>

      <Card>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-[var(--color-ink-muted)]" />
          Safety
        </CardTitle>
        <CardDescription>Quick actions and recent alerts.</CardDescription>
        <div className="mt-4 flex flex-wrap gap-3">
          <ButtonLink href="/dashboard/participant/safety" variant="safety" size="sm">
            <AlertCircle className="mr-2 h-4 w-4" />
            Report issue
          </ButtonLink>
          <ButtonLink href="/dashboard/participant/bookings" variant="secondary" size="sm">
            Share gig details
          </ButtonLink>
        </div>
        {data.reportOutcomes.length > 0 && (
          <div className="mt-4 surface-card p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">
              Recent alerts summary
            </p>
            <p className="mt-1 text-sm text-[var(--color-ink)]">
              {data.reportOutcomes.length} report outcome
              {data.reportOutcomes.length !== 1 ? "s" : ""} (resolved/dismissed). View in Safety.
            </p>
          </div>
        )}
      </Card>

      <Card>
        <CardTitle className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-page)]">
            <MessageCircle className="h-4 w-4 text-[var(--color-ink-muted)]" />
          </span>
          Recent chats
        </CardTitle>
        <CardDescription>Last 3 active chats.</CardDescription>
        {data.recentChats.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--color-ink-muted)]">
            No chats yet. Start from a gig you applied to.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {data.recentChats.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/dashboard/participant/chats/${c.id}`}
                  className="block rounded-lg border border-[var(--color-border)] bg-white p-3 font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-page)]"
                >
                  {c.gigTitle}
                  <span className="ml-2 text-xs font-normal text-[var(--color-ink-muted)]">
                    {formatShortDate(c.created_at)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link
          href="/dashboard/participant/chats"
          className="mt-4 inline-flex items-center text-sm font-medium text-[var(--color-gold)] hover:underline"
        >
          All chats
          <ChevronRight className="h-4 w-4" />
        </Link>
      </Card>

      <OnboardingDrawer open={rosOpen} onClose={() => setRosOpen(false)} />
    </div>
  );
}
