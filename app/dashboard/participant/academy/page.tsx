import Link from "next/link";
import { requireRole, createClient } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { GraduationCap, ChevronRight, Award, Lock } from "lucide-react";
import {
  LEVEL_ACCENT_COLORS,
  LEVEL_BG_COLORS,
  LEVEL_BORDER_COLORS,
  levelIndexFromOrder,
} from "@/lib/academy";
import { formatShortDate } from "@/lib/formatDate";

export default async function AcademyPage() {
  await requireRole(ROLES.PARTICIPANT);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: levels } = await supabase
    .from("academy_levels")
    .select("*")
    .order("order_index");

  const { data: certificates } = await supabase
    .from("academy_certificates")
    .select("id, level_id, certificate_code, expires_at, academy_levels(title)")
    .eq("user_id", user.id);

  const { data: progress } = await supabase
    .from("academy_progress")
    .select("module_id, completed_at")
    .eq("user_id", user.id)
    .not("completed_at", "is", null);

  const { data: modules } = await supabase
    .from("academy_modules")
    .select("id, level_id")
    .eq("is_published", true);

  const completedModuleIds = new Set(progress?.map((p) => p.module_id) ?? []);
  const certLevelIds = new Set(certificates?.map((c) => c.level_id) ?? []);

  const getLevelProgress = (levelId: string) => {
    const levelModules = modules?.filter((m) => m.level_id === levelId) ?? [];
    const completed = levelModules.filter((m) => completedModuleIds.has(m.id)).length;
    return { total: levelModules.length, completed };
  };

  return (
    <div className="academy-home-padding" style={{ padding: "32px 40px" }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
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
            Rosterly Academy
          </div>
        </div>
        <div style={{ fontSize: 13, color: "var(--color-ink-muted)", maxWidth: 560 }}>
          Build your professional credentials. Certified participants are preferred by merchants
          and unlock higher-paying gigs.
        </div>
      </div>

      {certificates && certificates.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div
            style={{ fontSize: 13, fontWeight: 600, color: "var(--color-ink)", marginBottom: 12 }}
          >
            Your certificates
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {certificates.map((cert) => {
              const levelRow = Array.isArray(cert.academy_levels)
                ? cert.academy_levels[0]
                : cert.academy_levels;
              return (
                <Link
                  key={cert.id}
                  href={`/dashboard/participant/academy/certificate/${cert.certificate_code}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      background: "var(--color-gold-light)",
                      border: "1px solid var(--color-gold-border)",
                      borderRadius: 10,
                      padding: "12px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <Award size={20} color="var(--color-gold)" />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-gold)" }}>
                        {(levelRow as { title?: string } | null)?.title ?? "Certificate"}
                      </div>
                      <div
                        style={{ fontSize: 10, color: "var(--color-ink-muted)", marginTop: 1 }}
                      >
                        Expires {formatShortDate(cert.expires_at)}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {levels?.map((level, i) => {
          const { total, completed } = getLevelProgress(level.id);
          const hasCert = certLevelIds.has(level.id);
          const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
          const prevLevel = levels[i - 1];
          const isLocked = i > 0 && !certLevelIds.has(prevLevel?.id ?? "");
          const idx = levelIndexFromOrder(level.order_index);
          const accent = LEVEL_ACCENT_COLORS[idx];
          const bg = LEVEL_BG_COLORS[idx];
          const border = LEVEL_BORDER_COLORS[idx];

          return (
            <div
              key={level.id}
              style={{
                background: "white",
                borderRadius: 14,
                border: `0.5px solid ${hasCert ? border : "var(--color-border)"}`,
                overflow: "hidden",
                opacity: isLocked ? 0.6 : 1,
              }}
            >
              <div style={{ height: 4, background: accent }} />
              <div style={{ padding: "20px 24px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 16,
                    marginBottom: 16,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: 8 }}>
                      <span
                        style={{
                          padding: "3px 10px",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 600,
                          background: bg,
                          border: `0.5px solid ${border}`,
                          color: accent,
                        }}
                      >
                        {level.subtitle}
                      </span>
                      {level.required_for_platform && (
                        <span
                          style={{
                            marginLeft: 6,
                            padding: "3px 10px",
                            borderRadius: 20,
                            fontSize: 10,
                            fontWeight: 500,
                            background: "#FEF2F2",
                            border: "0.5px solid rgba(220,38,38,0.2)",
                            color: "#DC2626",
                          }}
                        >
                          Required
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: "var(--color-ink)",
                        marginBottom: 6,
                      }}
                    >
                      {level.title}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--color-ink-muted)", lineHeight: 1.6 }}>
                      {level.description}
                    </div>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    {hasCert ? (
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: "50%",
                          background: bg,
                          border: `1px solid ${border}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Award size={22} color={accent} />
                      </div>
                    ) : isLocked ? (
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: "50%",
                          background: "#F4F3EF",
                          border: "0.5px solid var(--color-border)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Lock size={18} color="var(--color-ink-hint)" />
                      </div>
                    ) : (
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: "50%",
                          background: bg,
                          border: `1px solid ${border}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <GraduationCap size={20} color={accent} />
                      </div>
                    )}
                  </div>
                </div>

                {!isLocked && (
                  <div style={{ marginBottom: 16 }}>
                    <div
                      style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}
                    >
                      <span style={{ fontSize: 12, color: "var(--color-ink-muted)" }}>
                        {completed} of {total} modules complete
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: accent }}>
                        {pct}%
                      </span>
                    </div>
                    <div
                      style={{
                        height: 6,
                        background: "#F0EEE8",
                        borderRadius: 4,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: 6,
                          borderRadius: 4,
                          background: accent,
                          width: `${pct}%`,
                          transition: "width 0.4s ease",
                        }}
                      />
                    </div>
                  </div>
                )}

                {isLocked ? (
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--color-ink-hint)",
                      fontStyle: "italic",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <Lock size={11} /> Complete {prevLevel?.title} to unlock
                  </div>
                ) : hasCert ? (
                  <Link
                    href={`/dashboard/participant/academy/${level.id}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 13,
                      fontWeight: 500,
                      color: accent,
                      textDecoration: "none",
                    }}
                  >
                    Review modules <ChevronRight size={13} />
                  </Link>
                ) : (
                  <Link
                    href={`/dashboard/participant/academy/${level.id}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "9px 20px",
                      borderRadius: 8,
                      background: accent,
                      color: "white",
                      fontSize: 13,
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    {completed > 0 ? "Continue" : "Start"} {level.subtitle}{" "}
                    <ChevronRight size={13} />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
