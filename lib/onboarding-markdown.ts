/** Minimal markdown for Ros chat bubbles (bold + line breaks). */
export function parseMarkdown(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>");
}

export function isProfileSummaryMessage(role: string, content: string): boolean {
  return (
    role === "assistant" &&
    (content.includes("**Name:**") ||
      content.includes("**Location:**") ||
      content.includes("Current Profile:") ||
      content.includes("Your Current Profile:"))
  );
}
