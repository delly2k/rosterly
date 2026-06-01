"use client";

import Link from "next/link";
import { useState } from "react";
import { Briefcase } from "lucide-react";
import type { UsageSummary } from "@/lib/billing/gating";
import { PlanLimitBanner } from "@/components/billing/PlanLimitBanner";
import { UpgradePlanModal } from "@/components/billing/UpgradePlanModal";
import EmptyState from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { MerchantGigCard, type MerchantGigListItem } from "./MerchantGigCard";

type Props = {
  canPost: boolean;
  usageSummary: UsageSummary | null;
  gigs: MerchantGigListItem[];
};

export function GigsPageClient({ canPost, usageSummary, gigs }: Props) {
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const atLimit = usageSummary?.atLimit ?? false;
  const showCreateGig = canPost && !atLimit;
  const showCreateGigDisabled = canPost && atLimit;

  return (
    <div className="page-bg space-y-8">
      {atLimit && (
        <PlanLimitBanner onUpgradeClick={() => setUpgradeModalOpen(true)} />
      )}

      <PageHeader
        icon={Briefcase}
        title="My gigs"
        description="Post and manage your gig listings"
        action={
          showCreateGig ? (
            <Link href="/dashboard/merchant/gigs/new" className="btn-portal-primary inline-flex text-sm">
              Create gig
            </Link>
          ) : showCreateGigDisabled ? (
            <button
              type="button"
              onClick={() => setUpgradeModalOpen(true)}
              className="btn-portal-secondary text-sm"
            >
              Create gig (plan limit reached)
            </button>
          ) : null
        }
      />

      {gigs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No gigs posted yet"
          description="Post your first gig to start finding talent"
          variant="gold"
          action={
            showCreateGig
              ? { label: "Post a gig", href: "/dashboard/merchant/gigs/new" }
              : showCreateGigDisabled
                ? {
                    label: "Upgrade to create more gigs",
                    onClick: () => setUpgradeModalOpen(true),
                  }
                : undefined
          }
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {gigs.map((gig) => (
            <MerchantGigCard key={gig.id} gig={gig} />
          ))}
        </div>
      )}

      <UpgradePlanModal
        open={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
      />
    </div>
  );
}
