"use client";

import Link from "next/link";

type Props = {
  onUpgradeClick?: () => void;
};

export function PlanLimitBanner({ onUpgradeClick }: Props) {
  return (
    <div
      className="surface-card border border-[rgba(217,119,6,0.3)] bg-[var(--color-warning-light)] p-4"
      role="alert"
    >
      <p className="font-semibold text-[var(--color-warning)]">
        You have reached your plan limit. Upgrade to continue.
      </p>
      <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
        Go to Billing to change your plan and add more active gigs.
      </p>
      <div className="mt-3">
        {onUpgradeClick ? (
          <button type="button" onClick={onUpgradeClick} className="btn-portal-primary text-sm">
            Upgrade plan
          </button>
        ) : (
          <Link href="/dashboard/settings/billing" className="btn-portal-primary text-sm">
            Upgrade plan
          </Link>
        )}
      </div>
    </div>
  );
}
