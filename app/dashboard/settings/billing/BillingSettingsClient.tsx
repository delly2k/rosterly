"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Check } from "lucide-react";
import type { MerchantSubscriptionRow } from "@/lib/billing/types";
import type { TierName, SubscriptionStatus } from "@/lib/billing/types";
import { getTierLimits } from "@/lib/billing/tierConfig";
import { cancelTierAction } from "./actions";

function StatusBadge({ status }: { status: SubscriptionStatus }) {
  const className: Record<SubscriptionStatus, string> = {
    trialing: "pill-gold",
    active: "pill-green",
    past_due: "pill-warning",
    canceled: "pill-danger",
  };
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return <span className={className[status]}>{label}</span>;
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
      <div className="surface-card p-6">
        <h2 className="admin-section-title">Usage</h2>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">Active gigs vs plan limit</p>
        <p className="mt-4 text-3xl font-bold tabular-nums text-[var(--color-ink)]">
          {usageLabel}
          {usageCap != null && (
            <span className="ml-2 text-base font-normal text-[var(--color-ink-muted)]">
              active gigs
            </span>
          )}
        </p>
      </div>

      <div className="surface-card border-[var(--color-gold-border)] bg-[var(--color-gold-light)] p-6">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-[var(--color-gold)]" />
          <h2 className="admin-section-title">Current plan</h2>
        </div>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Your subscription and renewal.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <span className="text-xl font-bold capitalize text-[var(--color-ink)]">
            {formatTier(tier)}
          </span>
          <StatusBadge status={status} />
          {sub?.current_period_end && status !== "canceled" && (
            <span className="text-sm text-[var(--color-ink-muted)]">
              Renewal:{" "}
              {new Date(sub.current_period_end).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          )}
        </div>
        {status !== "canceled" && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setCancelModalOpen(true)}
              className="btn-settings-danger"
            >
              Cancel subscription
            </button>
          </div>
        )}
      </div>

      <div>
        <h2 className="admin-section-title mb-4">Plans</h2>
        <div className="grid gap-4 sm:grid-cols-3">
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
            className={`surface-card relative flex flex-col p-6 ${
                  isCurrent
                    ? "border-2 border-[var(--color-gold)] bg-[var(--color-gold-light)]"
                    : ""
                } ${isPopular && !isCurrent ? "border-[var(--color-gold)]" : ""}`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-4 rounded-full bg-[var(--color-gold)] px-2 py-0.5 text-xs font-medium text-white">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold capitalize text-[var(--color-ink)]">
                  {formatTier(t)}
                </h3>
                <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{capText}</p>
                <div className="mt-6 flex flex-1 flex-col justify-end">
                  {isCurrent ? (
                    <span className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-page)] px-4 py-2 text-sm font-medium text-[var(--color-ink)]">
                      <Check className="h-4 w-4" />
                      Current plan
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleUpgrade(t)}
                      disabled={upgrading !== null}
                      className="btn-settings-save mt-auto disabled:opacity-50"
                    >
                      {upgrading === t ? "Upgrading…" : "Upgrade"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {cancelModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-modal-title"
        >
          <div className="surface-card w-full max-w-md p-6">
            <h2 id="cancel-modal-title" className="admin-section-title">
              Cancel subscription?
            </h2>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              Your plan will be canceled. You can resubscribe anytime.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                disabled={canceling}
                className="btn-settings-secondary"
              >
                Keep plan
              </button>
              <button
                type="button"
                onClick={handleCancelConfirm}
                disabled={canceling}
                className="btn-settings-danger"
              >
                {canceling ? "Canceling…" : "Cancel subscription"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[var(--color-gold)] px-4 py-2 text-sm font-medium text-white shadow-lg"
          role="status"
          aria-live="polite"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
