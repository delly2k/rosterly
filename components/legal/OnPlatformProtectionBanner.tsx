import { ShieldCheck } from "lucide-react";

export function OnPlatformProtectionBanner() {
  return (
    <div
      style={{
        background: "var(--color-gold-light)",
        border: "0.5px solid var(--color-gold-border)",
        borderRadius: 10,
        padding: "12px 14px",
        marginBottom: 16,
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "var(--color-gold)",
          marginBottom: 6,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <ShieldCheck size={13} /> You&apos;re protected on Rosterly
      </div>
      <div
        style={{
          fontSize: 12,
          color: "var(--color-ink-muted)",
          lineHeight: 1.7,
        }}
      >
        · Payment is held in escrow until the gig is complete
        <br />
        · Your rating is recorded and builds your reputation
        <br />
        · Safety features and SOS are active during this gig
        <br />· Disputes are handled by the Rosterly team
      </div>
    </div>
  );
}
