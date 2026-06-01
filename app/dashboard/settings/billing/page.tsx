import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ROLES } from "@/lib/roles";
import { getMerchantSubscription } from "@/lib/billing/service";
import { listMyGigs } from "@/app/dashboard/merchant/gigs/actions";
import { SettingsPageShell } from "@/components/settings/SettingsPageShell";
import { BillingSettingsClient } from "./BillingSettingsClient";

export default async function SettingsBillingPage() {
  const current = await getCurrentUser();
  if (!current?.user || !current.profile) return null;

  const role = current.profile.role as string;
  if (role !== ROLES.MERCHANT) {
    redirect("/dashboard/settings/account");
  }

  let subscription = null;
  let activeGigsCount = 0;
  let billingError: string | null = null;

  try {
    const [sub, gigs] = await Promise.all([
      getMerchantSubscription(current.user.id),
      listMyGigs(),
    ]);
    subscription = sub;
    activeGigsCount = gigs.filter((g) => g.status === "open" || g.status === "filled").length;
  } catch (e) {
    billingError =
      e instanceof Error ? e.message : "Billing could not be loaded. Ensure the database migration for merchant_subscriptions has been run.";
  }

  if (billingError) {
    return (
      <SettingsPageShell
        title="Billing"
        subtitle="Manage your subscription and plan limits."
      >
        <div className="rounded-xl border border-[rgba(217,119,6,0.3)] bg-[var(--color-warning-light)] p-6">
          <p className="font-medium text-[var(--color-warning)]">Billing is not available yet.</p>
          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{billingError}</p>
          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
            Run the Supabase migration that creates the{" "}
            <code className="rounded bg-[var(--color-page)] px-1">merchant_subscriptions</code> table, then refresh.
          </p>
          <Link
            href="/dashboard/merchant"
            className="mt-4 inline-block text-sm font-medium text-[var(--color-gold)] underline hover:no-underline"
          >
            ← Back to dashboard
          </Link>
        </div>
      </SettingsPageShell>
    );
  }

  return (
    <SettingsPageShell
      title="Billing"
      subtitle="Manage your subscription and plan limits."
    >
      <BillingSettingsClient
        subscription={subscription}
        activeGigsCount={activeGigsCount}
      />
    </SettingsPageShell>
  );
}
