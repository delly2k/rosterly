"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Briefcase,
  Users,
  UserCheck,
  AlertCircle,
  Calendar,
  MessageCircle,
  Shield,
  ChevronRight,
  Clock,
  CreditCard,
} from "lucide-react";
import type { MerchantDashboardData } from "@/app/dashboard/merchant/actions";
import { UpgradePlanModal } from "@/components/billing/UpgradePlanModal";

function gigStatusClass(status: string) {
  if (status === "open") return "pill-green";
  if (status === "draft") return "pill-gray";
  if (status === "closed" || status === "filled") return "pill-gold";
  if (status === "cancelled") return "pill-danger";
  return "pill-gray";
}

function MetricCard({
  icon: Icon,
  label,
  value,
  tile = "gold",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  tile?: "gold" | "green" | "warning" | "muted";
}) {
  const tileClass =
    tile === "green"
      ? "bg-[var(--color-green-light)] text-[var(--color-green)]"
      : tile === "warning"
        ? "bg-[var(--color-warning-light)] text-[var(--color-warning)]"
        : tile === "muted"
          ? "bg-[#F9F8F5] text-[var(--color-ink-muted)]"
          : "bg-[var(--color-gold-light)] text-[var(--color-gold)]";

  return (
    <div className="surface-card flex h-full min-h-[88px] flex-col p-4">
      <div
        className={`mb-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tileClass}`}
      >
        <Icon className="h-[18px] w-[18px]" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="stat-label line-clamp-2">{label}</p>
        <p className="mt-0.5 text-xl font-semibold tabular-nums text-[var(--color-ink)]">
          {value}
        </p>
      </div>
    </div>
  );
}

function actionRequiredCount(data: MerchantDashboardData): number {
  let n = 0;
  if (data.verificationStatus !== "verified") n += 1;
  n += data.applicantsAwaitingReview;
  n += data.pendingReportsAboutYou;
  if (data.noShowCount > 0) n += 1;
  return n;
}

function upcomingGigsMissingStaff(
  gigs: MerchantDashboardData["gigs"]
): { id: string; title: string; spots: number; spots_filled: number }[] {
  const now = new Date();
  return gigs
    .filter((g) => {
      const start = g.start_time ? new Date(g.start_time) : null;
      return (
        (g.status === "open" || g.status === "filled") &&
        start &&
        start >= now &&
        (g.spots_filled ?? 0) < (g.spots ?? 1)
      );
    })
    .sort((a, b) => {
      const sa = a.start_time ? new Date(a.start_time).getTime() : 0;
      const sb = b.start_time ? new Date(b.start_time).getTime() : 0;
      return sa - sb;
    })
    .slice(0, 5)
    .map((g) => ({
      id: g.id,
      title: g.title,
      spots: g.spots ?? 1,
      spots_filled: g.spots_filled ?? 0,
    }));
}

export function MerchantDashboardClient({ data }: { data: MerchantDashboardData }) {
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const actionRequired = actionRequiredCount(data);
  const missingStaff = upcomingGigsMissingStaff(data.gigs);
  const usage = data.usageSummary;
  const atLimit = usage?.atLimit ?? false;
  const hasAlerts =
    data.reportOutcomes.length > 0 ||
    data.noShowCount > 0 ||
    data.pendingReportsAboutYou > 0 ||
    data.verificationStatus !== "verified";

  return (
    <div className="space-y-8">
      <section>
        <div className="grid grid-cols-4 gap-5">
          <div className="min-w-0 h-full">
            <MetricCard icon={Briefcase} label="Active gigs" value={data.activeGigsCount} tile="gold" />
          </div>
          <div className="min-w-0 h-full">
            <MetricCard
              icon={Users}
              label="Applicants awaiting review"
              value={data.applicantsAwaitingReview}
              tile="warning"
            />
          </div>
          <div className="min-w-0 h-full">
            <MetricCard
              icon={UserCheck}
              label="Confirmed this week"
              value={data.confirmedThisWeek}
              tile="green"
            />
          </div>
          <div className="min-w-0 h-full">
            <MetricCard
              icon={AlertCircle}
              label="Action required"
              value={actionRequired}
              tile={actionRequired > 0 ? "warning" : "muted"}
            />
          </div>
        </div>
      </section>

      <section>
        <div className="surface-card p-4 sm:p-5">
          <h2 className="portal-section-title flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-gold-light)]">
              <CreditCard className="h-4 w-4 text-[var(--color-gold)]" />
            </span>
            Billing
          </h2>
          {usage ? (
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
              <span className="font-medium capitalize text-[var(--color-ink)]">
                {usage.tier}
              </span>
              <span className="pill-gray">{usage.status}</span>
              <span className="text-[var(--color-ink-muted)]">
                Usage:{" "}
                {usage.maxActiveGigs != null
                  ? `${usage.activeGigs} / ${usage.maxActiveGigs} active gigs`
                  : `${usage.activeGigs} active (unlimited)`}
              </span>
              <Link
                href="/dashboard/settings/billing"
                className="text-sm font-medium text-[var(--color-gold)] hover:underline"
              >
                Manage billing →
              </Link>
            </div>
          ) : (
            <div className="mt-3 text-sm text-[var(--color-ink-muted)]">
              <p>Manage your subscription and plan limits.</p>
              <Link
                href="/dashboard/settings/billing"
                className="mt-2 inline-block font-medium text-[var(--color-gold)] hover:underline"
              >
                Go to Billing →
              </Link>
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="surface-card p-5 sm:p-6">
          <h2 className="portal-section-title flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-gold-light)]">
              <Calendar className="h-4 w-4 text-[var(--color-gold)]" />
            </span>
            Today&apos;s gigs
          </h2>
          {data.todayGigs.length === 0 ? (
            <div className="mt-6 rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-page)] py-10 text-center">
              <p className="text-sm text-[var(--color-ink-muted)]">
                No gigs scheduled for today.
              </p>
              <Link
                href="/dashboard/merchant/gigs"
                className="mt-3 inline-block text-sm font-medium text-[var(--color-gold)] underline underline-offset-2 hover:no-underline"
              >
                View all gigs
              </Link>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {data.todayGigs.map((gig) => {
                const start = gig.start_time
                  ? new Date(gig.start_time).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })
                  : "—";
                const checkedIn = data.todayCheckinsByGig[gig.id] ?? 0;
                const required = gig.spots_filled ?? 0;
                return (
                  <li
                    key={gig.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-page)] p-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-[var(--color-ink-muted)]">
                        <Clock className="h-4 w-4" />
                        {start}
                      </span>
                      <span className="font-medium text-[var(--color-ink)]">{gig.title}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="pill-gray">
                        {gig.spots_filled ?? 0} / {gig.spots ?? 1} staff
                      </span>
                      <span className="text-xs text-[var(--color-ink-muted)]">
                        Check-in: {checkedIn} / {required}
                      </span>
                      <span className={gigStatusClass(gig.status)}>{gig.status}</span>
                      <div className="flex gap-2">
                        <Link
                          href={`/dashboard/merchant/gigs/${gig.id}`}
                          className="btn-portal-secondary px-3 py-1.5 text-xs"
                        >
                          View team
                        </Link>
                        <Link
                          href="/dashboard/merchant/chats"
                          className="btn-portal-secondary px-3 py-1.5 text-xs"
                        >
                          Chats
                        </Link>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="surface-card p-5 sm:p-6">
          <h2 className="portal-section-title flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-gold-light)]">
              <Users className="h-4 w-4 text-[var(--color-gold)]" />
            </span>
            New applicants needing review
          </h2>
          {data.pendingApplicationsByGig.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--color-ink-muted)]">No pending applications.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {data.pendingApplicationsByGig.slice(0, 3).map((item) => (
                <li key={item.gigId}>
                  <Link
                    href={`/dashboard/merchant/gigs/${item.gigId}`}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-[var(--color-page)]"
                  >
                    <span className="font-medium text-[var(--color-ink)]">{item.gigTitle}</span>
                    <span className="flex items-center gap-1 text-[var(--color-ink-muted)]">
                      <span className="pill-warning">{item.count} pending</span>
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {data.applicantsAwaitingReview > 0 && (
            <Link
              href="/dashboard/merchant/gigs"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-gold)] hover:underline"
            >
              Review applicants
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        <div className="surface-card p-5 sm:p-6">
          <h2 className="portal-section-title flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-gold-light)]">
              <Briefcase className="h-4 w-4 text-[var(--color-gold)]" />
            </span>
            Upcoming gigs missing staff
          </h2>
          {missingStaff.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--color-ink-muted)]">
              All upcoming gigs are fully staffed.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {missingStaff.map((g) => (
                <li key={g.id}>
                  <Link
                    href={`/dashboard/merchant/gigs/${g.id}`}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-[var(--color-page)]"
                  >
                    <span className="font-medium text-[var(--color-ink)]">{g.title}</span>
                    <span className="pill-warning">
                      {g.spots - g.spots_filled} spot{g.spots - g.spots_filled !== 1 ? "s" : ""}{" "}
                      left
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/dashboard/merchant/gigs"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-gold)] hover:underline"
          >
            View all gigs
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section>
        <div className="surface-card p-5 sm:p-6">
          <h2 className="portal-section-title flex items-center gap-2">
            <Shield className="h-5 w-5 text-[var(--color-gold)]" />
            Alerts & safety
          </h2>
          {!hasAlerts ? (
            <p className="mt-3 text-sm text-[var(--color-ink-muted)]">
              No pending alerts. Verification and report outcomes appear here when relevant.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {data.verificationStatus !== "verified" && (
                <li>
                  <Link
                    href="/dashboard/merchant/verification"
                    className="block rounded-lg border border-[var(--color-border)] bg-[var(--color-page)] px-4 py-3 text-sm"
                  >
                    <span className="font-medium text-[var(--color-warning)]">
                      Verification:{" "}
                      {data.verificationStatus === "pending"
                        ? "Pending review"
                        : "Complete verification"}
                    </span>
                  </Link>
                </li>
              )}
              {data.pendingReportsAboutYou > 0 && (
                <li className="rounded-lg border border-[var(--color-border)] bg-[var(--color-page)] px-4 py-3 text-sm">
                  <span className="font-medium text-[var(--color-warning)]">
                    {data.pendingReportsAboutYou} report
                    {data.pendingReportsAboutYou !== 1 ? "s" : ""} about you pending review
                  </span>
                </li>
              )}
              {data.noShowCount > 0 && (
                <li className="rounded-lg border border-[var(--color-border)] bg-[var(--color-page)] px-4 py-3 text-sm">
                  <span className="font-medium text-[var(--color-warning)]">
                    {data.noShowCount} staff no-show{data.noShowCount !== 1 ? "s" : ""} recorded
                  </span>
                </li>
              )}
              {data.reportOutcomes.length > 0 && (
                <li className="rounded-lg border border-[var(--color-border)] bg-[var(--color-page)] px-4 py-3 text-sm">
                  <span className="font-medium text-[var(--color-ink)]">
                    Report outcomes: {data.reportOutcomes.length} resolved/dismissed
                  </span>
                  <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                    You can see details in Settings → Safety.
                  </p>
                </li>
              )}
            </ul>
          )}
        </div>
      </section>

      <section>
        <div className="flex flex-wrap gap-3">
          {data.canPostGigs &&
            (atLimit ? (
              <button
                type="button"
                onClick={() => setUpgradeModalOpen(true)}
                className="btn-portal-secondary inline-flex items-center gap-2 text-sm opacity-75"
              >
                <Briefcase className="h-4 w-4" />
                Post new gig (plan limit reached)
              </button>
            ) : (
              <Link
                href="/dashboard/merchant/gigs/new"
                className="btn-portal-primary inline-flex items-center gap-2 text-sm"
              >
                <Briefcase className="h-4 w-4" />
                Post new gig
              </Link>
            ))}
          <Link
            href="/dashboard/merchant/gigs"
            className="btn-portal-secondary inline-flex items-center gap-2 text-sm"
          >
            <Users className="h-4 w-4" />
            Review applicants
          </Link>
          <Link
            href="/dashboard/merchant/chats"
            className="btn-portal-secondary inline-flex items-center gap-2 text-sm"
          >
            <MessageCircle className="h-4 w-4" />
            Message staff
          </Link>
          <Link
            href="/dashboard/merchant/gigs"
            className="btn-portal-secondary inline-flex items-center gap-2 text-sm"
          >
            <Briefcase className="h-4 w-4" />
            View all gigs
          </Link>
        </div>
      </section>

      <UpgradePlanModal open={upgradeModalOpen} onClose={() => setUpgradeModalOpen(false)} />
    </div>
  );
}
