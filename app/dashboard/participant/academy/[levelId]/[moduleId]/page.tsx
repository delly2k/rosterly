import { notFound } from "next/navigation";
import { requireRole, createClient } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import ModuleLessonClient from "./ModuleLessonClient";

export default async function ModuleLessonPage({
  params,
}: {
  params: Promise<{ levelId: string; moduleId: string }>;
}) {
  await requireRole(ROLES.PARTICIPANT);
  const { levelId, moduleId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: level } = await supabase
    .from("academy_levels")
    .select("title, order_index")
    .eq("id", levelId)
    .single();

  if (!level) notFound();

  const { data: modules } = await supabase
    .from("academy_modules")
    .select("id, order_index, title")
    .eq("level_id", levelId)
    .eq("is_published", true)
    .order("order_index");

  const { data: module } = await supabase
    .from("academy_modules")
    .select("id, title, order_index, content_html, video_url, has_quiz, level_id")
    .eq("id", moduleId)
    .eq("level_id", levelId)
    .eq("is_published", true)
    .single();

  if (!module) notFound();

  const { data: questions } = module.has_quiz
    ? await supabase
        .from("academy_questions")
        .select("id, question, options, correct_answer, explanation")
        .eq("module_id", moduleId)
        .order("order_index")
    : { data: [] };

  const { data: progress } = await supabase
    .from("academy_progress")
    .select("completed_at, quiz_passed, video_watched")
    .eq("user_id", user.id)
    .eq("module_id", moduleId)
    .maybeSingle();

  const prevModule =
    modules?.find((m) => m.order_index === module.order_index - 1) ?? null;
  const nextModule =
    modules?.find((m) => m.order_index === module.order_index + 1) ?? null;

  return (
    <ModuleLessonClient
      levelId={levelId}
      levelOrder={level.order_index}
      levelTitle={level.title}
      module={{
        id: module.id,
        title: module.title,
        order_index: module.order_index,
        content_html: module.content_html ?? "",
        video_url: module.video_url,
        has_quiz: module.has_quiz,
      }}
      questions={(questions ?? []).map((q) => ({
        ...q,
        options:
          typeof q.options === "string"
            ? q.options
            : JSON.stringify(q.options ?? []),
      }))}
      progress={
        progress
          ? {
              video_watched: !!progress.video_watched,
              quiz_passed: !!progress.quiz_passed,
              completed_at: progress.completed_at,
            }
          : null
      }
      prevModule={prevModule ? { id: prevModule.id, title: prevModule.title } : null}
      nextModule={nextModule ? { id: nextModule.id, title: nextModule.title } : null}
      initialComplete={!!progress?.completed_at}
      initialQuizPassed={!!progress?.quiz_passed}
    />
  );
}
