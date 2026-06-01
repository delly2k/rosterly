"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { approveVerification, rejectVerification } from "@/app/dashboard/admin/actions";

export function VerificationActions({
  verificationId,
  variant = "compact",
}: {
  verificationId: string;
  variant?: "compact" | "detail";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleApprove() {
    setLoading("approve");
    setError(null);
    try {
      await approveVerification(verificationId);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(null);
    }
  }

  async function handleReject() {
    setLoading("reject");
    setError(null);
    try {
      await rejectVerification(verificationId);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(null);
    }
  }

  if (variant === "detail") {
    return (
      <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
        {error && (
          <span className="text-xs text-[var(--color-danger)]">{error}</span>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleReject}
            disabled={!!loading}
            className="btn-admin-danger inline-flex items-center gap-2 px-4 py-2"
          >
            {loading === "reject" ? (
              "…"
            ) : (
              <>
                <X className="h-4 w-4" strokeWidth={2.5} />
                Reject
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleApprove}
            disabled={!!loading}
            className="btn-admin-primary inline-flex items-center gap-2 px-4 py-2"
          >
            {loading === "approve" ? (
              "…"
            ) : (
              <>
                <Check className="h-4 w-4" strokeWidth={2.5} />
                Approve
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      {error && (
        <span className="mr-2 text-xs text-[var(--color-danger)]">{error}</span>
      )}
      <button
        type="button"
        onClick={handleApprove}
        disabled={!!loading}
        title="Approve"
        className="btn-admin-icon-primary"
      >
        {loading === "approve" ? (
          <span className="text-sm">…</span>
        ) : (
          <Check className="h-4 w-4" strokeWidth={2.5} />
        )}
      </button>
      <button
        type="button"
        onClick={handleReject}
        disabled={!!loading}
        title="Reject"
        className="btn-admin-icon-danger"
      >
        {loading === "reject" ? (
          <span className="text-sm">…</span>
        ) : (
          <X className="h-4 w-4" strokeWidth={2.5} />
        )}
      </button>
    </div>
  );
}
