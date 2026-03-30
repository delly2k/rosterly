"use client";

import Link from "next/link";
import { useState } from "react";
import type { UsageSummary } from "@/lib/billing/gating";
import { PlanLimitBanner } from "@/components/billing/PlanLimitBanner";
import { UpgradePlanModal } from "@/components/billing/UpgradePlanModal";

type GigItem = {
  id: string;
  title: string;
  status: string;
  location_general: string | null;
  pay_rate: number | null;
  spots: number;
  spots_filled?: number;
};

type Props = {
  canPost: boolean;
  usageSummary: UsageSummary | null;
  gigs: GigItem[];
};

export function GigsPageClient({ canPost, usageSummary, gigs }: Props) {
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const atLimit = usageSummary?.atLimit ?? false;
  const showCreateGig = canPost && !atLimit;
  const showCreateGigDisabled = canPost && atLimit;

  return (
    <div className="space-y-8">
      {atLimit && (
        <PlanLimitBanner onUpgradeClick={() => setUpgradeModalOpen(true)} />
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="page-title tracking-tight">My gigs</h1>
        {showCreateGig && (
          <Link
            href="/dashboard/merchant/gigs/new"
            className="inline-flex rounded-md border-2 border-black bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Create gig
          </Link>
        )}
        {showCreateGigDisabled && (
          <button
            type="button"
            onClick={() => setUpgradeModalOpen(true)}
            className="inline-flex rounded-md border-2 border-zinc-400 bg-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:bg-zinc-600 dark:text-zinc-300"
          >
            Create gig (plan limit reached)
          </button>
        )}
      </div>

      {gigs.length === 0 ? (
        <div className="rounded-lg border-2 border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-600 dark:text-zinc-400">
            No gigs yet. Create one to start receiving applications.
          </p>
          {showCreateGig && (
            <Link
              href="/dashboard/merchant/gigs/new"
              className="mt-4 inline-block text-sm font-medium text-zinc-900 underline dark:text-zinc-100"
            >
              Create your first gig
            </Link>
          )}
          {showCreateGigDisabled && (
            <button
              type="button"
              onClick={() => setUpgradeModalOpen(true)}
              className="mt-4 inline-block text-sm font-medium text-amber-700 underline dark:text-amber-300"
            >
              Upgrade to create more gigs
            </button>
          )}
        </div>
      ) : (
        <ul className="space-y-4">
          {gigs.map((gig) => (
            <li key={gig.id}>
              <Link
                href={`/dashboard/merchant/gigs/${gig.id}`}
                className="block rounded-lg border-2 border-zinc-200 bg-white p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/50"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-medium text-zinc-900 dark:text-zinc-100">
                    {gig.title}
                  </h2>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      gig.status === "open"
                        ? "bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-200"
                        : gig.status === "filled"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-200"
                          : "bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {gig.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {gig.location_general || "No location"}
                  {gig.pay_rate != null && ` · $${gig.pay_rate}/hr`}
                </p>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-500">
                  {gig.spots_filled ?? 0} of {gig.spots ?? 1} spots filled
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <UpgradePlanModal
        open={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
      />
    </div>
  );
}
