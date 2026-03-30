"use client";

import Link from "next/link";
import { PAYMENT_DISCLOSURE_TITLE } from "@/lib/legal";
import { LEGAL_ACKNOWLEDGMENT_REQUIRED_MESSAGE } from "@/lib/legal";

export function LegalAcknowledgmentModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-labelledby="legal-modal-title"
    >
      <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
        <h2 id="legal-modal-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {PAYMENT_DISCLOSURE_TITLE}
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          You must accept the Payment &amp; Liability disclosure before you can
          continue. This is a one-time requirement.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/legal/acknowledgment"
            className="rounded-md border-[2px] border-black bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-800"
          >
            Accept disclosure
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export { LEGAL_ACKNOWLEDGMENT_REQUIRED_MESSAGE };
