"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { submitReport } from "@/app/dashboard/participant/report/actions";

export function ReportForm() {
  const router = useRouter();
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!description.trim()) {
      setError("Please provide a description.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await submitReport({
        category,
        description: description.trim(),
      });

      if ("error" in result) {
        setError(result.error);
        setSubmitting(false);
        return;
      }

      setDone(true);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6">
        <p className="font-medium text-green-800">
          Report submitted
        </p>
        <p className="mt-1 text-sm text-green-700">
          Thank you. Our team will review it.
        </p>
        <Link
          href="/dashboard/participant/safety"
          className="mt-4 inline-block text-sm font-medium text-green-800 underline"
        >
          Back to Safety
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div
          className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="category"
          className="mb-1 block text-sm font-medium text-[var(--color-ink-muted)]"
        >
          Category (optional)
        </label>
        <select
          id="category"
          className="input-refined w-full text-sm text-[var(--color-ink)]"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Select…</option>
          <option value="user">User behaviour</option>
          <option value="gig">Gig / listing</option>
          <option value="safety">Safety concern</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="description"
          className="mb-1 block text-sm font-medium text-[var(--color-ink-muted)]"
        >
          Description (required)
        </label>
        <textarea
          id="description"
          rows={4}
          className="input-refined w-full text-sm text-[var(--color-ink)]"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={submitting}
          className="btn-portal-primary"
        >
          {submitting ? "Submitting…" : "Submit report"}
        </button>
        <Link
          href="/dashboard/participant/safety"
          className="inline-flex items-center text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
