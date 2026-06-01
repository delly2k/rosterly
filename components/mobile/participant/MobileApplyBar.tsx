"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { applyToGig } from "@/app/dashboard/participant/gigs/actions";
import { MOBILE_BTN_RADIUS, MOBILE_BTN_MIN_HEIGHT, MOBILE_BODY_SIZE } from "./mobileTokens";

export function MobileApplyBar({
  gigId,
  icon,
}: {
  gigId: string;
  icon?: ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApply() {
    setError(null);
    setLoading(true);
    try {
      await applyToGig(gigId);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not apply.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {error && (
        <p style={{ margin: "0 0 8px", fontSize: 12, color: "var(--color-danger)" }} role="alert">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={() => void handleApply()}
        disabled={loading}
        style={{
          width: "100%",
          minHeight: MOBILE_BTN_MIN_HEIGHT,
          borderRadius: MOBILE_BTN_RADIUS,
          fontSize: MOBILE_BODY_SIZE,
          fontWeight: 600,
          background: "var(--color-gold)",
          color: "white",
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.7 : 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        {icon}
        {loading ? "Applying…" : "Apply for this gig"}
      </button>
    </div>
  );
}
