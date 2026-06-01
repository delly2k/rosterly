"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/auth";
import { notifyGigInvitation } from "@/lib/notifications";

export async function inviteParticipant(formData: FormData): Promise<void> {
  const gigId = formData.get("gigId") as string;
  const participantId = formData.get("participantId") as string;
  const message = formData.get("message") as string | null;
  const matchScore = parseInt((formData.get("matchScore") as string) ?? "0", 10);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: gig } = await supabase
    .from("gigs")
    .select("id, title")
    .eq("id", gigId)
    .eq("merchant_user_id", user.id)
    .single();

  if (!gig) return;

  const { data: existing } = await supabase
    .from("gig_invitations")
    .select("id")
    .eq("gig_id", gigId)
    .eq("participant_user_id", participantId)
    .maybeSingle();

  if (existing) return;

  const { error: insertError } = await supabase.from("gig_invitations").insert({
    gig_id: gigId,
    merchant_user_id: user.id,
    participant_user_id: participantId,
    message: message || null,
    match_score: matchScore,
    status: "pending",
  });

  if (insertError) return;

  const { data: merchantProfile } = await supabase
    .from("merchant_profiles")
    .select("business_name")
    .eq("user_id", user.id)
    .maybeSingle();

  await notifyGigInvitation(
    participantId,
    merchantProfile?.business_name?.trim() ?? "A merchant",
    gig.title
  );

  revalidatePath(`/dashboard/merchant/gigs/${gigId}`);
}

export async function respondToInvitation(formData: FormData): Promise<void> {
  const invitationId = formData.get("invitationId") as string;
  const response = formData.get("response") as "accepted" | "declined";

  if (response !== "accepted" && response !== "declined") return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: invitation } = await supabase
    .from("gig_invitations")
    .select("id, participant_user_id, gig_id")
    .eq("id", invitationId)
    .eq("participant_user_id", user.id)
    .single();

  if (!invitation) return;

  const { error: updateError } = await supabase
    .from("gig_invitations")
    .update({ status: response, updated_at: new Date().toISOString() })
    .eq("id", invitationId);

  if (updateError) return;

  if (response === "accepted") {
    const { error: appError } = await supabase.from("applications").upsert(
      {
        gig_id: invitation.gig_id,
        participant_user_id: user.id,
        status: "pending",
      },
      { onConflict: "gig_id,participant_user_id" }
    );
    if (appError) return;
  }

  revalidatePath("/dashboard/participant/invitations");
  revalidatePath("/dashboard/participant/applications");
  revalidatePath("/dashboard/participant/bookings");
}
