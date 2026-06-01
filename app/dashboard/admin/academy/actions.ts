"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleModulePublished(moduleId: string, published: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("academy_modules")
    .update({ is_published: published })
    .eq("id", moduleId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/admin/academy");
  return { success: true };
}

export async function updateModuleContent(
  moduleId: string,
  data: { title?: string; description?: string; content_html?: string; video_url?: string | null }
) {
  const supabase = await createClient();
  const { error } = await supabase.from("academy_modules").update(data).eq("id", moduleId);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/admin/academy");
  return { success: true };
}

export async function upsertModuleQuestion(
  moduleId: string,
  question: {
    id?: string;
    question: string;
    options: string[];
    correct_answer: string;
    explanation: string;
    order_index: number;
  }
) {
  const supabase = await createClient();
  const row = {
    module_id: moduleId,
    question: question.question,
    type: "multiple_choice" as const,
    options: question.options,
    correct_answer: question.correct_answer,
    explanation: question.explanation,
    order_index: question.order_index,
  };
  if (question.id) {
    const { error } = await supabase.from("academy_questions").update(row).eq("id", question.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("academy_questions").insert(row);
    if (error) return { error: error.message };
  }
  revalidatePath("/dashboard/admin/academy");
  return { success: true };
}
