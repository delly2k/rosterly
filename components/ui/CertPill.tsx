import { Award } from "lucide-react";
import { clsx } from "clsx";

export type CertPillVariant = "gold" | "green" | "blue" | "gray";
export type CertPillSize = "sm" | "md";

const variantStyles: Record<
  CertPillVariant,
  { bg: string; text: string; border: string; icon: string }
> = {
  gold: {
    bg: "bg-[var(--color-gold-light)]",
    text: "text-[#A07828]",
    border: "border-[var(--color-gold-border)]",
    icon: "text-[var(--color-gold)]",
  },
  green: {
    bg: "bg-[var(--color-green-light)]",
    text: "text-[var(--color-green)]",
    border: "border-[var(--color-green-border)]",
    icon: "text-[var(--color-green)]",
  },
  blue: {
    bg: "bg-[#EFF6FF]",
    text: "text-[var(--color-primary)]",
    border: "border-[rgba(29,78,216,0.25)]",
    icon: "text-[var(--color-primary)]",
  },
  gray: {
    bg: "bg-[var(--color-page)]",
    text: "text-[var(--color-ink-muted)]",
    border: "border-[var(--color-border)]",
    icon: "text-[var(--color-ink-hint)]",
  },
};

const sizeStyles: Record<CertPillSize, { pill: string; icon: string }> = {
  sm: {
    pill: "gap-1 px-2 py-0.5 text-[11px]",
    icon: "h-3 w-3",
  },
  md: {
    pill: "gap-1.5 px-2.5 py-1 text-xs",
    icon: "h-3.5 w-3.5",
  },
};

export function CertPill({
  label,
  variant = "gray",
  size = "sm",
  className,
}: {
  label: string;
  variant?: CertPillVariant;
  size?: CertPillSize;
  className?: string;
}) {
  const v = variantStyles[variant];
  const s = sizeStyles[size];

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border font-medium",
        v.bg,
        v.text,
        v.border,
        s.pill,
        className
      )}
    >
      <Award className={clsx(s.icon, "shrink-0", v.icon)} aria-hidden />
      <span className="truncate">{label}</span>
    </span>
  );
}
