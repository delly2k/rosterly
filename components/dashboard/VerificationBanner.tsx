import Link from "next/link";
import { ShieldCheck } from "lucide-react";

type VerificationBannerProps = {
  href: string;
  title: string;
  subtitle: string;
  ctaLabel?: string;
};

export function VerificationBanner({
  href,
  title,
  subtitle,
  ctaLabel = "Verify now →",
}: VerificationBannerProps) {
  return (
    <div
      style={{
        background: "var(--color-gold)",
        borderRadius: "12px",
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "24px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <ShieldCheck size={20} color="white" aria-hidden />
        <div>
          <div style={{ color: "white", fontWeight: 600, fontSize: "14px" }}>
            {title}
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.8)",
              fontSize: "12px",
              marginTop: "2px",
            }}
          >
            {subtitle}
          </div>
        </div>
      </div>
      <Link
        href={href}
        style={{
          background: "white",
          color: "var(--color-gold)",
          fontWeight: 600,
          fontSize: "13px",
          padding: "8px 16px",
          borderRadius: "8px",
          textDecoration: "none",
          whiteSpace: "nowrap",
        }}
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
