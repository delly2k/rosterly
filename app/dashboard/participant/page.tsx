import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import {
  getParticipantDashboardData,
  logSosEvent,
} from "@/app/dashboard/participant/actions";
import { SosButton } from "./SosButton";
import { ParticipantDashboardClient } from "./ParticipantDashboardClient";

export default async function ParticipantDashboardPage() {
  await requireRole(ROLES.PARTICIPANT);
  const data = await getParticipantDashboardData();
  if (!data) return null;

  return (
    <div className="space-y-6 sm:space-y-8">
      {data.verificationStatus !== "verified" && (
        <Link
          href="/dashboard/participant/verification"
          className="block rounded-[4px] border-[3px] border-black bg-[#84CC16] p-3 text-center text-sm font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
        >
          {data.verificationStatus === "pending"
            ? "View verification status"
            : "Complete verification"}
        </Link>
      )}

      {data.verificationStatus === "verified" && !data.profileComplete && (
        <div className="rounded-[4px] border-[3px] border-black bg-[#84CC16] p-3 text-center text-sm font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          Complete your profile (name) in Profile for a full account.{" "}
          <Link
            href="/dashboard/participant/profile"
            className="underline hover:no-underline"
          >
            Go to Profile
          </Link>
        </div>
      )}

      <ParticipantDashboardClient
        data={data}
        sosButton={<SosButton logSos={logSosEvent} />}
      />
    </div>
  );
}
