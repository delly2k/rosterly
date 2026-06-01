"use server";

import { createClient } from "@/lib/auth";
import { createNotification, getAdminUserIds } from "@/lib/notifications";
import { revalidatePath } from "next/cache";
import twilio from "twilio";

export async function triggerSOS(formData: FormData) {
  const lat = formData.get("lat") as string;
  const lon = formData.get("lon") as string;
  const gigTitle = formData.get("gigTitle") as string | null;
  const gigAddress = formData.get("gigAddress") as string | null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("participant_profiles")
    .select("full_name, emergency_contact")
    .eq("user_id", user.id)
    .single();

  const { error: insertError } = await supabase.from("sos_events").insert({
    user_id: user.id,
    lat: lat ? parseFloat(lat) : null,
    lon: lon ? parseFloat(lon) : null,
    gig_title: gigTitle || null,
    gig_address: gigAddress || null,
  });

  if (insertError) return { error: "Could not log SOS event." };

  const mapsLink =
    lat && lon ? `https://maps.google.com/?q=${lat},${lon}` : null;

  const adminIds = await getAdminUserIds();
  const sosBody = `${profile?.full_name ?? "A participant"} triggered SOS${gigTitle ? ` at "${gigTitle}"` : ""}.`;
  for (const adminId of adminIds) {
    await createNotification({
      userId: adminId,
      type: "sos_triggered",
      title: "🚨 SOS Alert",
      body: sosBody,
      link: "/dashboard/admin/users",
    });
  }

  if (profile?.emergency_contact && process.env.TWILIO_ACCOUNT_SID) {
    const message = [
      "ROSTERLY SAFETY ALERT",
      `${profile.full_name ?? "A participant"} has triggered an emergency alert.`,
      gigTitle ? `Gig: ${gigTitle}` : null,
      gigAddress ? `Location: ${gigAddress}` : null,
      mapsLink ? `GPS: ${mapsLink}` : null,
      "Please check on them immediately.",
    ]
      .filter(Boolean)
      .join("\n");

    try {
      const client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: profile.emergency_contact,
      });
    } catch (err) {
      console.error("SMS failed:", err);
    }
  }

  revalidatePath("/dashboard/participant");
  return { success: true, mapsLink };
}
