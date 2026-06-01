"use client";

import { useMediaQuery } from "@/hooks/useMediaQuery";
import MobileInvitationsList, {
  type MobileInvitationItem,
} from "@/components/mobile/participant/MobileInvitationsList";
import Link from "next/link";
import {
  Mail,
  CheckCircle,
  XCircle,
  MapPin,
  DollarSign,
  CalendarCheck,
  Sparkles,
} from "lucide-react";
import { respondToInvitation } from "@/app/dashboard/merchant/gigs/[id]/invitation-actions";
import { PageHeader } from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";

type GigEmbed = {
  id: string;
  title: string;
  location_general: string | null;
  pay_rate: number | null;
  start_time: string | null;
  end_time: string | null;
  duties: unknown;
};

type InvitationRow = {
  id: string;
  status: string;
  message: string | null;
  match_score: number | null;
  merchant_user_id: string;
  gigs: GigEmbed | GigEmbed[] | null;
};

function unwrapGig(gigs: InvitationRow["gigs"]): GigEmbed | null {
  if (!gigs) return null;
  return Array.isArray(gigs) ? gigs[0] ?? null : gigs;
}

export function ParticipantInvitationsPageView({
  invitations,
  businessByMerchant,
}: {
  invitations: InvitationRow[];
  businessByMerchant: Record<string, string>;
}) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const mobileItems: MobileInvitationItem[] = invitations.map((inv) => ({
    id: inv.id,
    status: inv.status,
    message: inv.message,
    match_score: inv.match_score,
    merchant_user_id: inv.merchant_user_id,
    businessName: businessByMerchant[inv.merchant_user_id] ?? "Unknown merchant",
    gigs: inv.gigs,
  }));

  if (isMobile) {
    return <MobileInvitationsList invitations={mobileItems} />;
  }

  return (
    <div className="page-bg space-y-8">
      <PageHeader
        icon={Mail}
        title="Invitations"
        description="Gig invitations from merchants"
      />

      {!invitations.length ? (
        <EmptyState
          icon={Mail}
          title="No invitations yet"
          description="Merchants will invite you when your profile matches their gigs"
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {invitations.map((inv) => {
            const gig = unwrapGig(inv.gigs);
            const businessName =
              businessByMerchant[inv.merchant_user_id] ?? "Unknown merchant";
            const statusBorder =
              inv.status === "accepted"
                ? "var(--color-green)"
                : inv.status === "declined"
                  ? "var(--color-danger)"
                  : "var(--color-gold)";

            return (
              <div
                key={inv.id}
                style={{
                  background: "white",
                  border: "0.5px solid var(--color-border)",
                  borderLeft: `3px solid ${statusBorder}`,
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                {inv.status === "pending" && (
                  <div
                    style={{
                      height: 3,
                      background: "linear-gradient(90deg, #C8973A, #D4A843)",
                    }}
                  />
                )}
                <div style={{ padding: "20px 24px" }}>
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
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 600,
                          color: "var(--color-ink)",
                          marginBottom: 4,
                        }}
                      >
                        {gig?.title ?? "Gig"}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--color-ink-muted)" }}>
                        Invited by <strong>{businessName}</strong>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        flexShrink: 0,
                        flexWrap: "wrap",
                        justifyContent: "flex-end",
                      }}
                    >
                      {inv.match_score != null && inv.match_score > 0 && (
                        <div
                          style={{
                            padding: "4px 12px",
                            borderRadius: 20,
                            fontSize: 12,
                            fontWeight: 600,
                            background: "var(--color-gold-light)",
                            border: "0.5px solid var(--color-gold-border)",
                            color: "var(--color-gold)",
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <Sparkles size={10} /> {inv.match_score}% match
                        </div>
                      )}
                      <span
                        style={{
                          padding: "4px 12px",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 500,
                          background:
                            inv.status === "accepted"
                              ? "var(--color-green-light)"
                              : inv.status === "declined"
                                ? "var(--color-danger-light)"
                                : "var(--color-warning-light)",
                          border: `0.5px solid ${
                            inv.status === "accepted"
                              ? "var(--color-green-border)"
                              : inv.status === "declined"
                                ? "rgba(220,38,38,0.2)"
                                : "rgba(217,119,6,0.3)"
                          }`,
                          color:
                            inv.status === "accepted"
                              ? "var(--color-green)"
                              : inv.status === "declined"
                                ? "var(--color-danger)"
                                : "var(--color-warning)",
                        }}
                      >
                        {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {gig && (
                    <div
                      style={{
                        display: "flex",
                        gap: 16,
                        flexWrap: "wrap",
                        marginBottom: 16,
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
                            year: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                  )}

                  {inv.message && (
                    <div
                      style={{
                        background: "#FAFAF8",
                        border: "0.5px solid var(--color-border)",
                        borderRadius: 8,
                        padding: "10px 14px",
                        fontSize: 13,
                        color: "var(--color-ink)",
                        fontStyle: "italic",
                        marginBottom: 16,
                      }}
                    >
                      &ldquo;{inv.message}&rdquo;
                    </div>
                  )}

                  {inv.status === "pending" && gig && (
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <form action={respondToInvitation}>
                        <input type="hidden" name="invitationId" value={inv.id} />
                        <input type="hidden" name="response" value="accepted" />
                        <button
                          type="submit"
                          style={{
                            padding: "9px 20px",
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 600,
                            background: "var(--color-green)",
                            color: "white",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <CheckCircle size={13} /> Accept invitation
                        </button>
                      </form>
                      <form action={respondToInvitation}>
                        <input type="hidden" name="invitationId" value={inv.id} />
                        <input type="hidden" name="response" value="declined" />
                        <button
                          type="submit"
                          style={{
                            padding: "9px 20px",
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 500,
                            background: "var(--color-danger-light)",
                            color: "var(--color-danger)",
                            border: "0.5px solid rgba(220,38,38,0.2)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <XCircle size={13} /> Decline
                        </button>
                      </form>
                      <Link
                        href={`/dashboard/participant/gigs/${gig.id}`}
                        style={{
                          padding: "9px 20px",
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: 500,
                          border: "0.5px solid var(--color-border)",
                          background: "white",
                          color: "var(--color-ink)",
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        View gig →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
