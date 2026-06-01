"use client";

import NotificationBell from "@/components/ui/NotificationBell";

type Props = {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
};

export default function MobileHeader({ title, showBack, onBack }: Props) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "white",
        borderBottom: "0.5px solid var(--color-border)",
        padding: "12px 16px",
        paddingTop: "calc(12px + env(safe-area-inset-top))",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      {showBack ? (
        <button
          type="button"
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px 8px 4px 0",
            color: "var(--color-ink)",
            fontSize: 22,
            lineHeight: 1,
            minWidth: 44,
            minHeight: 44,
            display: "flex",
            alignItems: "center",
          }}
          aria-label="Go back"
        >
          ←
        </button>
      ) : (
        <img src="/logo.svg" alt="Rosterly" style={{ height: 24, width: "auto" }} />
      )}

      {title ? (
        <div
          style={{
            flex: 1,
            textAlign: showBack ? "center" : "left",
            fontSize: 15,
            fontWeight: 600,
            color: "var(--color-ink)",
            marginLeft: showBack ? 0 : 8,
          }}
        >
          {title}
        </div>
      ) : (
        <div style={{ flex: 1 }} />
      )}

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
        <NotificationBell />
      </div>
    </header>
  );
}
