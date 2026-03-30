"use client";

import Link from "next/link";

const bannerBase =
  "rounded-[4px] border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]";

type Props = {
  onUpgradeClick?: () => void;
};

export function PlanLimitBanner({ onUpgradeClick }: Props) {
  return (
    <div
      className={`${bannerBase} border-amber-500 bg-amber-100 dark:border-amber-700 dark:bg-amber-950/40`}
      role="alert"
    >
      <p className="font-bold text-amber-900 dark:text-amber-100">
        You have reached your plan limit. Upgrade to continue.
      </p>
      <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
        Go to Billing to change your plan and add more active gigs.
      </p>
      <div className="mt-3">
        {onUpgradeClick ? (
          <button
            type="button"
            onClick={onUpgradeClick}
            className="rounded-[4px] border-2 border-black bg-amber-200 px-3 py-1.5 text-sm font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-amber-300 dark:bg-amber-800 dark:text-black dark:hover:bg-amber-700"
          >
            Upgrade plan
          </button>
        ) : (
          <Link
            href="/dashboard/settings/billing"
            className="inline-block rounded-[4px] border-2 border-black bg-amber-200 px-3 py-1.5 text-sm font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-amber-300 dark:bg-amber-800 dark:text-black dark:hover:bg-amber-700"
          >
            Upgrade plan
          </Link>
        )}
      </div>
    </div>
  );
}
