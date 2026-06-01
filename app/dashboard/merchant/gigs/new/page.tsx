import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { getCurrentUser } from "@/lib/auth";
import { getUsageSummary } from "@/lib/billing/gating";
import { PlanLimitBanner } from "@/components/billing/PlanLimitBanner";
import { PageHeader } from "@/components/ui/PageHeader";
import { CreateGigForm } from "./CreateGigForm";
import { PlusCircle } from "lucide-react";

export default async function NewGigPage() {
  await requireRole(ROLES.MERCHANT);
  const current = await getCurrentUser();
  const usageSummary = current?.user ? await getUsageSummary(current.user.id) : null;
  const atLimit = usageSummary?.atLimit ?? false;

  return (
    <div className="page-bg space-y-8">
      <PageHeader
        icon={PlusCircle}
        title="Post a gig"
        description="Fill in the details to find the right talent"
      />

      {atLimit && <PlanLimitBanner />}

      <CreateGigForm />
    </div>
  );
}
