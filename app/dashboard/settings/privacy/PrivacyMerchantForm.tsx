"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SettingsSectionCard } from "@/components/settings/SettingsSectionCard";
import { RadioSettingGroup } from "@/components/settings/RadioSettingGroup";
import { ToggleSettingRow } from "@/components/settings/ToggleSettingRow";
import { SaveBar } from "@/components/settings/SaveBar";
import { updateMerchantVisibilitySettings } from "../actions";

const COMPANY_VISIBILITY_OPTIONS = [
  { value: "visible_to_confirmed", label: "Visible to confirmed participants", description: "Participants with a confirmed booking can see your company contact details." },
  { value: "visible_after_booking", label: "Visible only after booking", description: "Show contact only after the participant is confirmed for the gig." },
];

export function PrivacyMerchantForm({
  initialSettings,
}: {
  initialSettings: Record<string, unknown>;
}) {
  const router = useRouter();
  const companyVisibility = (initialSettings.company_contact_visibility as string) ?? "visible_to_confirmed";
  const teamListVisible = (initialSettings.team_list_visibility as boolean) ?? true;

  const [visibility, setVisibility] = useState(companyVisibility);
  const [teamList, setTeamList] = useState(teamListVisible);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const hasChanges =
    visibility !== companyVisibility || teamList !== teamListVisible;

  async function handleSave() {
    setMessage(null);
    setSaving(true);
    try {
      const result = await updateMerchantVisibilitySettings({
        company_contact_visibility: visibility,
        team_list_visibility: teamList,
      });
      if (result.ok) {
        setMessage({ type: "ok", text: "Privacy settings saved." });
        router.refresh();
      } else {
        setMessage({ type: "error", text: result.error ?? "Could not save." });
      }
    } catch {
      setMessage({ type: "error", text: "Something went wrong." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <SettingsSectionCard
        title="Company contact visibility"
        description="When participants can see your company contact details."
      >
        <RadioSettingGroup
          name="company_contact_visibility"
          options={COMPANY_VISIBILITY_OPTIONS}
          value={visibility}
          onChange={setVisibility}
          aria-label="Company contact visibility"
        />
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Team list"
        description="Future: control visibility of team list to participants."
      >
        <ToggleSettingRow
          label="Show team list to confirmed participants"
          description="When enabled, participants can see who else is on the gig. (Not enforced yet.)"
          checked={teamList}
          onChange={setTeamList}
        />
      </SettingsSectionCard>

      <div className="rounded-[4px] border-[3px] border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:p-6">
        <SaveBar
          onSave={handleSave}
          saving={saving}
          message={message}
          disabled={!hasChanges}
        />
      </div>
    </>
  );
}
