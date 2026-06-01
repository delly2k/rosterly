"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShieldOff } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import { unblockUser } from "@/app/dashboard/settings/actions";
import type { BlockedUserRow } from "@/app/dashboard/settings/actions";

export function BlockedUsersList({ blockedUsers }: { blockedUsers: BlockedUserRow[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUnblock(blockedUserId: string) {
    setPendingId(blockedUserId);
    setError(null);
    const result = await unblockUser(blockedUserId);
    if (!result.ok) {
      setError(result.error ?? "Could not unblock user.");
      setPendingId(null);
      return;
    }
    router.refresh();
    setPendingId(null);
  }

  if (blockedUsers.length === 0) {
    return (
      <EmptyState
        icon={ShieldOff}
        title="No blocked users"
        description="Users you block in chat will appear here"
      />
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      )}
      <ul className="divide-y divide-[var(--color-border)] rounded-lg border border-[var(--color-border)]">
        {blockedUsers.map((row) => (
          <li
            key={row.id}
            className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[var(--color-ink)]">
                {row.display_name ?? `User ${row.blocked_id.slice(0, 8)}…`}
              </p>
              <p className="mt-0.5 text-xs capitalize text-[var(--color-ink-muted)]">
                {row.role}
              </p>
            </div>
            <button
              type="button"
              disabled={pendingId === row.blocked_id}
              onClick={() => void handleUnblock(row.blocked_id)}
              className="btn-settings-secondary text-sm disabled:opacity-50"
            >
              {pendingId === row.blocked_id ? "Unblocking…" : "Unblock"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
