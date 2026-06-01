import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole, createClient } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { GraduationCap, CheckCircle, Award, Lock } from "lucide-react";
import { formatShortDate } from "@/lib/formatDate";
import { AcademyModuleCard } from "./AcademyModuleCard";

export default async function LevelPage({
  params,
}: {
  params: Promise<{ levelId: string }>;
}) {
  await requireRole(ROLES.PARTICIPANT);
  const { levelId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: level } = await supabase
    .from("academy_levels")
    .select("*")
    .eq("id", levelId)
    .single();

  if (!level) notFound();

  const { data: modules } = await supabase
    .from("academy_modules")
    .select("id, order_index, title, description, video_url, has_quiz, is_published")
    .eq("level_id", levelId)
    .eq("is_published", true)
    .order("order_index");

  const moduleIds = modules?.map((m) => m.id) ?? [];

  const { data: progress } =
    moduleIds.length > 0
      ? await supabase
          .from("academy_progress")
          .select("module_id, completed_at, quiz_passed, video_watched")
          .eq("user_id", user.id)
          .in("module_id", moduleIds)
      : { data: [] };

  const { data: assessment } = await supabase
    .from("academy_assessments")
    .select("id, title, pass_mark, time_limit_minutes, is_published")
    .eq("level_id", levelId)
    .eq("is_published", true)
    .maybeSingle();

  const { data: certificate } = await supabase
    .from("academy_certificates")
    .select("certificate_code, issued_at")
    .eq("user_id", user.id)
    .eq("level_id", levelId)
    .maybeSingle();

  const progressMap = Object.fromEntries(
    (progress ?? []).map((p) => [p.module_id, p])
  );

  const allModulesComplete =
    (modules?.length ?? 0) > 0 &&
    (modules?.every((m) => progressMap[m.id]?.completed_at) ?? false);

  return (
    <div style={{ padding: "32px 40px" }}>
      <Link
        href="/dashboard/participant/academy"
        className="academy-back-link"
        style={{
          fontSize: 13,
          color: "var(--color-gold)",
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          marginBottom: 20,
        }}
      >
        ← Back to Academy
      </Link>

      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-ink-muted)",
            marginBottom: 6,
          }}
        >
          {level.subtitle}
        </div>
        <div
          style={{ fontSize: 24, fontWeight: 700, color: "var(--color-ink)", marginBottom: 8 }}
        >
          {level.title}
        </div>
        <div style={{ fontSize: 13, color: "var(--color-ink-muted)" }}>{level.description}</div>
      </div>

      {certificate && (
        <div
          style={{
            background: "var(--color-gold-light)",
            border: "0.5px solid var(--color-gold-border)",
            borderRadius: 12,
            padding: "16px 20px",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Award size={24} color="var(--color-gold)" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-gold)" }}>
              Certificate earned
            </div>
            <div style={{ fontSize: 12, color: "var(--color-ink-muted)", marginTop: 2 }}>
              Issued {formatShortDate(certificate.issued_at)}
            </div>
          </div>
          <Link
            href={`/dashboard/participant/academy/certificate/${certificate.certificate_code}`}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              background: "var(--color-gold)",
              color: "white",
              fontSize: 12,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            View certificate
          </Link>
        </div>
      )}

      <div
        className="academy-module-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
          gap: 12,
          marginBottom: 20,
        }}
      >
        {modules?.map((module, i) => {
          const prog = progressMap[module.id];
          const isComplete = !!prog?.completed_at;
          const isStarted = !!prog;
          const prevModule = modules[i - 1];
          const prevComplete = i === 0 || !!progressMap[prevModule?.id]?.completed_at;
          const isUnlocked = prevComplete;

          return (
            <AcademyModuleCard
              key={module.id}
              levelId={levelId}
              module={module}
              isComplete={isComplete}
              isStarted={isStarted}
              isUnlocked={isUnlocked}
            />
          );
        })}

        {assessment && (
          <div style={{ gridColumn: "1 / -1" }}>
            <div
              className="academy-assessment-card"
              style={{
                background: allModulesComplete ? "var(--color-gold-light)" : "#F4F3EF",
                border: `1px solid ${allModulesComplete ? "var(--color-gold-border)" : "var(--color-border)"}`,
                borderRadius: 12,
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: allModulesComplete ? "white" : "#EDEAE3",
                  border: `1px solid ${allModulesComplete ? "var(--color-gold-border)" : "var(--color-border)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {certificate ? (
                  <Award size={20} color="var(--color-gold)" />
                ) : allModulesComplete ? (
                  <GraduationCap size={20} color="var(--color-gold)" />
                ) : (
                  <Lock size={18} color="var(--color-ink-hint)" />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "var(--color-ink)",
                    marginBottom: 3,
                  }}
                >
                  {assessment.title}
                </div>
                <div style={{ fontSize: 12, color: "var(--color-ink-muted)" }}>
                  Final assessment · {assessment.pass_mark}% to pass ·{" "}
                  {assessment.time_limit_minutes} minutes
                </div>
              </div>
              {certificate ? (
                <span
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    background: "var(--color-green-light)",
                    border: "0.5px solid var(--color-green-border)",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--color-green)",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <CheckCircle size={12} /> Passed
                </span>
              ) : allModulesComplete ? (
                <Link
                  href={`/dashboard/participant/academy/${levelId}/assessment`}
                  style={{
                    padding: "9px 20px",
                    borderRadius: 8,
                    background: "var(--color-gold)",
                    color: "white",
                    fontSize: 13,
                    fontWeight: 600,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  Take assessment →
                </Link>
              ) : (
                <div style={{ fontSize: 12, color: "var(--color-ink-hint)", fontStyle: "italic" }}>
                  Complete all modules first
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
