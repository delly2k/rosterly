/**
 * Server-only: keyword flagging and phone-number detection for chat.
 * No phone numbers allowed; risky keywords auto-flag messages for moderation.
 */

/** Patterns that look like phone numbers (international, with spaces/dots/dashes). */
const PHONE_PATTERNS = [
  /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/, // US-style
  /\+\s*\d[\d\s\-.]{9,}/,         // +1 234 567 8901 etc.
  /\b\d{10,11}\b/,                // 10–11 digit runs
];

/** Risky language keywords (lowercase); match whole-word for flagging. */
const RISKY_KEYWORDS = [
  "meet me", "my number", "call me", "text me", "whatsapp", "telegram", "cash only",
  "off platform", "outside app", "paypal", "venmo", "zelle", "wire transfer",
  "address", "come over", "my place", "your place", "hook up", "nsfw",
];

function toWordBoundaryRegex(word: string): RegExp {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`, "i");
}

/**
 * Returns true if body looks like it contains a phone number.
 */
export function containsPhoneNumber(body: string): boolean {
  const normalized = body.trim();
  return PHONE_PATTERNS.some((re) => re.test(normalized));
}

/**
 * Returns first matching risky keyword (lowercase) or null.
 * Used to set messages.flagged and messages.flagged_reason.
 */
export function getFlaggedKeyword(body: string): string | null {
  const lower = body.toLowerCase();
  for (const keyword of RISKY_KEYWORDS) {
    if (toWordBoundaryRegex(keyword).test(lower)) return keyword;
  }
  return null;
}
