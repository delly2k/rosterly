import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { getCurrentUser } from "@/lib/auth";
import { getUsageSummary } from "@/lib/billing/gating";
import { PlanLimitBanner } from "@/components/billing/PlanLimitBanner";
import { CreateGigForm } from "./CreateGigForm";

export default async function NewGigPage() {
  await requireRole(ROLES.MERCHANT);
  const current = await getCurrentUser();
  const usageSummary = current?.user ? await getUsageSummary(current.user.id) : null;
  const atLimit = usageSummary?.atLimit ?? false;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="page-title tracking-tight">Create gig</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Exact location is stored but hidden from participants until they are
          booked.
        </p>
      </div>

      {atLimit && <PlanLimitBanner />}

      <CreateGigForm />
    </div>
  );
}
