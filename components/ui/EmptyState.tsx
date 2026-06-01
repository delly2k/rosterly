import type { LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  variant?: "default" | "success" | "gold";
};

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = "default",
}: Props) {
  const colors = {
    default: {
      bg: "#F4F3EF",
      iconBg: "var(--color-gold-light)",
      iconColor: "var(--color-gold)",
      border: "var(--color-border)",
    },
    success: {
      bg: "var(--color-green-light)",
      iconBg: "var(--color-green-light)",
      iconColor: "var(--color-green)",
      border: "var(--color-green-border)",
    },
    gold: {
      bg: "var(--color-gold-light)",
      iconBg: "rgba(200,151,58,0.15)",
      iconColor: "var(--color-gold)",
      border: "var(--color-gold-border)",
    },
  };
  const c = colors[variant];

  return (
    <div
      style={{
        background: "white",
        border: "0.5px solid var(--color-border)",
        borderRadius: 12,
        padding: "48px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          background: c.iconBg,
          border: `0.5px solid ${c.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 4,
        }}
      >
        <Icon size={24} color={c.iconColor} aria-hidden />
      </div>

      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-ink)" }}>
        {title}
      </div>
      {description && (
        <div
          style={{
            fontSize: 13,
            color: "var(--color-ink-muted)",
            maxWidth: 320,
            lineHeight: 1.6,
          }}
        >
          {description}
        </div>
      )}

      {action &&
        (action.href ? (
          <a
            href={action.href}
            style={{
              marginTop: 4,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 20px",
              borderRadius: 8,
              background: "var(--color-gold)",
              color: "white",
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            {action.label}
          </a>
        ) : (
          <button
            type="button"
            onClick={action.onClick}
            style={{
              marginTop: 4,
              padding: "9px 20px",
              borderRadius: 8,
              background: "var(--color-gold)",
              color: "white",
              fontSize: 13,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
          >
            {action.label}
          </button>
        ))}
    </div>
  );
}

export { EmptyState };
