"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { applyToGig } from "@/app/dashboard/participant/gigs/actions";
import { Button } from "@/components/ui/Button";

type ApplyButtonProps = {
  gigId: string;
  variant?: "default" | "hero";
  icon?: ReactNode;
};

export function ApplyButton({ gigId, variant = "default", icon }: ApplyButtonProps) {
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

  if (variant === "hero") {
    return (
      <div>
        {error && (
          <p className="mb-2 text-sm text-[var(--warning-text)]" role="alert">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={handleApply}
          disabled={loading}
          style={{
            background: "var(--color-gold)",
            color: "white",
            border: "none",
            borderRadius: 8,
            padding: "10px 24px",
            fontSize: 13,
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {icon}
          {loading ? "Applying…" : "Apply for this gig"}
        </button>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <p className="mb-2 text-sm text-[var(--warning-text)]" role="alert">
          {error}
        </p>
      )}
      <Button
        type="button"
        onClick={handleApply}
        disabled={loading}
        variant="primary"
        size="md"
      >
        {loading ? "Applying…" : "Apply to this gig"}
      </Button>
    </div>
  );
}
