"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function saveOnboardingProfile(profileData: {
  full_name: string;
  location_general: string;
  bio: string;
  skills: string[];
  availability: Record<string, { available: boolean; from: string; to: string }>;
  rate: number;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("participant_profiles")
    .update({
      full_name: profileData.full_name,
      location_general: profileData.location_general,
      bio: profileData.bio,
      skills: profileData.skills,
      availability: profileData.availability,
      rate: profileData.rate,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  const cookieStore = await cookies();
  cookieStore.set("rosterly_onboarded", "true", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: true,
    sameSite: "lax",
  });

  return { success: true };
}
