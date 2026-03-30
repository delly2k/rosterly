"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Check } from "lucide-react";
import type { MerchantSubscriptionRow } from "@/lib/billing/types";
import type { TierName, SubscriptionStatus } from "@/lib/billing/types";
import { getTierLimits } from "@/lib/billing/tierConfig";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cancelTierAction } from "./actions";

const cardBase =
  "rounded-[4px] border-[3px] border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]";

function StatusBadge({ status }: { status: SubscriptionStatus }) {
  const styles: Record<SubscriptionStatus, string> = {
    trialing: "bg-zinc-200 text-zinc-800 border-black dark:bg-zinc-700 dark:text-zinc-200",
    active: "bg-green-200 text-green-900 border-black dark:bg-green-900/50 dark:text-green-200",
    past_due: "bg-amber-200 text-amber-900 border-black dark:bg-amber-900/50 dark:text-amber-200",
    canceled: "bg-red-200 text-red-900 border-black dark:bg-red-900/50 dark:text-red-200",
  };
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span
      className={`inline-flex rounded-[4px] border-2 px-2.5 py-1 text-xs font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${styles[status]}`}
    >
      {label}
    </span>
  );
}

function formatTier(tier: TierName): string {
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

type Props = {
  subscription: MerchantSubscriptionRow | null;
  activeGigsCount: number;
};

export function BillingSettingsClient({ subscription, activeGigsCount }: Props) {
  const router = useRouter();
  const [toast, setToast] = useState<string | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [upgrading, setUpgrading] = useState<TierName | null>(null);
  const [canceling, setCanceling] = useState(false);

  const sub = subscription;
  const tier = sub?.tier ?? "starter";
  const status = (sub?.status ?? "trialing") as SubscriptionStatus;
  const limits = getTierLimits(tier);
  const usageCap = limits.max_active_gigs;
  const usageLabel =
    usageCap == null ? `${activeGigsCount} active` : `${activeGigsCount} / ${usageCap}`;

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpgrade = async (newTier: TierName) => {
    setUpgrading(newTier);
    try {
      const res = await fetch("/api/billing/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: newTier }),
      });
      const data = (await res.json()) as { approval_url?: string; error?: string };
      if (res.ok && data.approval_url) {
        window.location.href = data.approval_url;
        return;
      }
      showToast(data.error ?? "Something went wrong.");
    } finally {
      setUpgrading(null);
    }
  };

  const handleCancelConfirm = async () => {
    setCanceling(true);
    try {
      const result = await cancelTierAction();
      if (result.ok) {
        setCancelModalOpen(false);
        showToast("Subscription canceled.");
        router.refresh();
      } else {
        showToast(result.error ?? "Something went wrong.");
      }
    } finally {
      setCanceling(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Usage */}
      <div className={`${cardBase} bg-white`}>
        <h2 className="text-lg font-bold text-black md:text-xl">Usage</h2>
        <p className="mt-1 text-sm text-black/80">Active gigs vs plan limit</p>
        <p className="mt-4 text-3xl font-bold tabular-nums text-black">
          {usageLabel}
          {usageCap != null && (
            <span className="ml-2 text-base font-normal text-black/70">active gigs</span>
          )}
        </p>
      </div>

      {/* Current plan */}
      <div className={`${cardBase} border-[#84CC16] bg-[#84CC16]/20`}>
        <CardTitle className="flex items-center gap-2 text-black">
          <CreditCard className="h-5 w-5" />
          Current plan
        </CardTitle>
        <CardDescription className="text-black/80">
          Your subscription and renewal.
        </CardDescription>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <span className="text-xl font-bold capitalize text-black">{formatTier(tier)}</span>
          <StatusBadge status={status} />
          {sub?.current_period_end && status !== "canceled" && (
            <span className="text-sm text-black/80">
              Renewal: {new Date(sub.current_period_end).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          )}
        </div>
        {status !== "canceled" && (
          <div className="mt-4">
            <Button
              type="button"
              variant="safety"
              size="sm"
              onClick={() => setCancelModalOpen(true)}
            >
              Cancel subscription
            </Button>
          </div>
        )}
      </div>

      {/* Plan cards */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-black md:text-xl">Plans</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {(["starter", "growth", "pro"] as TierName[]).map((t) => {
            const isCurrent = t === tier;
            const isPopular = t === "growth";
            const limitsT = getTierLimits(t);
            const capText =
              limitsT.max_active_gigs == null
                ? "Unlimited active gigs"
                : `Up to ${limitsT.max_active_gigs} active gigs`;
            return (
              <div
                key={t}
                className={`${cardBase} relative flex flex-col bg-white ${isPopular ? "border-[#06B6D4] ring-2 ring-[#06B6D4]/30" : ""}`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-4 rounded border-2 border-[#06B6D4] bg-[#06B6D4] px-2 py-0.5 text-xs font-bold text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold capitalize text-black">{formatTier(t)}</h3>
                <p className="mt-2 text-sm text-black/80">{capText}</p>
                <div className="mt-6 flex flex-1 flex-col justify-end">
                  {isCurrent ? (
                    <span className="inline-flex items-center gap-2 rounded border-2 border-black bg-zinc-100 px-4 py-2 text-sm font-bold text-black">
                      <Check className="h-4 w-4" />
                      Current plan
                    </span>
                  ) : (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => handleUpgrade(t)}
                      disabled={upgrading !== null}
                      className="mt-auto border-2 border-black font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                    >
                      {upgrading === t ? "Upgrading…" : "Upgrade"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cancel confirmation modal */}
      {cancelModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-modal-title"
        >
          <div className="w-full max-w-md rounded-[4px] border-[3px] border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h2 id="cancel-modal-title" className="text-xl font-bold text-black">
              Cancel subscription?
            </h2>
            <p className="mt-2 text-sm text-black/80">
              Your plan will be canceled. You can resubscribe anytime.
            </p>
            <div className="mt-6 flex gap-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setCancelModalOpen(false)}
                disabled={canceling}
              >
                Keep plan
              </Button>
              <Button
                type="button"
                variant="safety"
                size="sm"
                onClick={handleCancelConfirm}
                disabled={canceling}
              >
                {canceling ? "Canceling…" : "Cancel subscription"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-[4px] border-2 border-black bg-[#84CC16] px-4 py-2 text-sm font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          role="status"
          aria-live="polite"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
