import Link from "next/link";
import {
  BadgeCheck,
  Building2,
  Calendar,
  CreditCard,
  Sparkles,
  User,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { getVerificationDetail } from "@/app/dashboard/admin/actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { VerificationActions } from "../VerificationActions";
import { ZoomableImage } from "./ZoomableImage";
import {
  VerificationAiAnalysis,
  type AiVerificationAnalysis,
} from "./VerificationAiAnalysis";

function statusPill(status: string) {
  if (status === "approved") {
    return {
      bg: "var(--color-green-light)",
      border: "var(--color-green-border)",
      color: "var(--color-green)",
      label: "Approved",
    };
  }
  if (status === "rejected") {
    return {
      bg: "var(--color-danger-light)",
      border: "rgba(220,38,38,0.2)",
      color: "var(--color-danger)",
      label: "Rejected",
    };
  }
  return {
    bg: "var(--color-warning-light)",
    border: "rgba(217,119,6,0.3)",
    color: "var(--color-warning)",
    label: "Pending review",
  };
}

function aiVerdictPill(verdict: string | null) {
  if (!verdict) return null;
  if (verdict === "pass") {
    return {
      bg: "var(--color-green-light)",
      border: "var(--color-green-border)",
      color: "var(--color-green)",
      label: `AI: Pass`,
    };
  }
  if (verdict === "flag") {
    return {
      bg: "var(--color-danger-light)",
      border: "rgba(220,38,38,0.2)",
      color: "var(--color-danger)",
      label: `AI: Flag`,
    };
  }
  return {
    bg: "var(--color-gold-light)",
    border: "var(--color-gold-border)",
    color: "var(--color-warning)",
    label: `AI: Review`,
  };
}

export default async function AdminVerificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(ROLES.ADMIN);
  const { id } = await params;
  const detail = await getVerificationDetail(id);

  if (!detail) {
    return (
      <div className="page-bg space-y-6">
        <PageHeader
          icon={BadgeCheck}
          title="Verification not found"
          action={
            <Link
              href="/dashboard/admin/verifications"
              className="text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
            >
              ← Queue
            </Link>
          }
        />
        <p className="text-[var(--color-ink-muted)]">
          This verification may have been removed.
        </p>
      </div>
    );
  }

  const isParticipant = detail.type === "participant_id";
  const typeLabel = isParticipant ? "Participant ID" : "Merchant officer";
  const displayName = detail.userFullName?.trim() || "Unknown submitter";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const status = statusPill(detail.status);
  const aiPill = aiVerdictPill(detail.ai_verdict);
  const canReview =
    detail.status === "pending" || detail.status === "rejected";
  const submittedDate = new Date(detail.created_at).toLocaleDateString("en-JM", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const submittedTime = new Date(detail.created_at).toLocaleTimeString("en-JM", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="page-bg space-y-8">
      <PageHeader
        icon={BadgeCheck}
        title="Verification details"
        description={`${typeLabel} submission`}
        action={
          <Link
            href="/dashboard/admin/verifications"
            className="text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
          >
            ← Verification queue
          </Link>
        }
      />

      {/* Submitter hero */}
      <div
        style={{
          background: "white",
          border: `0.5px solid ${
            detail.ai_verdict === "flag"
              ? "rgba(220,38,38,0.3)"
              : "var(--color-border)"
          }`,
          borderLeft: `3px solid ${
            detail.ai_verdict === "flag"
              ? "var(--color-danger)"
              : detail.ai_verdict === "pass"
                ? "var(--color-green)"
                : "var(--color-gold)"
          }`,
          borderRadius: 12,
          padding: "20px 24px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: isParticipant ? "50%" : 10,
              background: isParticipant ? "var(--color-gold-light)" : "#EFF6FF",
              border: isParticipant
                ? "1px solid var(--color-gold-border)"
                : "1px solid #BFDBFE",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              fontWeight: 600,
              color: isParticipant ? "var(--color-gold)" : "#2563EB",
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: "var(--color-ink)",
                marginBottom: 8,
              }}
            >
              {displayName}
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 8,
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
                  background: isParticipant
                    ? "var(--color-gold-light)"
                    : "#EFF6FF",
                  border: `0.5px solid ${
                    isParticipant ? "var(--color-gold-border)" : "#BFDBFE"
                  }`,
                  color: isParticipant ? "var(--color-gold)" : "#2563EB",
                }}
              >
                {isParticipant ? (
                  <User size={11} />
                ) : (
                  <Building2 size={11} />
                )}
                {typeLabel}
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "3px 10px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 500,
                  background: status.bg,
                  border: `0.5px solid ${status.border}`,
                  color: status.color,
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "currentColor",
                  }}
                />
                {status.label}
              </span>
              {aiPill && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "3px 10px",
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 600,
                    background: aiPill.bg,
                    border: `0.5px solid ${aiPill.border}`,
                    color: aiPill.color,
                  }}
                >
                  <Sparkles size={10} />
                  {aiPill.label}
                  {detail.ai_confidence != null && (
                    <span style={{ fontWeight: 500, opacity: 0.85 }}>
                      · {detail.ai_confidence}%
                    </span>
                  )}
                </span>
              )}
            </div>
            <div
              style={{
                marginTop: 10,
                fontSize: 12,
                color: "var(--color-ink-muted)",
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                alignItems: "center",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Calendar size={12} />
                Submitted {submittedDate} at {submittedTime}
              </span>
            </div>
          </div>
        </div>

        {canReview && (
          <VerificationActions verificationId={detail.id} variant="detail" />
        )}
      </div>

      {/* Documents */}
      <div className="grid gap-6 md:grid-cols-2">
        <div
          style={{
            background: "white",
            border: "0.5px solid var(--color-border)",
            borderRadius: 12,
            padding: "20px 24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 6,
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
              <CreditCard size={15} color="var(--color-gold)" />
            </div>
            <div>
              <h2
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--color-ink)",
                }}
              >
                ID document
              </h2>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--color-ink-muted)",
                  marginTop: 2,
                }}
              >
                Compare with the selfie before approving
              </p>
            </div>
          </div>
          {detail.idDocSignedUrl ? (
            <ZoomableImage src={detail.idDocSignedUrl} alt="ID document" />
          ) : (
            <p
              style={{
                marginTop: 16,
                fontSize: 13,
                color: "var(--color-ink-muted)",
                padding: "24px",
                textAlign: "center",
                background: "#FAFAF8",
                borderRadius: 8,
                border: "0.5px solid var(--color-border)",
              }}
            >
              No ID document uploaded
            </p>
          )}
        </div>

        <div
          style={{
            background: "white",
            border: "0.5px solid var(--color-border)",
            borderRadius: 12,
            padding: "20px 24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 6,
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
              <User size={15} color="var(--color-gold)" />
            </div>
            <div>
              <h2
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--color-ink)",
                }}
              >
                Selfie
              </h2>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--color-ink-muted)",
                  marginTop: 2,
                }}
              >
                Should match the person on the ID
              </p>
            </div>
          </div>
          {detail.selfieSignedUrl ? (
            <ZoomableImage src={detail.selfieSignedUrl} alt="Selfie" />
          ) : (
            <p
              style={{
                marginTop: 16,
                fontSize: 13,
                color: "var(--color-ink-muted)",
                padding: "24px",
                textAlign: "center",
                background: "#FAFAF8",
                borderRadius: 8,
                border: "0.5px solid var(--color-border)",
              }}
            >
              {isParticipant
                ? "No selfie uploaded"
                : "Not required for merchant officer verification"}
            </p>
          )}
        </div>
      </div>

      {(canReview || detail.ai_verdict || detail.ai_analysis) && (
        <section className="space-y-4">
          <VerificationAiAnalysis
            verificationId={detail.id}
            initialAnalysis={
              detail.ai_analysis as AiVerificationAnalysis | null
            }
          />
          {canReview && isParticipant && (
            <div
              style={{
                background: "var(--color-gold-light)",
                border: "0.5px solid var(--color-gold-border)",
                borderRadius: 10,
                padding: "12px 16px",
                fontSize: 13,
                color: "var(--color-ink)",
                lineHeight: 1.5,
              }}
            >
              Approving will set this selfie as the participant&apos;s profile
              photo.
            </div>
          )}
        </section>
      )}

      {detail.status === "approved" && (
        <div
          style={{
            background: "var(--color-green-light)",
            border: "0.5px solid var(--color-green-border)",
            borderRadius: 12,
            padding: "16px 20px",
            fontSize: 13,
            color: "var(--color-green)",
          }}
        >
          This verification has been approved.
        </div>
      )}
    </div>
  );
}
