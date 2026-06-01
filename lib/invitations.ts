import { createClient } from "@/lib/auth";

export async function getPendingInvitationCount(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("gig_invitations")
    .select("id", { count: "exact", head: true })
    .eq("participant_user_id", userId)
    .eq("status", "pending");

  if (error) {
    console.error("getPendingInvitationCount:", error.message);
    return 0;
  }
  return count ?? 0;
}
