import { notFound } from "next/navigation";
import { requireRole, createClient } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { AdminLevelModules } from "./AdminLevelModules";

export default async function AdminAcademyLevelPage({
  params,
}: {
  params: Promise<{ levelId: string }>;
}) {
  await requireRole(ROLES.ADMIN);
  const { levelId } = await params;
  const supabase = await createClient();

  const { data: level } = await supabase
    .from("academy_levels")
    .select("id, title")
    .eq("id", levelId)
    .single();

  if (!level) notFound();

  const { data: modules } = await supabase
    .from("academy_modules")
    .select(
      "id, order_index, title, description, content_html, video_url, has_quiz, is_published"
    )
    .eq("level_id", levelId)
    .order("order_index");

  return (
    <div style={{ padding: "32px 40px" }}>
      <AdminLevelModules
        levelId={levelId}
        levelTitle={level.title}
        modules={modules ?? []}
      />
    </div>
  );
}
