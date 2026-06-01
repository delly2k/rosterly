"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setProfileStatus } from "@/app/dashboard/admin/actions";
import { PROFILE_STATUS } from "@/lib/roles";

export function UserStatusActions({
  userId,
  currentStatus,
  isAdmin,
}: {
  userId: string;
  currentStatus: string;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (isAdmin) {
    return (
      <span className="text-xs text-[var(--color-ink-muted)]">
        Cannot change admin
      </span>
    );
  }

  async function handleStatus(status: "active" | "suspended" | "banned") {
    setLoading(status);
    setError(null);
    try {
      await setProfileStatus(userId, status);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {error && (
        <span className="text-xs text-[var(--color-danger)]">{error}</span>
      )}
      {currentStatus !== PROFILE_STATUS.ACTIVE && (
        <button
          type="button"
          onClick={() => handleStatus(PROFILE_STATUS.ACTIVE)}
          disabled={!!loading}
          className="btn-admin-primary"
        >
          {loading === PROFILE_STATUS.ACTIVE ? "…" : "Activate"}
        </button>
      )}
      {currentStatus !== PROFILE_STATUS.SUSPENDED && (
        <button
          type="button"
          onClick={() => handleStatus(PROFILE_STATUS.SUSPENDED)}
          disabled={!!loading}
          className="btn-admin-secondary"
        >
          {loading === PROFILE_STATUS.SUSPENDED ? "…" : "Suspend"}
        </button>
      )}
      {currentStatus !== PROFILE_STATUS.BANNED && (
        <button
          type="button"
          onClick={() => handleStatus(PROFILE_STATUS.BANNED)}
          disabled={!!loading}
          className="btn-admin-danger"
        >
          {loading === PROFILE_STATUS.BANNED ? "…" : "Ban"}
        </button>
      )}
    </div>
  );
}
