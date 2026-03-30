import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { listOpenGigs } from "@/app/dashboard/participant/gigs/actions";
import { EmptyState } from "@/components/ui/EmptyState";
import { Briefcase } from "lucide-react";

export default async function ParticipantGigsPage() {
  await requireRole(ROLES.PARTICIPANT);
  const gigs = await listOpenGigs();

  return (
    <div className="space-y-8">
      <h1 className="page-title tracking-tight">
        Browse gigs
      </h1>

      {gigs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No open gigs"
          description="No open gigs at the moment. Check back later."
        />
      ) : (
        <ul className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 md:flex-col md:overflow-visible md:snap-none md:space-y-4 md:pb-0">
          {gigs.map((gig) => (
            <li key={gig.id} className="min-w-[min(280px,85vw)] flex-shrink-0 snap-center md:min-w-0">
              <Link
                href={`/dashboard/participant/gigs/${gig.id}`}
                className="block min-h-[48px] rounded-[4px] border-[3px] border-black bg-[#06B6D4] p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-75 ease-out brutal-press will-change-transform md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
              >
                <h2 className="font-bold text-black">{gig.title}</h2>
                <p className="mt-2 text-sm text-black/90">
                  {gig.location_general || "No location"}
                  {gig.pay_rate != null && ` · $${gig.pay_rate}/hr`}
                </p>
                <p className="mt-1 text-xs font-medium text-black/80">
                  {"spots_filled" in gig ? gig.spots_filled : 0} of {gig.spots ?? 1} spots filled
                </p>
                {gig.start_time && (
                  <p className="mt-1 text-xs font-medium text-black/80">
                    {new Date(gig.start_time).toLocaleString()}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
