"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateReportStatus } from "@/app/dashboard/admin/actions";

export function ReportActions({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [outcomeMessage, setOutcomeMessage] = useState("");

  async function handleStatus(status: "resolved" | "dismissed") {
    setLoading(status);
    setError(null);
    try {
      await updateReportStatus(reportId, status, undefined, outcomeMessage || null);
      setOutcomeMessage("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mt-2 space-y-2">
      <label className="block text-xs font-medium text-[var(--color-ink-muted)]">
        Message to reported user (optional)
      </label>
      <textarea
        value={outcomeMessage}
        onChange={(e) => setOutcomeMessage(e.target.value)}
        placeholder="e.g. Report reviewed; no action needed."
        rows={2}
        className="input-refined w-full text-sm"
      />
      <div className="flex items-center gap-2">
        {error && (
          <span className="text-xs text-[var(--color-danger)]">{error}</span>
        )}
        <button
          type="button"
          onClick={() => handleStatus("resolved")}
          disabled={!!loading}
          className="btn-admin-primary"
        >
          {loading === "resolved" ? "…" : "Resolve"}
        </button>
        <button
          type="button"
          onClick={() => handleStatus("dismissed")}
          disabled={!!loading}
          className="btn-admin-secondary"
        >
          {loading === "dismissed" ? "…" : "Dismiss"}
        </button>
      </div>
    </div>
  );
}
