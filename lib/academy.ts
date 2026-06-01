import type { CertPillVariant } from "@/components/ui/CertPill";

export function badgeColorToVariant(color: string | null | undefined): CertPillVariant {
  if (color === "green") return "green";
  if (color === "blue") return "blue";
  if (color === "gold") return "gold";
  return "gray";
}

export const LEVEL_ACCENT_COLORS = ["#C8973A", "#16A34A", "#2563EB"] as const;
export const LEVEL_BG_COLORS = ["#FBF7EF", "#F0FDF4", "#EFF6FF"] as const;
export const LEVEL_BORDER_COLORS = [
  "rgba(200,151,58,0.3)",
  "rgba(22,163,74,0.3)",
  "rgba(37,99,235,0.3)",
] as const;

export function levelIndexFromOrder(orderIndex: number): number {
  return Math.max(0, Math.min(2, orderIndex - 1));
}

export type ParticipantCertificate = {
  id: string;
  certificate_code: string;
  levelTitle: string;
  levelSubtitle: string;
  badge_color: string;
};
