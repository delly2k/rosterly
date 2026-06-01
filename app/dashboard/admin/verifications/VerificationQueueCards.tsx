import Link from "next/link";
import {
  BadgeCheck,
  Building2,
  MapPin,
  Eye,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import type {
  MerchantVerificationQueueRow,
  ParticipantVerificationQueueRow,
} from "@/app/dashboard/admin/actions";

function AiVerdictBadge({
  aiVerdict,
  aiConfidence,
}: {
  aiVerdict: string | null;
  aiConfidence: number | null;
}) {
  if (!aiVerdict) {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: "4px 10px",
          borderRadius: 20,
          fontSize: 10,
          fontWeight: 500,
          background: "#F4F3EF",
          border: "0.5px solid var(--color-border)",
          color: "var(--color-ink-hint)",
        }}
      >
        <Sparkles size={9} /> AI pending
      </span>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: "4px 12px",
          borderRadius: 20,
          fontSize: 11,
          fontWeight: 700,
          background:
            aiVerdict === "pass"
              ? "var(--color-green-light)"
              : aiVerdict === "flag"
                ? "var(--color-danger-light)"
                : "var(--color-warning-light)",
          border: `0.5px solid ${
            aiVerdict === "pass"
              ? "var(--color-green-border)"
              : aiVerdict === "flag"
                ? "rgba(220,38,38,0.2)"
                : "rgba(217,119,6,0.3)"
          }`,
          color:
            aiVerdict === "pass"
              ? "var(--color-green)"
              : aiVerdict === "flag"
                ? "var(--color-danger)"
                : "var(--color-warning)",
        }}
      >
        <Sparkles size={10} />
        AI: {aiVerdict.charAt(0).toUpperCase() + aiVerdict.slice(1)}
      </span>
      {aiConfidence != null && (
        <span style={{ fontSize: 10, color: "var(--color-ink-hint)" }}>
          {aiConfidence}% confidence
        </span>
      )}
    </div>
  );
}

function ReviewLink({ verificationId, aiVerdict }: { verificationId: string; aiVerdict: string | null }) {
  const flagged = aiVerdict === "flag";
  return (
    <Link
      href={`/dashboard/admin/verifications/${verificationId}`}
      style={{
        padding: "8px 16px",
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 600,
        background: flagged ? "var(--color-danger)" : "var(--color-gold)",
        color: "white",
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
      }}
    >
      {flagged ? <AlertTriangle size={12} /> : <Eye size={12} />}
      {flagged ? "Review now" : "Review"}
    </Link>
  );
}

function cardBorderStyles(aiVerdict: string | null) {
  return {
    border: `0.5px solid ${
      aiVerdict === "flag"
        ? "rgba(220,38,38,0.3)"
        : aiVerdict === "pass"
          ? "var(--color-green-border)"
          : "var(--color-border)"
    }`,
    borderLeft: `3px solid ${
      aiVerdict === "flag"
        ? "var(--color-danger)"
        : aiVerdict === "pass"
          ? "var(--color-green)"
          : aiVerdict === "review"
            ? "var(--color-warning)"
            : "var(--color-gold)"
    }`,
  };
}

function StatusPill({ status }: { status: string }) {
  const rejected = status === "rejected";
  return (
    <span
      style={{
        padding: "2px 8px",
        borderRadius: 20,
        fontSize: 10,
        fontWeight: 500,
        background: rejected ? "var(--color-danger-light)" : "var(--color-warning-light)",
        border: `0.5px solid ${
          rejected ? "rgba(220,38,38,0.2)" : "rgba(217,119,6,0.3)"
        }`,
        color: rejected ? "var(--color-danger)" : "var(--color-warning)",
      }}
    >
      {rejected ? "Rejected — re-review" : "Pending review"}
    </span>
  );
}

export function ParticipantVerificationSection({
  verifications,
}: {
  verifications: ParticipantVerificationQueueRow[];
}) {
  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: "var(--color-gold-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <BadgeCheck size={15} color="var(--color-gold)" />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-ink)" }}>
            Participant ID verification
          </div>
          <div style={{ fontSize: 12, color: "var(--color-ink-muted)" }}>
            {verifications.length} pending review
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginBottom: 32,
        }}
      >
        {verifications.length === 0 ? (
          <EmptyState
            icon={BadgeCheck}
            title="All clear"
            description="No pending participant verifications"
            variant="success"
          />
        ) : (
          verifications.map((v) => {
            const name = v.full_name ?? "Unknown participant";
            const initials = name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <div
                key={v.id}
                style={{
                  background: "white",
                  borderRadius: 12,
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  ...cardBorderStyles(v.ai_verdict),
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
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
                  }}
                >
                  {initials}
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
                      }}
                    >
                      {name}
                    </span>
                    <StatusPill status={v.status} />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    {v.location_general && (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 12,
                          color: "var(--color-ink-muted)",
                        }}
                      >
                        <MapPin size={11} /> {v.location_general}
                      </span>
                    )}
                    <span style={{ fontSize: 12, color: "var(--color-ink-muted)" }}>
                      Submitted{" "}
                      {new Date(v.created_at).toLocaleDateString("en-JM", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--color-ink-muted)" }}>
                      {new Date(v.created_at).toLocaleTimeString("en-JM", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                <div style={{ flexShrink: 0, textAlign: "center" }}>
                  <AiVerdictBadge
                    aiVerdict={v.ai_verdict}
                    aiConfidence={v.ai_confidence}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexShrink: 0,
                    alignItems: "center",
                  }}
                >
                  <ReviewLink verificationId={v.id} aiVerdict={v.ai_verdict} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

export function MerchantVerificationSection({
  verifications,
}: {
  verifications: MerchantVerificationQueueRow[];
}) {
  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: "var(--color-gold-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Building2 size={15} color="var(--color-gold)" />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-ink)" }}>
            Merchant business verification
          </div>
          <div style={{ fontSize: 12, color: "var(--color-ink-muted)" }}>
            {verifications.length} pending review
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {verifications.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="All clear"
            description="No pending merchant verifications"
            variant="success"
          />
        ) : (
          verifications.map((v) => {
            const name = v.business_name ?? "Unknown business";
            const initials = name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <div
                key={v.id}
                style={{
                  background: "white",
                  borderRadius: 12,
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  border: `0.5px solid ${
                    v.ai_verdict === "flag"
                      ? "rgba(220,38,38,0.3)"
                      : "var(--color-border)"
                  }`,
                  borderLeft: `3px solid ${
                    v.ai_verdict === "flag"
                      ? "var(--color-danger)"
                      : v.ai_verdict === "pass"
                        ? "var(--color-green)"
                        : v.ai_verdict === "review"
                          ? "var(--color-warning)"
                          : "#2563EB"
                  }`,
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    background: "#EFF6FF",
                    border: "1px solid #BFDBFE",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#2563EB",
                    flexShrink: 0,
                  }}
                >
                  {initials}
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
                      }}
                    >
                      {name}
                    </span>
                    <StatusPill status={v.status} />
                  </div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {v.business_type && (
                      <span
                        style={{
                          fontSize: 12,
                          color: "var(--color-ink-muted)",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Building2 size={11} /> {v.business_type}
                      </span>
                    )}
                    <span style={{ fontSize: 12, color: "var(--color-ink-muted)" }}>
                      Submitted{" "}
                      {new Date(v.created_at).toLocaleDateString("en-JM", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div style={{ flexShrink: 0, textAlign: "center" }}>
                  <AiVerdictBadge
                    aiVerdict={v.ai_verdict}
                    aiConfidence={v.ai_confidence}
                  />
                </div>

                <div style={{ flexShrink: 0 }}>
                  <ReviewLink verificationId={v.id} aiVerdict={v.ai_verdict} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
