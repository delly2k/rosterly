import { notFound } from "next/navigation";
import { requireRole, createClient } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import AssessmentClient from "./AssessmentClient";

export default async function AssessmentPage({
  params,
}: {
  params: Promise<{ levelId: string }>;
}) {
  await requireRole(ROLES.PARTICIPANT);
  const { levelId } = await params;
  const supabase = await createClient();

  const { data: assessment } = await supabase
    .from("academy_assessments")
    .select("id, title, pass_mark, time_limit_minutes")
    .eq("level_id", levelId)
    .eq("is_published", true)
    .single();

  if (!assessment) notFound();

  const { data: questions } = await supabase
    .from("academy_assessment_questions")
    .select("id, question, options, correct_answer, explanation")
    .eq("assessment_id", assessment.id)
    .order("order_index");

  return (
    <AssessmentClient
      levelId={levelId}
      assessment={assessment}
      questions={(questions ?? []).map((q) => ({
        ...q,
        options:
          typeof q.options === "string"
            ? q.options
            : JSON.stringify(q.options ?? []),
      }))}
    />
  );
}
