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
        className="btn-admin-primary"
      >
        {loading ? "Setting…" : "Set profile photo from verification"}
      </button>
      {message && (
        <p
          className={`mt-2 text-sm ${message.type === "ok" ? "text-[var(--color-green)]" : "text-[var(--color-danger)]"}`}
          role="status"
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
