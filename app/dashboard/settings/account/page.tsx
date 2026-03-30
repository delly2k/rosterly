import { getCurrentUser } from "@/lib/auth";
import { getVerificationStatus } from "@/app/dashboard/participant/actions";
import { getMerchantVerificationStatus } from "@/app/dashboard/merchant/actions";
import { ROLES } from "@/lib/roles";
import { SettingsSectionCard } from "@/components/settings/SettingsSectionCard";
import { SettingsPageShell } from "@/components/settings/SettingsPageShell";
import { AccountActions } from "./AccountActions";

export default async function SettingsAccountPage() {
  const current = await getCurrentUser();
  if (!current?.user || !current.profile) return null;

  const role = current.profile.role as string;
  let verified = false;
  if (role === ROLES.PARTICIPANT) {
    const s = await getVerificationStatus();
    verified = s.status === "verified";
  } else if (role === ROLES.MERCHANT) {
    const s = await getMerchantVerificationStatus();
    verified = s.verified;
  }

  return (
    <SettingsPageShell
      title="Account"
      subtitle="Email, password, and account actions."
    >
      <SettingsSectionCard
        title="Account details"
        description="Your sign-in and role information."
      >
        <dl className="space-y-3">
          <div>
            <dt className="text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
              Email
            </dt>
            <dd className="mt-0.5 text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {current.user.email ?? "—"}
            </dd>
            <dd className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              Read-only. Contact support to change.
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
              Role
            </dt>
            <dd className="mt-0.5">
              <span className="inline-block rounded-full bg-zinc-200 px-2.5 py-0.5 text-xs font-medium capitalize text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200">
                {role}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
              Verification
            </dt>
            <dd className="mt-0.5">
              {verified ? (
                <span className="inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/50 dark:text-green-200">
                  Verified
                </span>
              ) : (
                <span className="inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                  Not verified
                </span>
              )}
            </dd>
          </div>
        </dl>
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Password"
        description="Change your password. (Not yet implemented — contact support.)"
      >
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Password change will be available here. For now, use the reset link from sign-in or contact support.
        </p>
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Actions"
        description="Sign out or manage your account."
      >
        <AccountActions />
      </SettingsSectionCard>
    </SettingsPageShell>
  );
}
