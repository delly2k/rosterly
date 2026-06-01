import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Award, CheckCircle, XCircle } from "lucide-react";
import QRCode from "qrcode";
import { CertificateActions } from "@/components/academy/CertificateActions";
import { LEVEL_ACCENT_COLORS, levelIndexFromOrder } from "@/lib/academy";
import { formatShortDate } from "@/lib/formatDate";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ certificateCode: string }>;
}) {
  await requireRole(ROLES.PARTICIPANT);
  const { certificateCode } = await params;
  const supabase = await createClient();

  const { data: cert } = await supabase
    .from("academy_certificates")
    .select("*, academy_levels(title, subtitle, description, order_index)")
    .eq("certificate_code", certificateCode)
    .single();

  if (!cert) notFound();

  const { data: profile } = await supabase
    .from("participant_profiles")
    .select("full_name")
    .eq("user_id", cert.user_id)
    .maybeSingle();

  const level = Array.isArray(cert.academy_levels)
    ? cert.academy_levels[0]
    : cert.academy_levels;
  const name = profile?.full_name?.trim() ?? "Participant";
  const isValid = cert.is_valid && new Date(cert.expires_at) > new Date();
  const color =
    LEVEL_ACCENT_COLORS[levelIndexFromOrder((level as { order_index?: number })?.order_index ?? 1)];

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const verifyUrl = `${appUrl}/verify/${certificateCode}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 120, margin: 1 });

  return (
    <div style={{ padding: 40, maxWidth: 700, margin: "0 auto" }}>
      <div
        style={{
          background: "white",
          borderRadius: 16,
          border: `2px solid ${color}`,
          overflow: "hidden",
          boxShadow: `0 8px 32px ${color}22`,
        }}
      >
        <div style={{ height: 6, background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
        <div style={{ padding: "40px 48px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 32,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--color-ink-muted)",
                  marginBottom: 4,
                }}
              >
                Rosterly Academy
              </div>
              <div style={{ fontSize: 13, color: "var(--color-ink-muted)" }}>
                Certificate of Achievement
              </div>
            </div>
            <Award size={48} color={color} />
          </div>

          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 13, color: "var(--color-ink-muted)", marginBottom: 6 }}>
              This certifies that
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: "var(--color-ink)",
                fontFamily: "Georgia, serif",
                fontStyle: "italic",
                marginBottom: 12,
              }}
            >
              {name}
            </div>
            <div style={{ fontSize: 13, color: "var(--color-ink-muted)", marginBottom: 4 }}>
              has successfully completed
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color, marginBottom: 4 }}>
              {(level as { title?: string })?.title}
            </div>
            <div style={{ fontSize: 13, color: "var(--color-ink-muted)" }}>
              {(level as { subtitle?: string })?.subtitle} · Rosterly Academy
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 16,
              marginBottom: 28,
              paddingTop: 24,
              borderTop: "0.5px solid var(--color-border)",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--color-ink-muted)",
                  marginBottom: 4,
                }}
              >
                Issue date
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-ink)" }}>
                {formatShortDate(cert.issued_at)}
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--color-ink-muted)",
                  marginBottom: 4,
                }}
              >
                Expires
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-ink)" }}>
                {formatShortDate(cert.expires_at)}
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--color-ink-muted)",
                  marginBottom: 4,
                }}
              >
                Certificate code
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color, fontFamily: "monospace" }}>
                {cert.certificate_code}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: 20,
              borderTop: "0.5px solid var(--color-border)",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  borderRadius: 20,
                  background: isValid ? "var(--color-green-light)" : "var(--color-danger-light)",
                  border: `0.5px solid ${isValid ? "var(--color-green-border)" : "rgba(220,38,38,0.2)"}`,
                  fontSize: 12,
                  fontWeight: 600,
                  color: isValid ? "var(--color-green)" : "var(--color-danger)",
                }}
              >
                {isValid ? <CheckCircle size={12} /> : <XCircle size={12} />}
                {isValid ? "Valid certificate" : "Expired or invalid"}
              </div>
              <div style={{ fontSize: 11, color: "var(--color-ink-muted)", marginTop: 6 }}>
                Scan QR to verify
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt="QR code" style={{ width: 80, height: 80, borderRadius: 8 }} />
          </div>
        </div>
      </div>

      <CertificateActions />
      <div style={{ textAlign: "center", marginTop: 12 }}>
        <Link
          href="/dashboard/participant/academy"
          style={{
            fontSize: 13,
            color: "var(--color-gold)",
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          Back to Academy
        </Link>
      </div>
    </div>
  );
}
