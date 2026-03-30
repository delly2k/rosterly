import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getParticipantProfile } from "@/app/dashboard/participant/actions";
import { ROLES } from "@/lib/roles";
import { SettingsSectionCard } from "@/components/settings/SettingsSectionCard";
import { SettingsPageShell } from "@/components/settings/SettingsPageShell";

export default async function SettingsSafetyPage() {
  const current = await getCurrentUser();
  if (!current?.user || !current.profile) return null;

  const role = current.profile.role as string;

  if (role === ROLES.PARTICIPANT) {
    const profile = await getParticipantProfile();
    return (
      <SettingsPageShell
        title="Safety & Support"
        subtitle="Report issues, blocked users, and safety resources."
      >
        <SettingsSectionCard
          title="Report a problem"
          description="Submit a report or safety concern."
        >
          <Link
            href="/dashboard/participant/report"
            className="inline-flex min-h-[44px] items-center text-sm font-medium text-[#1D4ED8] underline underline-offset-2 hover:no-underline"
          >
            Report a problem →
          </Link>
        </SettingsSectionCard>

        <SettingsSectionCard
          title="Blocked users"
          description="People you have blocked. (List placeholder — not yet implemented.)"
        >
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No blocked users. Blocking will be available in chats.
          </p>
        </SettingsSectionCard>

        <SettingsSectionCard
          title="Safety guidelines"
          description="How we keep the platform safe."
        >
          <Link
            href="/dashboard/participant/safety"
            className="inline-flex min-h-[44px] items-center text-sm font-medium text-[#1D4ED8] underline underline-offset-2 hover:no-underline"
          >
            View safety guidelines →
          </Link>
        </SettingsSectionCard>

        <SettingsSectionCard
          title="Emergency contact"
          description="Used in case of emergency. Update in Profile."
        >
          <p className="text-sm text-zinc-900 dark:text-zinc-100">
            {(profile as { emergency_contact?: string | null } | null)?.emergency_contact ?? "Not set"}
          </p>
          <Link
            href="/dashboard/participant/profile"
            className="mt-2 inline-block text-sm font-medium text-[#1D4ED8] underline underline-offset-2 hover:no-underline"
          >
            Edit in Profile →
          </Link>
        </SettingsSectionCard>

        <SettingsSectionCard title="Contact support" description="Get help from the team.">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Contact support (placeholder). Email or in-app support will be added here.
          </p>
          <button
            type="button"
            disabled
            className="mt-3 rounded-md border border-zinc-300 bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          >
            Contact support
          </button>
        </SettingsSectionCard>
      </SettingsPageShell>
    );
  }

  if (role === ROLES.MERCHANT) {
    return (
      <SettingsPageShell
        title="Safety & Compliance"
        subtitle="Code of conduct, incident reporting, and obligations."
      >
        <SettingsSectionCard
          title="Code of conduct"
          description="Expected behaviour when using the platform."
        >
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            Treat all participants with respect. Provide a safe working environment. Do not discriminate. Follow local employment and safety laws.
          </p>
        </SettingsSectionCard>

        <SettingsSectionCard
          title="Incident reporting"
          description="Report safety incidents or concerns."
        >
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Incident reporting (placeholder). Link to report form or support will be added here.
          </p>
          <button
            type="button"
            disabled
            className="mt-3 rounded-md border border-zinc-300 bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          >
            Report incident
          </button>
        </SettingsSectionCard>

        <SettingsSectionCard
          title="Safety obligations"
          description="Your responsibilities as a merchant."
        >
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            You are responsible for providing a safe workplace, accurate gig details, and timely payment. Ensure participants are informed of risks and have a clear point of contact.
          </p>
        </SettingsSectionCard>

        <SettingsSectionCard title="Contact support" description="Get help from the team.">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Contact support (placeholder). Email or in-app support will be added here.
          </p>
          <button
            type="button"
            disabled
            className="mt-3 rounded-md border border-zinc-300 bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          >
            Contact support
          </button>
        </SettingsSectionCard>
      </SettingsPageShell>
    );
  }

  return null;
}
