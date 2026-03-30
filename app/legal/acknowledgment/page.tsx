"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { acceptPaymentDisclosure } from "@/app/legal/actions";
import {
  PAYMENT_DISCLOSURE_TITLE,
  PAYMENT_DISCLOSURE_CONTENT,
  PAYMENT_DISCLOSURE_CHECKBOX_LABEL,
} from "@/lib/legal";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";

export default function LegalAcknowledgmentPage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!checked) return;
    setError(null);
    setLoading(true);
    try {
      await acceptPaymentDisclosure();
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      // Next.js redirect() throws; don't show as error
      const errObj = err as { digest?: string; message?: string };
      if (errObj?.digest?.startsWith("NEXT_REDIRECT")) return;
      const message =
        err instanceof Error
          ? err.message
          : typeof errObj?.message === "string"
            ? errObj.message
            : "Could not save. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardTitle>{PAYMENT_DISCLOSURE_TITLE}</CardTitle>
        <CardDescription>
          Please read the following before continuing to the dashboard.
        </CardDescription>

        <div
          className="mt-4 max-h-48 overflow-y-auto rounded border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300"
          role="document"
        >
          {PAYMENT_DISCLOSURE_CONTENT.split("\n").map((line, i) => (
            <p key={i} className="mb-2 last:mb-0">
              {line}
            </p>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          )}
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500"
            />
            <span className="text-sm text-zinc-700 dark:text-zinc-300">
              {PAYMENT_DISCLOSURE_CHECKBOX_LABEL}
            </span>
          </label>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={!checked || loading}
              className="rounded-md border-[2px] border-black bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-800 disabled:opacity-50 disabled:shadow-none"
            >
              {loading ? "Saving…" : "Accept and continue"}
            </button>
            <Link
              href="/dashboard"
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Cancel
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
