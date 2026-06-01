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
    <Card>
      <CardTitle>Your team</CardTitle>
      <CardDescription>
        Other confirmed participants on this gig. For safety and privacy,
        contact details are not shared.
      </CardDescription>

      {members.length === 1 && members[0].user_id === currentUserId ? (
        <p className="mt-4 text-sm text-[var(--color-ink-muted)]">
          You&apos;re currently the only confirmed staff.
        </p>
      ) : (
        <>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4 md:grid md:grid-cols-2 md:gap-4 lg:grid-cols-3">
            {visible.map((m) => (
              <div
                key={m.user_id}
                className="flex min-h-[52px] items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-3"
              >
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-[var(--color-gold-light)]">
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
                    <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-[var(--color-gold)]">
                      {(m.first_name ?? "?").charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-[var(--color-ink)]">
                    {m.first_name || "Staff"}
                  </p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                    {m.verified && <span className="pill-green">Verified</span>}
                    {m.role_in_gig === "team_lead" && (
                      <span className="pill-gold">Team lead</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {overflow > 0 && (
              <div className="flex min-h-[52px] items-center rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-page)] px-4 py-3 text-sm font-medium text-[var(--color-ink-muted)]">
                +{overflow} more
              </div>
            )}
          </div>
          <p className="mt-4 text-xs text-[var(--color-ink-muted)]">
            For safety and privacy, contact details are not shared.
          </p>
        </>
      )}
    </Card>
  );
}
