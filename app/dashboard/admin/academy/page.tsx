import Link from "next/link";
import { requireRole, createClient } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { GraduationCap, Award, BookOpen, BarChart2 } from "lucide-react";
import { formatShortDate } from "@/lib/formatDate";
import { LEVEL_ACCENT_COLORS } from "@/lib/academy";

export default async function AdminAcademyPage() {
  await requireRole(ROLES.ADMIN);
  const supabase = await createClient();

  const [
    { count: totalCerts },
    { count: totalAttempts },
    { data: recentCerts },
    { data: levels },
    { count: totalModules },
  ] = await Promise.all([
    supabase.from("academy_certificates").select("*", { count: "exact", head: true }),
    supabase.from("academy_assessment_attempts").select("*", { count: "exact", head: true }),
    supabase
      .from("academy_certificates")
      .select("id, certificate_code, issued_at, expires_at, user_id, academy_levels(title)")
      .order("issued_at", { ascending: false })
      .limit(10),
    supabase.from("academy_levels").select("*").order("order_index"),
    supabase
      .from("academy_modules")
      .select("*", { count: "exact", head: true })
      .eq("is_published", true),
  ]);

  const certRows = recentCerts ?? [];
  const userIds = [...new Set(certRows.map((c) => c.user_id))];
  const { data: profiles } =
    userIds.length > 0
      ? await supabase
          .from("participant_profiles")
          .select("user_id, full_name")
          .in("user_id", userIds)
      : { data: [] };
  const nameByUser = new Map(
    (profiles ?? []).map((p) => [p.user_id, p.full_name?.trim() ?? "—"])
  );

  const moduleCountByLevel = new Map<string, number>();
  if (levels?.length) {
    const { data: allModules } = await supabase
      .from("academy_modules")
      .select("level_id")
      .eq("is_published", true);
    for (const m of allModules ?? []) {
      moduleCountByLevel.set(m.level_id, (moduleCountByLevel.get(m.level_id) ?? 0) + 1);
    }
  }

  return (
    <div style={{ padding: "32px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "var(--color-gold-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <GraduationCap size={16} color="var(--color-gold)" />
        </div>
        <div style={{ fontSize: 20, fontWeight: 600, color: "var(--color-ink)" }}>
          Academy management
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
          marginBottom: 28,
        }}
      >
        {[
          { label: "Certificates issued", value: totalCerts ?? 0, icon: Award, color: "var(--color-gold)" },
          {
            label: "Assessment attempts",
            value: totalAttempts ?? 0,
            icon: BarChart2,
            color: "#2563EB",
          },
          { label: "Active courses", value: levels?.length ?? 0, icon: BookOpen, color: "var(--color-green)" },
          {
            label: "Published modules",
            value: totalModules ?? 0,
            icon: GraduationCap,
            color: "#7C3AED",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            style={{
              background: "white",
              borderRadius: 12,
              border: "0.5px solid var(--color-border)",
              padding: "16px 20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Icon size={14} color={color} />
              <div
                style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--color-ink-muted)",
                  fontWeight: 600,
                }}
              >
                {label}
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "var(--color-ink)" }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-ink)", marginBottom: 14 }}>
          Certification levels
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {levels?.map((level, i) => (
            <div
              key={level.id}
              style={{
                background: "white",
                borderRadius: 12,
                border: "0.5px solid var(--color-border)",
                overflow: "hidden",
              }}
            >
              <div style={{ height: 3, background: LEVEL_ACCENT_COLORS[i] ?? LEVEL_ACCENT_COLORS[0] }} />
              <div style={{ padding: "16px 20px" }}>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "var(--color-ink-muted)",
                    marginBottom: 4,
                  }}
                >
                  {level.subtitle}
                </div>
                <div
                  style={{ fontSize: 15, fontWeight: 700, color: "var(--color-ink)", marginBottom: 12 }}
                >
                  {level.title}
                </div>
                <div style={{ fontSize: 12, color: "var(--color-ink-muted)", marginBottom: 14 }}>
                  {moduleCountByLevel.get(level.id) ?? 0} published modules
                </div>
                <Link
                  href={`/dashboard/admin/academy/${level.id}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 12,
                    color: "var(--color-gold)",
                    fontWeight: 500,
                    textDecoration: "none",
                  }}
                >
                  Manage content →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-ink)", marginBottom: 14 }}>
          Recently issued certificates
        </div>
        <div
          style={{
            background: "white",
            border: "0.5px solid var(--color-border)",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F9F8F5", borderBottom: "0.5px solid var(--color-border)" }}>
                {["Participant", "Certificate", "Issued", "Expires", "Code"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 16px",
                      textAlign: "left",
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      color: "var(--color-ink-muted)",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {certRows.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 24, textAlign: "center", fontSize: 13, color: "var(--color-ink-muted)" }}>
                    No certificates issued yet
                  </td>
                </tr>
              ) : (
                certRows.map((cert) => {
                  const levelRow = Array.isArray(cert.academy_levels)
                    ? cert.academy_levels[0]
                    : cert.academy_levels;
                  return (
                    <tr key={cert.id} style={{ borderBottom: "0.5px solid var(--color-border)" }}>
                      <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 500 }}>
                        {nameByUser.get(cert.user_id) ?? "—"}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--color-ink-muted)" }}>
                        {(levelRow as { title?: string })?.title ?? "—"}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--color-ink-muted)" }}>
                        {formatShortDate(cert.issued_at)}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 12,
                          color:
                            new Date(cert.expires_at) < new Date()
                              ? "var(--color-danger)"
                              : "var(--color-ink-muted)",
                        }}
                      >
                        {formatShortDate(cert.expires_at)}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 12,
                          fontFamily: "monospace",
                          color: "var(--color-gold)",
                        }}
                      >
                        {cert.certificate_code}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
