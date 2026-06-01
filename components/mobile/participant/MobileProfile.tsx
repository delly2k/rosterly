"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import MobileParticipantShell from "./MobileParticipantShell";
import { ProfileForm } from "@/app/dashboard/participant/profile/ProfileForm";
import {
  Star,
  ShieldCheck,
  ShieldAlert,
  TrendingUp,
  Edit,
  Settings,
  LogOut,
  Mail,
  Shield,
  Award,
  MessageCircle,
} from "lucide-react";
import { CertPill } from "@/components/ui/CertPill";
import type { ParticipantCertificate } from "@/lib/academy";
import { badgeColorToVariant } from "@/lib/academy";

type ParticipantProfile = {
  full_name: string | null;
  location_general: string | null;
  bio: string | null;
  skills: unknown;
  user_id?: string;
  updated_at?: string | null;
  disclaimer_accepted_at?: string | null;
  photo_url?: string | null;
  availability?: unknown;
  rate?: number | null;
  emergency_contact?: string | null;
};

function parseSkills(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((s): s is string => typeof s === "string" && s.trim().length > 0);
}

export default function MobileProfile({
  participant,
  identityLocked,
  nameEditable,
  completionPct,
  missingFields,
  reputationScore,
  averageRating,
  totalRatings,
  gigsCompleted,
  isVerified,
  certifications = [],
}: {
  participant: ParticipantProfile | null;
  identityLocked: boolean;
  nameEditable: boolean;
  completionPct: number;
  missingFields: string[];
  reputationScore: number;
  averageRating: number | null;
  totalRatings: number;
  gigsCompleted: number;
  isVerified: boolean;
  certifications?: ParticipantCertificate[];
}) {
  const searchParams = useSearchParams();
  const editMode = searchParams.get("edit") === "1";
  const skills = parseSkills(participant?.skills);

  const initials =
    participant?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "??";

  if (editMode) {
    return (
      <MobileParticipantShell title="Edit profile">
        <div style={{ padding: "0 2px" }}>
          <ProfileForm
            key={`${participant?.user_id ?? "new"}-${participant?.updated_at ?? ""}-${participant?.disclaimer_accepted_at ?? ""}`}
            initial={participant}
            identityLocked={identityLocked}
            nameEditable={nameEditable}
            completionPct={completionPct}
            missingFields={missingFields}
          />
        </div>
      </MobileParticipantShell>
    );
  }

  return (
    <MobileParticipantShell title="Profile">
      <div style={{ padding: "0 2px" }}>
        <div
          style={{
            background: "white",
            borderRadius: 14,
            border: "0.5px solid var(--color-border)",
            overflow: "hidden",
            marginBottom: 12,
          }}
        >
          <div style={{ height: 3, background: "linear-gradient(90deg, #C8973A, #D4A843)" }} />
          <div style={{ padding: "20px 16px", display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "rgba(200,151,58,0.15)",
                border: "2px solid rgba(200,151,58,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                fontWeight: 700,
                color: "#C8973A",
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--color-ink)" }}>
                {participant?.full_name ?? "Set your name"}
              </div>
              <div style={{ fontSize: 13, color: "var(--color-ink-muted)", marginTop: 2 }}>
                {participant?.location_general ?? "Location not set"}
              </div>
              <div style={{ marginTop: 6 }}>
                {isVerified ? (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "2px 8px",
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 500,
                      background: "var(--color-green-light)",
                      border: "0.5px solid var(--color-green-border)",
                      color: "var(--color-green)",
                    }}
                  >
                    <ShieldCheck size={10} /> Verified
                  </span>
                ) : (
                  <Link href="/dashboard/participant/verification" style={{ textDecoration: "none" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "2px 8px",
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 500,
                        background: "var(--color-warning-light)",
                        border: "0.5px solid rgba(217,119,6,0.3)",
                        color: "var(--color-warning)",
                      }}
                    >
                      <ShieldAlert size={10} /> Verify now →
                    </span>
                  </Link>
                )}
              </div>
            </div>
            <Link href="/dashboard/participant/profile?edit=1" style={{ flexShrink: 0 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: "#F4F3EF",
                  border: "0.5px solid var(--color-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 48,
                  minWidth: 48,
                }}
              >
                <Edit size={15} color="var(--color-ink-muted)" />
              </div>
            </Link>
          </div>

          {completionPct < 100 && (
            <div style={{ padding: "0 16px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: "var(--color-ink-muted)" }}>Profile complete</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-gold)" }}>
                  {completionPct}%
                </span>
              </div>
              <div style={{ height: 5, background: "#F0EEE8", borderRadius: 3, overflow: "hidden" }}>
                <div
                  style={{
                    height: 5,
                    background: "var(--color-gold)",
                    borderRadius: 3,
                    width: `${completionPct}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {certifications.length > 0 && (
          <div
            style={{
              background: "white",
              borderRadius: 12,
              border: "0.5px solid var(--color-border)",
              padding: "14px 16px",
              marginBottom: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <Award size={14} color="var(--color-gold)" />
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-ink)" }}>
                Certifications
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {certifications.map((cert) => (
                <CertPill
                  key={cert.id}
                  label={cert.levelSubtitle || cert.levelTitle}
                  variant={badgeColorToVariant(cert.badge_color)}
                  size="sm"
                />
              ))}
            </div>
          </div>
        )}

        <div
          style={{
            background: "white",
            borderRadius: 12,
            border: "0.5px solid var(--color-border)",
            padding: "14px 16px",
            marginBottom: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
            <TrendingUp size={14} color="var(--color-gold)" />
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-ink)" }}>Reputation</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: "var(--color-gold)" }}>
                {reputationScore}
              </div>
              <div style={{ fontSize: 10, color: "var(--color-ink-muted)", marginTop: 2 }}>Score</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: "var(--color-ink)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 3,
                }}
              >
                <Star size={14} color="var(--color-gold)" fill="var(--color-gold)" />
                {averageRating != null && averageRating > 0 ? Number(averageRating).toFixed(1) : "—"}
              </div>
              <div style={{ fontSize: 10, color: "var(--color-ink-muted)", marginTop: 2 }}>
                {totalRatings} reviews
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: "var(--color-ink)" }}>
                {gigsCompleted}
              </div>
              <div style={{ fontSize: 10, color: "var(--color-ink-muted)", marginTop: 2 }}>
                Gigs done
              </div>
            </div>
          </div>
        </div>

        {skills.length > 0 && (
          <div
            style={{
              background: "white",
              borderRadius: 12,
              border: "0.5px solid var(--color-border)",
              padding: "14px 16px",
              marginBottom: 12,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-ink)", marginBottom: 10 }}>
              Skills
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {skills.map((skill, i) => (
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

        {participant?.bio && (
          <div
            style={{
              background: "white",
              borderRadius: 12,
              border: "0.5px solid var(--color-border)",
              padding: "14px 16px",
              marginBottom: 12,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-ink)", marginBottom: 8 }}>
              About
            </div>
            <div style={{ fontSize: 13, color: "var(--color-ink-muted)", lineHeight: 1.7 }}>
              {participant.bio}
            </div>
          </div>
        )}

        <div
          style={{
            background: "white",
            borderRadius: 12,
            border: "0.5px solid var(--color-border)",
            overflow: "hidden",
            marginBottom: 12,
          }}
        >
          {[
            { href: "/dashboard/participant/chats", icon: MessageCircle, label: "Messages" },
            { href: "/dashboard/settings/account", icon: Settings, label: "Account settings" },
            { href: "/dashboard/participant/invitations", icon: Mail, label: "My invitations" },
            { href: "/dashboard/participant/safety", icon: Shield, label: "Safety hub" },
          ].map(({ href, icon: Icon, label }, i, arr) => (
            <Link
              key={href}
              href={href}
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 16px",
                minHeight: 48,
                borderBottom: i < arr.length - 1 ? "0.5px solid var(--color-border)" : "none",
              }}
            >
              <Icon size={18} color="var(--color-ink-muted)" />
              <span style={{ fontSize: 14, color: "var(--color-ink)", flex: 1 }}>{label}</span>
              <span style={{ color: "var(--color-ink-hint)", fontSize: 16 }}>›</span>
            </Link>
          ))}
        </div>

        <Link href="/api/auth/signout" style={{ textDecoration: "none", display: "block" }}>
          <div
            style={{
              background: "white",
              borderRadius: 12,
              border: "0.5px solid var(--color-border)",
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              minHeight: 48,
            }}
          >
            <LogOut size={18} color="var(--color-danger)" />
            <span style={{ fontSize: 14, color: "var(--color-danger)", fontWeight: 500 }}>
              Sign out
            </span>
          </div>
        </Link>
      </div>
    </MobileParticipantShell>
  );
}
