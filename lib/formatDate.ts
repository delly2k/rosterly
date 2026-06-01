/** Fixed locale so SSR and client hydration match (Node vs browser defaults differ). */
const LOCALE = "en-JM";

export function formatShortDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString(LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Relative label for chat list rows; pass the same `now` on SSR and client to avoid hydration drift. */
export function formatChatListTime(
  iso: string,
  now: Date = new Date()
): string {
  const d = new Date(iso);
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) {
    return d.toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) {
    return d.toLocaleDateString(LOCALE, { weekday: "short" });
  }
  return d.toLocaleDateString(LOCALE, { day: "numeric", month: "short" });
}
