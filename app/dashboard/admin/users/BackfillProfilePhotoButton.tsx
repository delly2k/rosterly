"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { backfillProfilePhotoFromVerification } from "@/app/dashboard/admin/actions";

export function BackfillProfilePhotoButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  async function handleClick() {
    setMessage(null);
    setLoading(true);
    try {
      const result = await backfillProfilePhotoFromVerification(userId);
      if (result.ok) {
        setMessage({ type: "ok", text: "Profile photo set from verification." });
        router.refresh();
      } else {
        setMessage({ type: "error", text: result.error ?? "Failed." });
      }
    } catch {
      setMessage({ type: "error", text: "Something went wrong." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
      >
        {loading ? "Setting…" : "Set profile photo from verification"}
      </button>
      {message && (
        <p
          className={`mt-2 text-sm ${message.type === "ok" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
          role="status"
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
