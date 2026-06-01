"use client";

import { useState, useCallback, useEffect } from "react";
import { Sparkles, ShieldCheck, AlertTriangle, CheckCircle, Loader } from "lucide-react";

export type AiVerificationAnalysis = {
  verdict?: "pass" | "review" | "flag";
  confidence?: number;
  recommendation?: string;
  id_document?: {
    detected_type?: string;
    text_visible?: boolean;
    appears_genuine?: boolean;
    anomalies?: string[];
  };
  selfie?: {
    face_clearly_visible?: boolean;
    good_lighting?: boolean;
    appears_genuine?: boolean;
    anomalies?: string[];
  };
  overall_anomalies?: string[];
};

export function VerificationAiAnalysis({
  verificationId,
  initialAnalysis,
}: {
  verificationId: string;
  initialAnalysis: AiVerificationAnalysis | null;
}) {
  const [aiAnalysis, setAiAnalysis] = useState<AiVerificationAnalysis | null>(
    initialAnalysis
  );
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    if (initialAnalysis) {
      setAiAnalysis(initialAnalysis);
      setAiLoading(false);
    }
  }, [initialAnalysis]);

  const runAiAnalysis = useCallback(async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/admin/verify-documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAiError(data.error ?? "Analysis failed");
        return;
      }
      if (data.analysis) setAiAnalysis(data.analysis);
    } finally {
      setAiLoading(false);
    }
  }, [verificationId]);

  const verdict = aiAnalysis?.verdict;

  return (
    <>
      <div
        style={{
          background: "white",
          border: `1px solid ${
            verdict === "pass"
              ? "var(--color-green-border)"
              : verdict === "flag"
                ? "rgba(220,38,38,0.3)"
                : "var(--color-gold-border)"
          }`,
          borderRadius: 12,
          overflow: "hidden",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            padding: "14px 20px",
            background:
              verdict === "pass"
                ? "var(--color-green-light)"
                : verdict === "flag"
                  ? "var(--color-danger-light)"
                  : "var(--color-gold-light)",
            borderBottom: "0.5px solid var(--color-border)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Sparkles
            size={16}
            color={
              verdict === "pass"
                ? "var(--color-green)"
                : verdict === "flag"
                  ? "var(--color-danger)"
                  : "var(--color-gold)"
            }
          />
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-ink)" }}>
            AI verification analysis
          </div>
          {aiLoading && (
            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                color: "var(--color-ink-muted)",
              }}
            >
              <Loader
                size={12}
                style={{ animation: "spin 1s linear infinite" }}
              />{" "}
              Analysing documents...
            </div>
          )}
          {aiAnalysis && !aiLoading && verdict && (
            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  padding: "3px 12px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  background:
                    verdict === "pass"
                      ? "var(--color-green)"
                      : verdict === "flag"
                        ? "var(--color-danger)"
                        : "var(--color-warning)",
                  color: "white",
                }}
              >
                {verdict === "pass"
                  ? "✓ Pass"
                  : verdict === "flag"
                    ? "⚠ Flag"
                    : "~ Review"}
              </span>
              {aiAnalysis.confidence != null && (
                <span style={{ fontSize: 11, color: "var(--color-ink-muted)" }}>
                  {aiAnalysis.confidence}% confidence
                </span>
              )}
            </div>
          )}
        </div>

        {aiLoading ? (
          <div
            style={{
              padding: "24px",
              textAlign: "center",
              color: "var(--color-ink-muted)",
              fontSize: 13,
            }}
          >
            Claude is reviewing the documents...
          </div>
        ) : aiError ? (
          <div
            style={{
              padding: "16px 20px",
              fontSize: 13,
              color: "var(--color-danger)",
            }}
          >
            {aiError}
            <button
              type="button"
              onClick={runAiAnalysis}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                marginTop: 12,
                padding: "6px 14px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 500,
                border: "0.5px solid var(--color-border)",
                background: "white",
                color: "var(--color-ink-muted)",
                cursor: "pointer",
              }}
            >
              <Sparkles size={11} /> Retry analysis
            </button>
          </div>
        ) : aiAnalysis ? (
          <div
            style={{
              padding: "16px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {aiAnalysis.recommendation && (
              <div
                style={{
                  background: "#FAFAF8",
                  borderRadius: 8,
                  border: "0.5px solid var(--color-border)",
                  padding: "12px 14px",
                  fontSize: 13,
                  color: "var(--color-ink)",
                  lineHeight: 1.6,
                }}
              >
                <span style={{ fontWeight: 600 }}>AI recommendation: </span>
                {aiAnalysis.recommendation}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
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
                  ID document
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {[
                    {
                      label: "Document type detected",
                      value: aiAnalysis.id_document?.detected_type,
                    },
                    {
                      label: "Text visible",
                      value: aiAnalysis.id_document?.text_visible,
                    },
                    {
                      label: "Appears genuine",
                      value: aiAnalysis.id_document?.appears_genuine,
                    },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontSize: 12,
                      }}
                    >
                      <span style={{ color: "var(--color-ink-muted)" }}>{label}</span>
                      {typeof value === "boolean" ? (
                        value ? (
                          <CheckCircle size={13} color="var(--color-green)" />
                        ) : (
                          <AlertTriangle size={13} color="var(--color-danger)" />
                        )
                      ) : (
                        <span
                          style={{
                            fontWeight: 500,
                            color: "var(--color-ink)",
                            textTransform: "capitalize",
                          }}
                        >
                          {value ?? "—"}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
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
                  Selfie photo
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {[
                    {
                      label: "Face clearly visible",
                      value: aiAnalysis.selfie?.face_clearly_visible,
                    },
                    {
                      label: "Good lighting",
                      value: aiAnalysis.selfie?.good_lighting,
                    },
                    {
                      label: "Appears genuine",
                      value: aiAnalysis.selfie?.appears_genuine,
                    },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontSize: 12,
                      }}
                    >
                      <span style={{ color: "var(--color-ink-muted)" }}>{label}</span>
                      {typeof value === "boolean" ? (
                        value ? (
                          <CheckCircle size={13} color="var(--color-green)" />
                        ) : (
                          <AlertTriangle size={13} color="var(--color-danger)" />
                        )
                      ) : (
                        <span style={{ fontWeight: 500, color: "var(--color-ink)" }}>
                          {value ?? "—"}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {(aiAnalysis.overall_anomalies?.length ?? 0) > 0 && (
              <div
                style={{
                  background: "var(--color-danger-light)",
                  border: "0.5px solid rgba(220,38,38,0.2)",
                  borderRadius: 8,
                  padding: "12px 14px",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--color-danger)",
                    marginBottom: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <AlertTriangle size={13} /> Anomalies detected
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {aiAnalysis.overall_anomalies!.map((anomaly, i) => (
                    <div
                      key={i}
                      style={{
                        fontSize: 12,
                        color: "var(--color-danger)",
                        display: "flex",
                        gap: 6,
                      }}
                    >
                      <span>·</span> {anomaly}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={runAiAnalysis}
              style={{
                alignSelf: "flex-start",
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "6px 14px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 500,
                border: "0.5px solid var(--color-border)",
                background: "white",
                color: "var(--color-ink-muted)",
                cursor: "pointer",
              }}
            >
              <Sparkles size={11} /> Re-run analysis
            </button>
          </div>
        ) : !aiLoading ? (
          <div
            style={{
              padding: "24px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "var(--color-gold-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sparkles size={20} color="var(--color-gold)" />
            </div>
            <div
              style={{ fontSize: 13, fontWeight: 600, color: "var(--color-ink)" }}
            >
              AI analysis not yet run
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--color-ink-muted)",
                maxWidth: 320,
              }}
            >
              Analysis runs automatically when a verification is submitted. You
              can trigger it manually below.
            </div>
            <button
              type="button"
              onClick={runAiAnalysis}
              style={{
                padding: "9px 20px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                background: "var(--color-gold)",
                color: "white",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Sparkles size={14} /> Run AI analysis
            </button>
          </div>
        ) : null}

        <div
          style={{
            padding: "10px 20px",
            borderTop: "0.5px solid var(--color-border)",
            fontSize: 11,
            color: "var(--color-ink-hint)",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <ShieldCheck size={11} />
          AI analysis is provisional. Admin approval is required to verify any
          account.
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
