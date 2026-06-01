/**
 * Fire-and-forget AI verification analysis after a submission is saved.
 * Requires INTERNAL_API_KEY and NEXT_PUBLIC_APP_URL in env.
 */
export function triggerVerificationAiAnalysis(verificationId: string): void {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const internalKey = process.env.INTERNAL_API_KEY;

  if (!internalKey) {
    console.warn(
      "INTERNAL_API_KEY not set; skipping automatic AI verification analysis"
    );
    return;
  }

  fetch(`${baseUrl}/api/admin/verify-documents`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-key": internalKey,
    },
    body: JSON.stringify({ verificationId }),
  }).catch((err) => console.error("AI analysis trigger failed:", err));
}
