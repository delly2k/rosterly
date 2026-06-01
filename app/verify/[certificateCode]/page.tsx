import { createClient } from "@/lib/supabase/server";
import { CheckCircle, XCircle } from "lucide-react";
import { formatShortDate } from "@/lib/formatDate";

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ certificateCode: string }>;
}) {
  const { certificateCode } = await params;
  const supabase = await createClient();

  const { data: cert } = await supabase
    .from("academy_certificates")
    .select("*, academy_levels(title, subtitle)")
    .eq("certificate_code", certificateCode)
    .maybeSingle();

  const { data: profile } = cert
    ? await supabase
        .from("participant_profiles")
        .select("full_name")
        .eq("user_id", cert.user_id)
        .maybeSingle()
    : { data: null };

  const isValid =
    !!cert && cert.is_valid && new Date(cert.expires_at) > new Date();
  const level = cert
    ? Array.isArray(cert.academy_levels)
      ? cert.academy_levels[0]
      : cert.academy_levels
    : null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F4F3EF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 16,
          padding: 40,
          maxWidth: 440,
          width: "100%",
          textAlign: "center",
          border: `2px solid ${isValid ? "var(--color-green)" : "var(--color-danger)"}`,
        }}
      >
        <div
          style={{
            fontSize: 22,
            fontStyle: "italic",
            fontFamily: "Georgia, serif",
            fontWeight: 700,
            color: "#C8973A",
            marginBottom: 24,
          }}
        >
          Roster<span style={{ color: "#1A1A1A" }}>ly</span>
        </div>

        {!cert ? (
          <>
            <XCircle
              size={48}
              color="var(--color-danger)"
              style={{ margin: "0 auto 16px", display: "block" }}
            />
            <div
              style={{ fontSize: 20, fontWeight: 700, color: "var(--color-ink)", marginBottom: 8 }}
            >
              Certificate not found
            </div>
            <div style={{ fontSize: 13, color: "var(--color-ink-muted)" }}>
              The certificate code <strong>{certificateCode}</strong> does not exist in our
              records.
            </div>
          </>
        ) : (
          <>
            {isValid ? (
              <CheckCircle
                size={56}
                color="var(--color-green)"
                style={{ margin: "0 auto 16px", display: "block" }}
              />
            ) : (
              <XCircle
                size={56}
                color="var(--color-danger)"
                style={{ margin: "0 auto 16px", display: "block" }}
              />
            )}

            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: isValid ? "var(--color-green)" : "var(--color-danger)",
                marginBottom: 4,
              }}
            >
              {isValid ? "Valid certificate" : "Certificate expired"}
            </div>
            <div style={{ fontSize: 13, color: "var(--color-ink-muted)", marginBottom: 24 }}>
              Verified by Rosterly Academy
            </div>

            <div
              style={{
                background: "#FAFAF8",
                borderRadius: 10,
                padding: 20,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: "var(--color-ink)",
                  fontFamily: "Georgia, serif",
                  fontStyle: "italic",
                  marginBottom: 6,
                }}
              >
                {profile?.full_name ?? "Participant"}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#C8973A", marginBottom: 3 }}>
                {(level as { title?: string })?.title}
              </div>
              <div style={{ fontSize: 12, color: "var(--color-ink-muted)" }}>
                {(level as { subtitle?: string })?.subtitle}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 12 }}>
              <div style={{ background: "#F4F3EF", borderRadius: 8, padding: 10 }}>
                <div style={{ color: "var(--color-ink-muted)", marginBottom: 3 }}>Issued</div>
                <div style={{ fontWeight: 500, color: "var(--color-ink)" }}>
                  {formatShortDate(cert.issued_at)}
                </div>
              </div>
              <div style={{ background: "#F4F3EF", borderRadius: 8, padding: 10 }}>
                <div style={{ color: "var(--color-ink-muted)", marginBottom: 3 }}>Expires</div>
                <div
                  style={{
                    fontWeight: 500,
                    color: isValid ? "var(--color-ink)" : "var(--color-danger)",
                  }}
                >
                  {formatShortDate(cert.expires_at)}
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 16,
                fontSize: 11,
                color: "var(--color-ink-hint)",
                fontFamily: "monospace",
              }}
            >
              Code: {cert.certificate_code}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
