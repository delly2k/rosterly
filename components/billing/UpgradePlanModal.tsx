"use client";

import Link from "next/link";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
};

export function UpgradePlanModal({
  open,
  onClose,
  title = "Upgrade your plan",
  message = "You've reached your plan limit for active gigs. Upgrade to add more gigs and grow your business.",
}: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-modal-title"
    >
      <div className="surface-card w-full max-w-md p-6">
        <h2 id="upgrade-modal-title" className="portal-section-title text-xl">
          {title}
        </h2>
        <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{message}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={onClose} className="btn-portal-secondary text-sm">
            Close
          </button>
          <Link href="/dashboard/settings/billing" className="btn-portal-primary text-sm">
            Go to billing
          </Link>
        </div>
      </div>
    </div>
  );
}
