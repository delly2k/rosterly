/**
 * Base URL for the app (no trailing slash).
 * Used for PayPal return/cancel URLs and any other absolute app URLs.
 */
export function getAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (url) return url.replace(/\/$/, "");
  return "http://localhost:3000";
}
