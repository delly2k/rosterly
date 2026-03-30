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
      <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
        Message to reported user (optional)
      </label>
      <textarea
        value={outcomeMessage}
        onChange={(e) => setOutcomeMessage(e.target.value)}
        placeholder="e.g. Report reviewed; no action needed."
        rows={2}
        className="w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
      />
      <div className="flex items-center gap-2">
        {error && (
          <span className="text-xs text-red-600 dark:text-red-400">{error}</span>
        )}
        <button
          type="button"
          onClick={() => handleStatus("resolved")}
          disabled={!!loading}
          className="rounded bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          {loading === "resolved" ? "…" : "Resolve"}
        </button>
        <button
          type="button"
          onClick={() => handleStatus("dismissed")}
          disabled={!!loading}
          className="rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 disabled:opacity-50"
        >
          {loading === "dismissed" ? "…" : "Dismiss"}
        </button>
      </div>
    </div>
  );
}
