"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { applyToGig } from "@/app/dashboard/participant/gigs/actions";
import { Button } from "@/components/ui/Button";

export function ApplyButton({ gigId }: { gigId: string }) {
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
