"use client";

import { useState } from "react";
import Link from "next/link";
import MobileParticipantShell from "./MobileParticipantShell";
import EmptyState from "@/components/ui/EmptyState";
import { respondToInvitation } from "@/app/dashboard/merchant/gigs/[id]/invitation-actions";
import {
  Mail,
  CheckCircle,
  XCircle,
  MapPin,
  DollarSign,
  CalendarCheck,
  Sparkles,
  ChevronDown,
} from "lucide-react";

type GigEmbed = {
  id: string;
  title: string;
  location_general: string | null;
  pay_rate: number | null;
  start_time: string | null;
};

export type MobileInvitationItem = {
  id: string;
  status: string;
  message: string | null;
  match_score: number | null;
  merchant_user_id: string;
  businessName: string;
  gigs: GigEmbed | GigEmbed[] | null;
};

function unwrapGig(gigs: MobileInvitationItem["gigs"]): GigEmbed | null {
  if (!gigs) return null;
  return Array.isArray(gigs) ? gigs[0] ?? null : gigs;
}

function statusBorder(status: string) {
  if (status === "accepted") return "var(--color-green)";
  if (status === "declined") return "var(--color-danger)";
  return "var(--color-gold)";
}

export default function MobileInvitationsList({
  invitations,
}: {
  invitations: MobileInvitationItem[];
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <MobileParticipantShell title="Invitations">
      {invitations.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="No invitations yet"
          description="Merchants will invite you when your profile matches their gigs"
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {invitations.map((inv) => {
            const gig = unwrapGig(inv.gigs);
            const expanded = expandedId === inv.id;
            const isPending = inv.status === "pending";

            return (
              <div
                key={inv.id}
                style={{
                  background: "white",
                  borderRadius: 12,
                  border: "0.5px solid var(--color-border)",
                  borderLeft: `3px solid ${statusBorder(inv.status)}`,
                  overflow: "hidden",
                }}
              >
                {isPending && (
                  <div style={{ height: 3, background: "linear-gradient(90deg, #C8973A, #D4A843)" }} />
                )}
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : inv.id)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "14px 16px",
                    minHeight: 48,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 600,
                          color: "var(--color-ink)",
                          marginBottom: 4,
                        }}
                      >
                        {gig?.title ?? "Gig"}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--color-ink-muted)" }}>
                        {inv.businessName}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      {inv.match_score != null && inv.match_score > 0 && (
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: 20,
                            fontSize: 10,
                            fontWeight: 600,
                            background: "var(--color-gold-light)",
                            border: "0.5px solid var(--color-gold-border)",
                            color: "var(--color-gold)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <Sparkles size={9} /> {inv.match_score}%
                        </span>
                      )}
                      {isPending && (
                        <ChevronDown
                          size={18}
                          color="var(--color-ink-hint)"
                          style={{
                            transform: expanded ? "rotate(180deg)" : "none",
                            transition: "transform 0.2s",
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {gig && (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 10,
                        marginTop: 10,
                      }}
                    >
                      {gig.location_general && (
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 12,
                            color: "var(--color-ink-muted)",
                          }}
                        >
                          <MapPin size={12} /> {gig.location_general}
                        </span>
                      )}
                      {gig.pay_rate != null && (
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 12,
                            fontWeight: 600,
                            color: "var(--color-ink)",
                          }}
                        >
                          <DollarSign size={12} color="var(--color-gold)" /> J$
                          {gig.pay_rate.toLocaleString()}/hr
                        </span>
                      )}
                      {gig.start_time && (
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 12,
                            color: "var(--color-ink-muted)",
                          }}
                        >
                          <CalendarCheck size={12} />
                          {new Date(gig.start_time).toLocaleDateString("en-JM", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      )}
                    </div>
                  )}

                  {inv.message && (
                    <div
                      style={{
                        marginTop: 10,
                        fontSize: 12,
                        color: "var(--color-ink-muted)",
                        fontStyle: "italic",
                        lineHeight: 1.5,
                      }}
                    >
                      &ldquo;{inv.message}&rdquo;
                    </div>
                  )}
                </button>

                {isPending && expanded && gig && (
                  <div
                    style={{
                      padding: "0 16px 16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                      borderTop: "0.5px solid var(--color-border)",
                    }}
                  >
                    <form action={respondToInvitation}>
                      <input type="hidden" name="invitationId" value={inv.id} />
                      <input type="hidden" name="response" value="accepted" />
                      <button
                        type="submit"
                        style={{
                          width: "100%",
                          minHeight: 48,
                          borderRadius: 10,
                          fontSize: 14,
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
                        <CheckCircle size={16} /> Accept invitation
                      </button>
                    </form>
                    <form action={respondToInvitation}>
                      <input type="hidden" name="invitationId" value={inv.id} />
                      <input type="hidden" name="response" value="declined" />
                      <button
                        type="submit"
                        style={{
                          width: "100%",
                          minHeight: 48,
                          borderRadius: 10,
                          fontSize: 14,
                          fontWeight: 600,
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
                        <XCircle size={16} /> Decline
                      </button>
                    </form>
                    <Link
                      href={`/dashboard/participant/gigs/${gig.id}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: 44,
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 500,
                        border: "0.5px solid var(--color-border)",
                        background: "white",
                        color: "var(--color-ink)",
                        textDecoration: "none",
                      }}
                    >
                      View gig →
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </MobileParticipantShell>
  );
}
