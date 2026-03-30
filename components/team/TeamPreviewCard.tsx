import Image from "next/image";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import type { TeamPreviewMember } from "@/app/dashboard/participant/bookings/actions";

const MAX_VISIBLE = 5;

export function TeamPreviewCard({
  members,
  currentUserId,
}: {
  members: TeamPreviewMember[];
  currentUserId: string;
}) {
  if (members.length === 0) return null;

  const visible = members.slice(0, MAX_VISIBLE);
  const overflow = members.length - MAX_VISIBLE;

  return (
    <Card className="border-[3px] border-black bg-sky-50 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:bg-sky-950/30 sm:p-6 md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      <CardTitle className="text-black">Your team</CardTitle>
      <CardDescription className="text-black/80">
        Other confirmed participants on this gig. For safety and privacy,
        contact details are not shared.
      </CardDescription>

      {members.length === 1 && members[0].user_id === currentUserId ? (
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          You&apos;re currently the only confirmed staff.
        </p>
      ) : (
        <>
          {/* Mobile: single-column list with touch-friendly rows; desktop: grid */}
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4 md:grid md:grid-cols-2 md:gap-4 lg:grid-cols-3">
            {visible.map((m) => (
              <div
                key={m.user_id}
                className="flex min-h-[52px] items-center gap-3 rounded-lg border border-sky-200 bg-white/80 p-3 dark:border-sky-800 dark:bg-white/10"
              >
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-black bg-zinc-200 dark:bg-zinc-700">
                  {m.photo_url ? (
                    <Image
                      src={m.photo_url}
                      alt=""
                      width={44}
                      height={44}
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                      {(m.first_name ?? "?").charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-black dark:text-zinc-100">
                    {m.first_name || "Staff"}
                  </p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                    {m.verified && (
                      <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/50 dark:text-green-200">
                        Verified
                      </span>
                    )}
                    {m.role_in_gig === "team_lead" && (
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                        Team lead
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {overflow > 0 && (
              <div className="flex min-h-[52px] items-center rounded-lg border border-dashed border-sky-300 bg-white/60 px-4 py-3 text-sm font-medium text-zinc-600 dark:border-sky-700 dark:bg-white/5 dark:text-zinc-400">
                +{overflow} more
              </div>
            )}
          </div>
          <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-500">
            For safety and privacy, contact details are not shared.
          </p>
        </>
      )}
    </Card>
  );
}
