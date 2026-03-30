"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { approveVerification, rejectVerification } from "@/app/dashboard/admin/actions";

export function VerificationActions({ verificationId }: { verificationId: string }) {
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

  return (
    <div className="flex items-center justify-end gap-1.5">
      {error && (
        <span className="mr-2 text-xs text-red-600 dark:text-red-400">{error}</span>
      )}
      <button
        type="button"
        onClick={handleApprove}
        disabled={!!loading}
        title="Approve"
        className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:opacity-50"
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
        className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-300 bg-white text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200 disabled:opacity-50"
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
