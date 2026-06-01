import { NextRequest, NextResponse } from "next/server";
import { anthropic } from "@/lib/anthropic";
import { createClient } from "@/lib/supabase/server";

const SYSTEM_PROMPT = `You are Ros, the friendly onboarding assistant for Rosterly — Jamaica's professional platform for promotions and brand activation talent.

Your job is to help participants complete their professional profile through a warm, conversational flow. You are professional but approachable — think LinkedIn meets local Jamaican hospitality.

CRITICAL RULES:
- Never ask about information that is already in the EXISTING PROFILE DATA section. That information is confirmed and complete.
- Only collect what is listed in the MISSING INFORMATION section.
- Ask one question at a time. Never combine multiple questions in one message.
- Keep responses short — 2-3 sentences max per message.
- Be encouraging and positive.
- Use the person's name if you already know it from the existing data.
- If very little is missing (1-2 fields), acknowledge what you already know about them before asking for the rest.
- If everything is already filled in, tell them their profile looks great, summarise what you know about them, and output the PROFILE_DATA block.
- When confirming existing profile data, ALWAYS format it exactly like this — one field per line, using this exact pattern:
  **Name:** [value]
  **Location:** [value]
  **Skills:** [comma separated list]
  **Rate:** [value]
  **Availability:** [value]
  **Bio:** [value]
- Put the intro sentence on its own line before the fields.
- Put the closing question on its own line after the fields.
- Never mix the fields into a single paragraph.

Once ALL missing information has been collected (or if nothing is missing), output a JSON block wrapped in <PROFILE_DATA> tags:
{
  "full_name": "",
  "location_general": "",
  "bio": "", // 2-3 sentence professional bio written in third person. If bio already exists, improve it slightly and include it.
  "skills": [], // array of skill strings. Include any existing skills plus new ones mentioned.
  "availability": {}, // { "monday": { "available": true/false, "from": "09:00", "to": "18:00" } ... } for all 7 days
  "rate": 0, // numeric JMD. Use existing rate if already set.
  "suggested_certification": "" // one of: "Field Marketing Fundamentals", "Spirits Sampling", "FMCG Product Demo", "Event Brand Activation", "Social Content Capture"
}

After outputting the JSON block, write a warm closing message (without mentioning the JSON) telling them their profile is set up and what their suggested first certification is. Never mention Claude or Anthropic.`;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "At least one message is required" },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 }
      );
    }

    const { data: profile } = await supabase
      .from("participant_profiles")
      .select("full_name, bio, skills, location_general, availability, rate")
      .eq("user_id", user.id)
      .maybeSingle();

    const skills = Array.isArray(profile?.skills) ? (profile.skills as string[]) : [];

    const existingData: string[] = [];
    if (profile?.full_name) existingData.push(`Full name: ${profile.full_name}`);
    if (profile?.location_general)
      existingData.push(`Location: ${profile.location_general}`);
    if (profile?.bio) existingData.push(`Bio: ${profile.bio}`);
    if (skills.length) existingData.push(`Skills: ${skills.join(", ")}`);
    if (profile?.rate && profile.rate > 0)
      existingData.push(`Rate: J$${profile.rate}/hr`);

    const availability = profile?.availability as Record<
      string,
      { available: boolean }
    > | null;
    const availableDays = availability
      ? Object.entries(availability)
          .filter(([, v]) => v.available)
          .map(([day]) => day)
      : [];
    if (availableDays.length)
      existingData.push(`Available days: ${availableDays.join(", ")}`);

    const missing: string[] = [];
    if (!profile?.full_name) missing.push("full name");
    if (!profile?.location_general)
      missing.push("location (parish/area in Jamaica)");
    if (!profile?.bio) missing.push("professional bio");
    if (!skills.length) missing.push("skills and gig type preferences");
    if (!availableDays.length) missing.push("availability (days and times)");
    if (!profile?.rate || profile.rate === 0)
      missing.push("expected rate in Jamaican dollars");

    const profileContext =
      existingData.length > 0
        ? `\n\nEXISTING PROFILE DATA (already known — do NOT ask about these again):\n${existingData.map((d) => `- ${d}`).join("\n")}`
        : "\n\nNo profile data exists yet — start from the beginning.";

    const missingContext =
      missing.length > 0
        ? `\n\nMISSING INFORMATION (only ask about these, in this order):\n${missing.map((m, i) => `${i + 1}. ${m}`).join("\n")}`
        : "\n\nAll required information is already collected. Tell the user their profile looks complete, confirm the details with them warmly, then output the PROFILE_DATA block immediately.";

    const dynamicSystemPrompt = SYSTEM_PROMPT + profileContext + missingContext;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      system: dynamicSystemPrompt,
      messages,
    });

    const content =
      response.content[0].type === "text" ? response.content[0].text : "";

    const profileMatch = content.match(/<PROFILE_DATA>([\s\S]*?)<\/PROFILE_DATA>/);
    let profileData = null;
    if (profileMatch) {
      try {
        profileData = JSON.parse(profileMatch[1].trim());
      } catch {
        profileData = null;
      }
    }

    return NextResponse.json({ content, profileData });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Onboarding API error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
