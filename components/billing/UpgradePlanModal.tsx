"use client";

import Link from "next/link";

const modalBase =
  "rounded-[4px] border-[3px] border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]";

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
      <div className={`w-full max-w-md bg-white ${modalBase}`}>
        <h2 id="upgrade-modal-title" className="text-xl font-bold text-black">
          {title}
        </h2>
        <p className="mt-2 text-sm text-black/80">{message}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex rounded-[4px] border-[3px] border-black bg-white px-4 py-2 text-sm font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-100"
          >
            Close
          </button>
          <Link
            href="/dashboard/settings/billing"
            className="inline-flex rounded-[4px] border-[3px] border-black bg-[#84CC16] px-4 py-2 text-sm font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#A3E635]"
          >
            Go to billing
          </Link>
        </div>
      </div>
    </div>
  );
}
