import { getCurrentUser } from "@/lib/auth";
import { getParticipantProfile } from "@/app/dashboard/participant/actions";
import { getMerchantVisibilitySettings } from "../actions";
import { ROLES } from "@/lib/roles";
import { SettingsPageShell } from "@/components/settings/SettingsPageShell";
import { PrivacyParticipantForm } from "./PrivacyParticipantForm";
import { PrivacyMerchantForm } from "./PrivacyMerchantForm";

export default async function SettingsPrivacyPage() {
  const current = await getCurrentUser();
  if (!current?.user || !current.profile) return null;

  const role = current.profile.role as string;

  if (role === ROLES.PARTICIPANT) {
    const profile = await getParticipantProfile();
    return (
      <SettingsPageShell
        title="Privacy & Visibility"
        subtitle="Control when and where your profile photo is visible."
      >
        <PrivacyParticipantForm initialVisibility={profile?.photo_visibility} />
      </SettingsPageShell>
    );
  }

  if (role === ROLES.MERCHANT) {
    const visibilitySettings = await getMerchantVisibilitySettings();
    return (
      <SettingsPageShell
        title="Privacy & Visibility"
        subtitle="Company contact and team list visibility."
      >
        <PrivacyMerchantForm initialSettings={visibilitySettings} />
      </SettingsPageShell>
    );
  }

  return null;
}
