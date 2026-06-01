"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/auth";
import {
  getAdminUserIds,
  notifyAdminsReportFiled,
} from "@/lib/notifications";

export async function submitReport(input: {
  category: string;
  description: string;
}): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in to report." };

  const description = input.description.trim();
  if (!description) return { error: "Please describe what happened." };

  const category = input.category?.trim() || "general";

  const { data: report, error: insertError } = await supabase
    .from("reports")
    .insert({
      reporter_id: user.id,
      category: category || null,
      description,
      status: "pending",
    })
    .select("id, category")
    .single();

  if (insertError || !report) {
    return { error: "Could not submit report. Please try again." };
  }

  const adminIds = await getAdminUserIds();
  await notifyAdminsReportFiled(
    adminIds,
    report.id,
    report.category ?? category
  );

  revalidatePath("/dashboard/participant/report");
  revalidatePath("/dashboard/participant/safety");
  return { success: true };
}
