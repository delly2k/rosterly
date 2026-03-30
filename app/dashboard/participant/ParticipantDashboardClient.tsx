"use client";

import Link from "next/link";
import {
  Calendar,
  FileCheck,
  DollarSign,
  User,
  Shield,
  MessageCircle,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import type { ParticipantDashboardData } from "@/app/dashboard/participant/actions";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { VerificationBadge } from "@/app/dashboard/participant/VerificationBadge";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { ButtonLink } from "@/components/ui/Button";

const panelBase =
  "rounded-[4px] border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:p-5 md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]";

export function ParticipantDashboardClient({
  data,
  sosButton,
}: {
  data: ParticipantDashboardData;
  sosButton: React.ReactNode;
}) {
  const verificationProgress =
    data.verificationStatus === "verified"
      ? 100
      : data.verificationStatus === "pending"
        ? 50
        : 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1) Hero row */}
      <div className={`${panelBase} border-l-[6px] border-l-[#84CC16] bg-white`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="page-title tracking-tight text-black">Welcome back</h1>
              {data.verificationStatus === "verified" && (
                <VerificationBadge status="verified" />
              )}
            </div>
            <p className="mt-1 text-sm leading-relaxed text-black/80">
              Your participant dashboard — gigs, bookings, and chats in one place.
            </p>
            {data.nextConfirmedGig && (
              <div className="mt-3 flex flex-wrap items-center gap-2 rounded border-2 border-black bg-[#84CC16] p-3">
                <Calendar className="h-4 w-4 shrink-0 text-black" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-black/80">
                    Next confirmed gig
                  </p>
                  <p className="font-bold text-black">
                    {data.nextConfirmedGig.gigTitle}
                    {data.nextConfirmedGig.startTime &&
                      ` · ${new Date(data.nextConfirmedGig.startTime).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}`}
                  </p>
                </div>
                <Link
                  href={`/dashboard/participant/bookings/${data.nextConfirmedGig.bookingId}`}
                  className="ml-auto inline-flex items-center text-sm font-bold text-black underline underline-offset-2 hover:no-underline"
                >
                  View
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
          <div className="shrink-0">{sosButton}</div>
        </div>
      </div>

      {/* 2) Main grid: Upcoming bookings (left) | Application pipeline (right) */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="flex flex-col border-[#06B6D4] bg-[#06B6D4]/10">
          <CardTitle className="flex items-center gap-2 text-lg text-black md:text-xl">
            <span className="flex h-9 w-9 items-center justify-center rounded border-2 border-[#06B6D4] bg-[#06B6D4]">
              <Calendar className="h-4 w-4 text-white" />
            </span>
            Upcoming bookings
          </CardTitle>
          <CardDescription className="mt-1">
            Next 1–3 gigs by start time.
          </CardDescription>
          {data.upcomingBookings.length === 0 ? (
            <p className="mt-4 text-sm text-black/70">
              No upcoming bookings.{" "}
              <Link
                href="/dashboard/participant/gigs"
                className="font-bold underline hover:no-underline"
              >
                Browse gigs
              </Link>
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {data.upcomingBookings.map((b) => (
                <li key={b.bookingId}>
                  <Link
                    href={`/dashboard/participant/bookings/${b.bookingId}`}
                    className="block rounded border-2 border-[#06B6D4]/50 bg-white p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-colors hover:bg-[#06B6D4]/10"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-black">{b.gigTitle}</span>
                      <span className="rounded border border-black bg-[#FDE047] px-2 py-0.5 text-xs font-bold uppercase text-black">
                        {b.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-black/80">
                      {b.startTime
                        ? new Date(b.startTime).toLocaleString([], {
                            dateStyle: "short",
                            timeStyle: "short",
                          })
                        : "—"}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/dashboard/participant/bookings"
            className="mt-4 inline-flex items-center text-sm font-bold text-black underline underline-offset-2 hover:no-underline"
          >
            All bookings
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Card>

        <Card className="border-[#06B6D4] bg-[#06B6D4]">
          <CardTitle className="flex items-center gap-2 text-black text-lg md:text-xl">
            <span className="flex h-9 w-9 items-center justify-center rounded border-2 border-black bg-white">
              <FileCheck className="h-4 w-4 text-black" />
            </span>
            Application pipeline
          </CardTitle>
          <CardDescription className="text-black/90 mt-1">
            Pending, accepted, rejected.
          </CardDescription>
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="rounded border-2 border-black bg-[#F97316] p-4 text-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-2xl font-bold tabular-nums text-black md:text-3xl">
                {data.applicationCounts.pending}
              </p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wide text-black/80">
                Pending
              </p>
            </div>
            <div className="rounded border-2 border-black bg-[#84CC16] p-4 text-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-2xl font-bold tabular-nums text-black md:text-3xl">
                {data.applicationCounts.accepted}
              </p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wide text-black/80">
                Accepted
              </p>
            </div>
            <div className="rounded border-2 border-black bg-zinc-200 p-4 text-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-2xl font-bold tabular-nums text-black md:text-3xl">
                {data.applicationCounts.rejected}
              </p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wide text-black/70">
                Rejected
              </p>
            </div>
          </div>
          <div className="mt-4">
            <ButtonLink
              href="/dashboard/participant/applications"
              variant="secondary"
              size="sm"
            >
              View applications
            </ButtonLink>
          </div>
        </Card>
      </div>

      {/* 3) Second row: Earnings (left) | Profile status (right) */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-[#8B5CF6] bg-[#8B5CF6]/10">
          <CardTitle className="flex items-center gap-2 text-lg text-black md:text-xl">
            <span className="flex h-9 w-9 items-center justify-center rounded border-2 border-[#8B5CF6] bg-[#8B5CF6]">
              <DollarSign className="h-4 w-4 text-white" />
            </span>
            Earnings tracker
          </CardTitle>
          <CardDescription className="mt-1 text-black/80">
            Record only — payment features coming later.
          </CardDescription>
          <dl className="mt-4 space-y-3">
            <div className="flex justify-between border-b-2 border-black/20 py-2">
              <dt className="text-sm font-medium text-black/80">Expected earnings</dt>
              <dd className="font-bold tabular-nums text-black">—</dd>
            </div>
            <div className="flex justify-between border-b-2 border-black/20 py-2">
              <dt className="text-sm font-medium text-black/80">Pending payment confirmations</dt>
              <dd className="font-bold tabular-nums text-black">—</dd>
            </div>
            <div className="flex justify-between py-2">
              <dt className="text-sm font-medium text-black/80">Disputed payments</dt>
              <dd className="font-bold tabular-nums text-black">—</dd>
            </div>
          </dl>
        </Card>

        <Card className="border-[#EC4899] bg-[#EC4899]">
          <CardTitle className="flex items-center gap-2 text-black text-lg md:text-xl">
            <span className="flex h-9 w-9 items-center justify-center rounded border-2 border-black bg-white">
              <User className="h-4 w-4 text-black" />
            </span>
            Profile status
          </CardTitle>
          <CardDescription className="text-black/90 mt-1">
            Completion and visibility.
          </CardDescription>
          <div className="mt-6 flex flex-wrap items-center gap-6">
            <ProgressRing
              value={data.profileCompletionPercent}
              size={64}
              strokeWidth={6}
              accent="warm"
            />
            <div className="flex flex-col gap-2">
              <p className="text-2xl font-bold text-black">
                {data.profileCompletionPercent}%
              </p>
              <p className="text-sm font-medium text-black/80">Profile complete</p>
              <VerificationBadge status={data.verificationStatus} />
              {data.photoVisibilityMode && (
                <p className="text-xs font-medium text-black/70 capitalize">
                  Photo: {data.photoVisibilityMode.replace(/_/g, " ")}
                </p>
              )}
            </div>
          </div>
          <div className="mt-4">
            <ButtonLink
              href="/dashboard/participant/profile"
              variant="secondary"
              size="sm"
            >
              Edit profile
            </ButtonLink>
          </div>
        </Card>
      </div>

      {/* 4) Safety panel */}
      <Card className="border-[3px] border-black bg-[#F97316]">
        <CardTitle className="flex items-center gap-2 text-black text-lg md:text-xl">
          <Shield className="h-5 w-5" />
          Safety
        </CardTitle>
        <CardDescription className="text-black/90 mt-1">
          Quick actions and recent alerts.
        </CardDescription>
        <div className="mt-4 flex flex-wrap gap-3">
          <ButtonLink
            href="/dashboard/participant/safety"
            variant="urgency"
            size="sm"
          >
            <AlertCircle className="mr-2 h-4 w-4" />
            Report issue
          </ButtonLink>
          <ButtonLink
            href="/dashboard/participant/bookings"
            variant="secondary"
            size="sm"
          >
            Share gig details
          </ButtonLink>
        </div>
        {data.reportOutcomes.length > 0 && (
          <div className="mt-4 rounded border-2 border-black bg-white p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-black/70">
              Recent alerts summary
            </p>
            <p className="mt-1 text-sm font-medium text-black">
              {data.reportOutcomes.length} report outcome
              {data.reportOutcomes.length !== 1 ? "s" : ""} (resolved/dismissed). View in Safety.
            </p>
          </div>
        )}
      </Card>

      {/* 5) Recent chats preview */}
      <Card className="border-[#6366F1] bg-[#6366F1]/10">
        <CardTitle className="flex items-center gap-2 text-lg text-black md:text-xl">
          <span className="flex h-9 w-9 items-center justify-center rounded border-2 border-[#6366F1] bg-[#6366F1]">
            <MessageCircle className="h-4 w-4 text-white" />
          </span>
          Recent chats
        </CardTitle>
        <CardDescription className="mt-1 text-black/80">
          Last 3 active chats.
        </CardDescription>
        {data.recentChats.length === 0 ? (
          <p className="mt-4 text-sm text-black/70">
            No chats yet. Start from a gig you applied to.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {data.recentChats.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/dashboard/participant/chats/${c.id}`}
                  className="block rounded border-2 border-[#6366F1]/50 bg-white p-3 font-bold text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-colors hover:bg-[#6366F1]/10"
                >
                  {c.gigTitle}
                  <span className="ml-2 text-xs font-medium text-black/70">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link
          href="/dashboard/participant/chats"
          className="mt-4 inline-flex items-center text-sm font-bold text-black underline underline-offset-2 hover:no-underline"
        >
          All chats
          <ChevronRight className="h-4 w-4" />
        </Link>
      </Card>
    </div>
  );
}
