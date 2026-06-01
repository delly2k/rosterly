import { createClient } from "@/lib/auth";
import type { ParticipantCertificate } from "@/lib/academy";

export async function getValidCertificatesForUser(
  userId: string
): Promise<ParticipantCertificate[]> {
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
