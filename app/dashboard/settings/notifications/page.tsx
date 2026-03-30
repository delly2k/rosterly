import { getCurrentUser } from "@/lib/auth";
import { getNotificationSettings } from "../actions";
import { ROLES } from "@/lib/roles";
import { SettingsPageShell } from "@/components/settings/SettingsPageShell";
import { NotificationsParticipantForm } from "./NotificationsParticipantForm";
import { NotificationsMerchantForm } from "./NotificationsMerchantForm";

const notificationsBadge = (
  <span className="inline-flex shrink-0 items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
    App notifications only
  </span>
);

export default async function SettingsNotificationsPage() {
  const current = await getCurrentUser();
  if (!current?.user || !current.profile) return null;

  const role = current.profile.role as string;
  const settings = await getNotificationSettings();

  if (role === ROLES.PARTICIPANT) {
    return (
      <SettingsPageShell
        title="Notifications"
        subtitle="Choose what you want to hear about."
        badge={notificationsBadge}
      >
        <NotificationsParticipantForm initialSettings={settings} />
      </SettingsPageShell>
    );
  }

  if (role === ROLES.MERCHANT) {
    return (
      <SettingsPageShell
        title="Notifications"
        subtitle="Choose what you want to hear about."
        badge={notificationsBadge}
      >
        <NotificationsMerchantForm initialSettings={settings} />
      </SettingsPageShell>
    );
  }

  return null;
}
