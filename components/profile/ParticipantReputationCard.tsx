import Link from "next/link";
import { TrendingUp, Star, ShieldCheck, ShieldAlert } from "lucide-react";

export type ParticipantReputationCardProps = {
  reputationScore: number;
  averageRating: number | null;
  totalRatings: number;
  isVerified: boolean;
  gigsCompleted: number;
};

export function ParticipantReputationCard({
  reputationScore,
  averageRating,
  totalRatings,
  isVerified,
  gigsCompleted,
}: ParticipantReputationCardProps) {
  const ratingValue = averageRating ?? 0;
  const displayRating = ratingValue > 0 ? Number(ratingValue).toFixed(1) : "—";

  return (
    <div
      style={{
        background: "white",
        border: "0.5px solid var(--color-border)",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: 3,
          background: "linear-gradient(90deg, #C8973A, #D4A843, #A07828)",
        }}
      />

      <div style={{ padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
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
            <TrendingUp size={14} color="var(--color-gold)" aria-hidden />
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-ink)" }}>
            Reputation
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginBottom: 10 }}>
          <div
            style={{
              fontSize: 42,
              fontWeight: 700,
              lineHeight: 1,
              color:
                reputationScore >= 700
                  ? "var(--color-green)"
                  : reputationScore >= 400
                    ? "var(--color-gold)"
                    : "var(--color-ink)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {reputationScore}
          </div>
          <div style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 10, color: "var(--color-ink-hint)", marginBottom: 2 }}>
              out of 1000
            </div>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "2px 9px",
                borderRadius: 20,
                fontSize: 10,
                fontWeight: 600,
                background:
                  reputationScore >= 700
                    ? "var(--color-green-light)"
                    : reputationScore >= 400
                      ? "var(--color-gold-light)"
                      : "#F4F3EF",
                border: `0.5px solid ${
                  reputationScore >= 700
                    ? "var(--color-green-border)"
                    : reputationScore >= 400
                      ? "var(--color-gold-border)"
                      : "var(--color-border)"
                }`,
                color:
                  reputationScore >= 700
                    ? "var(--color-green)"
                    : reputationScore >= 400
                      ? "var(--color-gold)"
                      : "var(--color-ink-muted)",
              }}
            >
              {reputationScore >= 700
                ? "⚡ Elite"
                : reputationScore >= 400
                  ? "★ Established"
                  : "↑ Rising"}
            </span>
          </div>
        </div>

        <div style={{ position: "relative", marginBottom: 6 }}>
          <div
            style={{
              height: 6,
              background: "#F0EEE8",
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: 6,
                borderRadius: 4,
                width: `${(reputationScore / 1000) * 100}%`,
                background:
                  reputationScore >= 700
                    ? "var(--color-green)"
                    : reputationScore >= 400
                      ? "var(--color-gold)"
                      : "#C8973A",
                transition: "width 0.6s ease",
              }}
            />
          </div>
          {[40, 70].map((pct) => (
            <div
              key={pct}
              style={{
                position: "absolute",
                top: 0,
                left: `${pct}%`,
                width: 1,
                height: 6,
                background: "rgba(255,255,255,0.8)",
              }}
            />
          ))}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <span style={{ fontSize: 9, color: "var(--color-ink-hint)" }}>0</span>
          <span style={{ fontSize: 9, color: "var(--color-ink-hint)", marginLeft: "32%" }}>
            Established
          </span>
          <span style={{ fontSize: 9, color: "var(--color-ink-hint)" }}>Elite</span>
          <span style={{ fontSize: 9, color: "var(--color-ink-hint)" }}>1000</span>
        </div>

        <div style={{ borderTop: "0.5px solid var(--color-border)", margin: "0 0 14px" }} />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 8,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              background: "#FAFAF8",
              borderRadius: 8,
              border: "0.5px solid var(--color-border)",
              padding: "8px 10px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 10,
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
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
              }}
            >
              <Star size={12} color="var(--color-gold)" fill="var(--color-gold)" aria-hidden />
              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--color-ink)" }}>
                {displayRating}
              </span>
            </div>
            <div style={{ fontSize: 10, color: "var(--color-ink-hint)", marginTop: 2 }}>
              {totalRatings} {totalRatings === 1 ? "review" : "reviews"}
            </div>
          </div>

          <div
            style={{
              background: isVerified ? "var(--color-green-light)" : "var(--color-warning-light)",
              borderRadius: 8,
              border: `0.5px solid ${
                isVerified ? "var(--color-green-border)" : "rgba(217,119,6,0.3)"
              }`,
              padding: "8px 10px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--color-ink-muted)",
                marginBottom: 4,
              }}
            >
              ID Check
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
              }}
            >
              {isVerified ? (
                <ShieldCheck size={14} color="var(--color-green)" aria-hidden />
              ) : (
                <ShieldAlert size={14} color="var(--color-warning)" aria-hidden />
              )}
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: isVerified ? "var(--color-green)" : "var(--color-warning)",
                }}
              >
                {isVerified ? "Verified" : "Pending"}
              </span>
            </div>
            {!isVerified && (
              <Link
                href="/dashboard/participant/verification"
                style={{
                  fontSize: 10,
                  color: "var(--color-warning)",
                  textDecoration: "none",
                  display: "block",
                  marginTop: 2,
                }}
              >
                Verify now →
              </Link>
            )}
          </div>

          <div
            style={{
              background: "#FAFAF8",
              borderRadius: 8,
              border: "0.5px solid var(--color-border)",
              padding: "8px 10px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--color-ink-muted)",
                marginBottom: 4,
              }}
            >
              Gigs
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-ink)" }}>
              {gigsCompleted}
            </div>
            <div style={{ fontSize: 10, color: "var(--color-ink-hint)", marginTop: 2 }}>
              completed
            </div>
          </div>
        </div>

        {reputationScore === 0 && (
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
            <span style={{ fontWeight: 600, color: "var(--color-ink)" }}>
              How to build your score:{" "}
            </span>
            Complete gigs, earn 5-star ratings, and get verified to climb toward Elite status.
          </div>
        )}
      </div>
    </div>
  );
}
