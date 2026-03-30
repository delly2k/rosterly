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

function MetricCard({
  icon: Icon,
  label,
  value,
  accent = "zinc",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  accent?: "zinc" | "sky" | "amber" | "emerald";
}) {
  const bg =
    accent === "sky"
      ? "bg-sky-50 dark:bg-sky-950/20"
      : accent === "amber"
        ? "bg-amber-50 dark:bg-amber-950/20"
        : accent === "emerald"
          ? "bg-emerald-50 dark:bg-emerald-950/20"
          : "bg-zinc-50 dark:bg-zinc-800/30";
  const iconBg =
    accent === "sky"
      ? "bg-sky-200 dark:bg-sky-800/60"
      : accent === "amber"
        ? "bg-amber-200 dark:bg-amber-800/60"
        : accent === "emerald"
          ? "bg-emerald-200 dark:bg-emerald-800/60"
          : "bg-zinc-200 dark:bg-zinc-700";
  const iconColor =
    accent === "sky"
      ? "text-sky-700 dark:text-sky-200"
      : accent === "amber"
        ? "text-amber-800 dark:text-amber-200"
        : accent === "emerald"
          ? "text-emerald-700 dark:text-emerald-200"
          : "text-zinc-700 dark:text-zinc-300";
  return (
    <div
      className={`flex h-full min-h-[88px] items-center gap-4 rounded-xl border-2 p-4 shadow-sm ${bg} ${
        accent === "sky"
          ? "border-sky-200 dark:border-sky-800/60"
          : accent === "amber"
            ? "border-amber-200 dark:border-amber-800/60"
            : accent === "emerald"
              ? "border-emerald-200 dark:border-emerald-800/60"
              : "border-zinc-200/80 dark:border-zinc-700/80"
      }`}
    >
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 line-clamp-2">
          {label}
        </p>
        <p className="mt-0.5 text-xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
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
      {/* Section 1 — Snapshot metrics */}
      <section>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          <div className="min-w-0 h-full">
            <MetricCard
              icon={Briefcase}
              label="Active gigs"
              value={data.activeGigsCount}
              accent="sky"
            />
          </div>
          <div className="min-w-0 h-full">
            <MetricCard
              icon={Users}
              label="Applicants awaiting review"
              value={data.applicantsAwaitingReview}
              accent="amber"
            />
          </div>
          <div className="min-w-0 h-full">
            <MetricCard
              icon={UserCheck}
              label="Confirmed this week"
              value={data.confirmedThisWeek}
              accent="emerald"
            />
          </div>
          <div className="min-w-0 h-full">
            <MetricCard
              icon={AlertCircle}
              label="Action required"
              value={actionRequired}
              accent={actionRequired > 0 ? "amber" : "zinc"}
            />
          </div>
        </div>
      </section>

      {/* Billing widget — always show for merchants so they can find subscribe / manage plan */}
      <section>
        <div className="rounded-xl border-2 border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/30 sm:p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-200 dark:bg-zinc-700">
              <CreditCard className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
            </span>
            Billing
          </h2>
          {usage ? (
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
              <span className="font-medium capitalize text-zinc-900 dark:text-zinc-100">
                {usage.tier}
              </span>
              <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-600 dark:text-zinc-200">
                {usage.status}
              </span>
              <span className="text-zinc-600 dark:text-zinc-400">
                Usage:{" "}
                {usage.maxActiveGigs != null
                  ? `${usage.activeGigs} / ${usage.maxActiveGigs} active gigs`
                  : `${usage.activeGigs} active (unlimited)`}
              </span>
              <Link
                href="/dashboard/settings/billing"
                className="text-sm font-medium text-[#1D4ED8] hover:underline"
              >
                Manage billing →
              </Link>
            </div>
          ) : (
            <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              <p>Manage your subscription and plan limits.</p>
              <Link
                href="/dashboard/settings/billing"
                className="mt-2 inline-block font-medium text-[#1D4ED8] hover:underline"
              >
                Go to Billing →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Section 2 — Today's operations */}
      <section>
        <div className="rounded-xl border-2 border-sky-200 bg-white p-5 shadow-sm dark:border-sky-800/50 dark:bg-sky-950/10 sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-900/50">
              <Calendar className="h-4 w-4 text-sky-700 dark:text-sky-300" />
            </span>
            Today&apos;s gigs
          </h2>
          {data.todayGigs.length === 0 ? (
            <div className="mt-6 rounded-lg border border-dashed border-zinc-200 bg-zinc-50/50 py-10 text-center dark:border-zinc-700 dark:bg-zinc-800/30">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                No gigs scheduled for today.
              </p>
              <Link
                href="/dashboard/merchant/gigs"
                className="mt-3 inline-block text-sm font-medium text-[#1D4ED8] underline underline-offset-2 hover:no-underline"
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
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-700/70 dark:bg-zinc-800/30"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        <Clock className="h-4 w-4" />
                        {start}
                      </span>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {gig.title}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-zinc-200 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-600 dark:text-zinc-200">
                        {gig.spots_filled ?? 0} / {gig.spots ?? 1} staff
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        Check-in: {checkedIn} / {required}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          gig.status === "filled"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200"
                            : gig.status === "open"
                              ? "bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200"
                              : "bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        {gig.status}
                      </span>
                      <div className="flex gap-2">
                        <Link
                          href={`/dashboard/merchant/gigs/${gig.id}`}
                          className="rounded-md bg-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-300 dark:bg-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-500"
                        >
                          View team
                        </Link>
                        <Link
                          href="/dashboard/merchant/chats"
                          className="rounded-md bg-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-300 dark:bg-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-500"
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

      {/* Section 3 — Hiring pipeline (2-column) */}
      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border-2 border-amber-200 bg-amber-50/50 p-5 shadow-sm dark:border-amber-800/50 dark:bg-amber-950/20 sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-200 dark:bg-amber-800/50">
              <Users className="h-4 w-4 text-amber-800 dark:text-amber-200" />
            </span>
            New applicants needing review
          </h2>
          {data.pendingApplicationsByGig.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
              No pending applications.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {data.pendingApplicationsByGig.slice(0, 3).map((item) => (
                <li key={item.gigId}>
                  <Link
                    href={`/dashboard/merchant/gigs/${item.gigId}`}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  >
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {item.gigTitle}
                    </span>
                    <span className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                        {item.count} pending
                      </span>
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
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#1D4ED8] hover:underline"
            >
              Review applicants
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50/50 p-5 shadow-sm dark:border-emerald-800/50 dark:bg-emerald-950/20 sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-200 dark:bg-emerald-800/50">
              <Briefcase className="h-4 w-4 text-emerald-800 dark:text-emerald-200" />
            </span>
            Upcoming gigs missing staff
          </h2>
          {missingStaff.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
              All upcoming gigs are fully staffed.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {missingStaff.map((g) => (
                <li key={g.id}>
                  <Link
                    href={`/dashboard/merchant/gigs/${g.id}`}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  >
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {g.title}
                    </span>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                      {g.spots - g.spots_filled} spot{g.spots - g.spots_filled !== 1 ? "s" : ""} left
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/dashboard/merchant/gigs"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#1D4ED8] hover:underline"
          >
            View all gigs
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Section 4 — Alerts & Safety */}
      <section>
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-5 shadow-sm dark:border-amber-800/50 dark:bg-amber-950/20 sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            Alerts & safety
          </h2>
          {!hasAlerts ? (
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              No pending alerts. Verification and report outcomes appear here when relevant.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {data.verificationStatus !== "verified" && (
                <li>
                  <Link
                    href="/dashboard/merchant/verification"
                    className="block rounded-lg border border-amber-200/80 bg-white px-4 py-3 text-sm dark:border-amber-800/50 dark:bg-zinc-900/50"
                  >
                    <span className="font-medium text-amber-800 dark:text-amber-200">
                      Verification: {data.verificationStatus === "pending" ? "Pending review" : "Complete verification"}
                    </span>
                  </Link>
                </li>
              )}
              {data.pendingReportsAboutYou > 0 && (
                <li className="rounded-lg border border-amber-200/80 bg-white px-4 py-3 text-sm dark:border-amber-800/50 dark:bg-zinc-900/50">
                  <span className="font-medium text-amber-800 dark:text-amber-200">
                    {data.pendingReportsAboutYou} report{data.pendingReportsAboutYou !== 1 ? "s" : ""} about you pending review
                  </span>
                </li>
              )}
              {data.noShowCount > 0 && (
                <li className="rounded-lg border border-amber-200/80 bg-white px-4 py-3 text-sm dark:border-amber-800/50 dark:bg-zinc-900/50">
                  <span className="font-medium text-amber-800 dark:text-amber-200">
                    {data.noShowCount} staff no-show{data.noShowCount !== 1 ? "s" : ""} recorded
                  </span>
                </li>
              )}
              {data.reportOutcomes.length > 0 && (
                <li className="rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-900/50">
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">
                    Report outcomes: {data.reportOutcomes.length} resolved/dismissed
                  </span>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    You can see details in Settings → Safety.
                  </p>
                </li>
              )}
            </ul>
          )}
        </div>
      </section>

      {/* Section 5 — Quick actions */}
      <section>
        <div className="flex flex-wrap gap-3">
          {data.canPostGigs && (
            atLimit ? (
              <button
                type="button"
                onClick={() => setUpgradeModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-zinc-400 bg-zinc-200 px-5 py-2.5 text-sm font-semibold text-zinc-600 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
              >
                <Briefcase className="h-4 w-4" />
                Post new gig (plan limit reached)
              </button>
            ) : (
              <Link
                href="/dashboard/merchant/gigs/new"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-[#84CC16] bg-[#84CC16] px-5 py-2.5 text-sm font-semibold text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-[#A3E635] dark:border-[#84CC16] dark:bg-[#84CC16] dark:text-black dark:hover:bg-[#A3E635]"
              >
                <Briefcase className="h-4 w-4" />
                Post new gig
              </Link>
            )
          )}
          <Link
            href="/dashboard/merchant/gigs"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            <Users className="h-4 w-4" />
            Review applicants
          </Link>
          <Link
            href="/dashboard/merchant/chats"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            <MessageCircle className="h-4 w-4" />
            Message staff
          </Link>
          <Link
            href="/dashboard/merchant/gigs"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            <Briefcase className="h-4 w-4" />
            View all gigs
          </Link>
        </div>
      </section>

      <UpgradePlanModal
        open={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
      />
    </div>
  );
}
