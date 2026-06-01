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

export async function getValidCertificatesForUser(
  userId: string
): Promise<ParticipantCertificate[]> {
  const { createClient } = await import("@/lib/auth");
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data } = await supabase
    .from("academy_certificates")
    .select("id, certificate_code, academy_levels(title, subtitle, badge_color)")
    .eq("user_id", userId)
    .eq("is_valid", true)
    .gt("expires_at", now);

  return (data ?? []).map((c) => {
    const level = Array.isArray(c.academy_levels) ? c.academy_levels[0] : c.academy_levels;
    return {
      id: c.id,
      certificate_code: c.certificate_code,
      levelTitle: (level as { title?: string })?.title ?? "Certificate",
      levelSubtitle: (level as { subtitle?: string })?.subtitle ?? "",
      badge_color: (level as { badge_color?: string })?.badge_color ?? "gold",
    };
  });
}

export async function getValidCertificatesForUsers(
  userIds: string[]
): Promise<Map<string, ParticipantCertificate[]>> {
  const map = new Map<string, ParticipantCertificate[]>();
  if (!userIds.length) return map;

  const { createClient } = await import("@/lib/auth");
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data } = await supabase
    .from("academy_certificates")
    .select("id, user_id, certificate_code, academy_levels(title, subtitle, badge_color)")
    .in("user_id", userIds)
    .eq("is_valid", true)
    .gt("expires_at", now);

  for (const c of data ?? []) {
    const level = Array.isArray(c.academy_levels) ? c.academy_levels[0] : c.academy_levels;
    const cert: ParticipantCertificate = {
      id: c.id,
      certificate_code: c.certificate_code,
      levelTitle: (level as { title?: string })?.title ?? "Certificate",
      levelSubtitle: (level as { subtitle?: string })?.subtitle ?? "",
      badge_color: (level as { badge_color?: string })?.badge_color ?? "gold",
    };
    const list = map.get(c.user_id) ?? [];
    list.push(cert);
    map.set(c.user_id, list);
  }
  return map;
}
