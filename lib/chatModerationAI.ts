import { anthropic } from "@/lib/anthropic";

export type ModerationResult = {
  verdict: "clean" | "warn" | "flag" | "block";
  reason: string | null;
  category:
    | "off_platform"
    | "inappropriate"
    | "payment"
    | "harassment"
    | "contact_info"
    | null;
};

function parseModerationJson(raw: string): ModerationResult {
  const trimmed = raw.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  const parsed = JSON.parse(jsonMatch?.[0] ?? trimmed) as ModerationResult;
  if (
    !parsed.verdict ||
    !["clean", "warn", "flag", "block"].includes(parsed.verdict)
  ) {
    throw new Error("Invalid moderation verdict");
  }
  return parsed;
}

export async function moderateMessage(
  message: string,
  senderRole: "participant" | "merchant"
): Promise<ModerationResult> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 256,
      system: `You are a content moderation assistant for Rosterly, a professional gig platform in Jamaica.

Analyse the message and return ONLY a JSON object in this exact format, no other text:
{
  "verdict": "clean" | "warn" | "flag" | "block",
  "reason": null or brief string,
  "category": null | "off_platform" | "inappropriate" | "payment" | "harassment" | "contact_info"
}

Verdict guide:
- "clean" — normal professional communication about the gig, no concerns
- "warn" — mildly concerning, deliver the message but flag for review (e.g. slightly unprofessional tone)
- "flag" — clearly attempting to move off platform, share personal contact details, arrange off-platform payment, or mildly inappropriate — deliver but notify admin
- "block" — do not deliver — severe harassment, explicit content, threats, or direct sharing of phone numbers / WhatsApp / social media handles / email addresses

Off-platform signals to detect:
- Suggesting moving conversation to WhatsApp, Instagram, Telegram, email etc
- Sharing or requesting phone numbers (even written as words: "my number is...")
- Suggesting cash payment outside the platform
- Asking to "sort out the rest offline" or similar

Contact info signals:
- Phone numbers in any format (digits, words, mixed)
- Email addresses
- Social media handles (@username patterns)
- WhatsApp/Telegram references

Be conservative — most gig-related professional messages should be "clean".
Short messages like "sounds good", "see you then", "what time?" are always "clean".`,
      messages: [
        {
          role: "user",
          content: `Sender role: ${senderRole}\nMessage: "${message}"`,
        },
      ],
    });

    const content =
      response.content[0].type === "text" ? response.content[0].text : "";
    return parseModerationJson(content);
  } catch {
    return { verdict: "clean", reason: null, category: null };
  }
}
