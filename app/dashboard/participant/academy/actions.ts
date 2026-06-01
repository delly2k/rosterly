"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function markModuleComplete(
  moduleId: string,
  quizPassed: boolean,
  quizScore: number
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("academy_progress").upsert(
    {
      user_id: user.id,
      module_id: moduleId,
      completed_at: new Date().toISOString(),
      quiz_passed: quizPassed,
      quiz_score: quizScore,
      video_watched: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,module_id" }
  );

  if (error) return { error: error.message };

  revalidatePath("/dashboard/participant/academy");
  return { success: true };
}

export async function submitAssessment({
  assessmentId,
  levelId,
  answers,
  score,
  passed,
}: {
  assessmentId: string;
  levelId: string;
  answers: Record<string, string>;
  score: number;
  passed: boolean;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  await supabase.from("academy_assessment_attempts").insert({
    user_id: user.id,
    assessment_id: assessmentId,
    answers,
    score,
    passed,
    submitted_at: new Date().toISOString(),
  });

  if (!passed) {
    revalidatePath(`/dashboard/participant/academy/${levelId}/assessment`);
    return { passed, score };
  }

  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  const { data: cert, error: certError } = await supabase
    .from("academy_certificates")
    .upsert(
      {
        user_id: user.id,
        level_id: levelId,
        issued_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        is_valid: true,
      },
      { onConflict: "user_id,level_id" }
    )
    .select("certificate_code")
    .single();

  if (certError) return { error: certError.message, passed, score };

  revalidatePath("/dashboard/participant/academy");
  revalidatePath(`/dashboard/participant/academy/${levelId}`);

  return {
    passed,
    score,
    certificateCode: cert?.certificate_code as string | undefined,
  };
}
