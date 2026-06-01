"use client";

export function CertificateActions() {
  return (
    <div style={{ display: "flex", gap: 12, marginTop: 20, justifyContent: "center" }}>
      <button
        type="button"
        onClick={() => window.print()}
        style={{
          padding: "10px 24px",
          borderRadius: 8,
          background: "var(--color-gold)",
          color: "white",
          fontSize: 13,
          fontWeight: 600,
          border: "none",
          cursor: "pointer",
        }}
      >
        Download / Print
      </button>
    </div>
  );
}
