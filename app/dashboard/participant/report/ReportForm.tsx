"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabaseClient";

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
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("You must be signed in to report.");
        setSubmitting(false);
        return;
      }

      const { error: insertError } = await supabase.from("reports").insert({
        reporter_id: user.id,
        category: category || null,
        description: description.trim(),
        status: "pending",
      });

      if (insertError) {
        setError("Could not submit report. Please try again.");
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
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-950/50">
        <p className="font-medium text-green-800 dark:text-green-200">
          Report submitted
        </p>
        <p className="mt-1 text-sm text-green-700 dark:text-green-300">
          Thank you. Our team will review it.
        </p>
        <Link
          href="/dashboard/participant/safety"
          className="mt-4 inline-block text-sm font-medium text-green-800 underline dark:text-green-200"
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
          className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/50 dark:text-red-200"
          role="alert"
        >
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="category"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Category (optional)
        </label>
        <select
          id="category"
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
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
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Description (required)
        </label>
        <textarea
          id="description"
          rows={4}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {submitting ? "Submitting…" : "Submit report"}
        </button>
        <Link
          href="/dashboard/participant/safety"
          className="inline-flex items-center text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
