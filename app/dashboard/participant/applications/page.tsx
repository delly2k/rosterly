import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { listMyApplications } from "@/app/dashboard/participant/gigs/actions";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ButtonLink } from "@/components/ui/Button";
import { FileCheck } from "lucide-react";

export default async function ParticipantApplicationsPage() {
  await requireRole(ROLES.PARTICIPANT);
  const applications = await listMyApplications();

  return (
    <div className="space-y-6 sm:space-y-8">
      <h1 className="page-title tracking-tight">
        My applications
      </h1>

      {applications.length === 0 ? (
        <EmptyState
          icon={FileCheck}
          title="No applications yet"
          description="You haven't applied to any gigs yet. Browse gigs to apply."
          action={
            <ButtonLink href="/dashboard/participant/gigs" variant="primary" size="md">
              Browse gigs
            </ButtonLink>
          }
        />
      ) : (
        <ul className="space-y-4">
          {applications.map((app) => {
            const raw = (app as { gigs?: unknown }).gigs;
            const gig = Array.isArray(raw)
              ? (raw[0] as { id: string; title: string; pay_rate: number | null; location_general: string | null; start_time: string | null; status: string } | undefined)
              : (raw as { id: string; title: string; pay_rate: number | null; location_general: string | null; start_time: string | null; status: string } | null);
            const statusVariant =
              app.status === "pending" ? "pending" : app.status === "accepted" ? "success" : "inactive";
            return (
              <li key={app.id}>
                <Link
                  href={`/dashboard/participant/gigs/${app.gig_id}`}
                  className="block min-h-[48px] rounded-[4px] border-[3px] border-black bg-[#FDE047] p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-75 ease-out brutal-press will-change-transform sm:p-6 md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="font-bold text-black">{gig?.title ?? "Gig"}</h2>
                    <Badge variant={statusVariant}>{app.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-black/90">
                    {gig?.location_general}
                    {gig?.pay_rate != null && ` · $${gig.pay_rate}/hr`}
                  </p>
                  <p className="mt-1 text-xs font-medium text-black/80">
                    Applied {new Date(app.created_at).toLocaleDateString()}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
