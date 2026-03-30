"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PHOTO_VISIBILITY_VALUES, type PhotoVisibility } from "@/lib/photo-privacy";
import { updatePhotoVisibility } from "@/app/dashboard/participant/actions";
import { SettingsSectionCard } from "@/components/settings/SettingsSectionCard";
import { RadioSettingGroup } from "@/components/settings/RadioSettingGroup";
import { SaveBar } from "@/components/settings/SaveBar";

const OPTIONS: { value: PhotoVisibility; label: string; description: string }[] = [
  { value: "team_only", label: "Team only", description: "Other confirmed staff on the same gig can see your avatar." },
  { value: "merchants_after_booking", label: "After booking", description: "Merchants see your avatar only after you're confirmed." },
  { value: "merchants_on_application", label: "On application", description: "Merchants see your avatar while reviewing your application." },
  { value: "hidden", label: "Hidden", description: "Nobody except admins (for safety and disputes)." },
];

export function PrivacyParticipantForm({
  initialVisibility,
}: {
  initialVisibility: string | null | undefined;
}) {
  const router = useRouter();
  const [visibility, setVisibility] = useState<string>(
    initialVisibility && PHOTO_VISIBILITY_VALUES.includes(initialVisibility as PhotoVisibility)
      ? initialVisibility
      : "team_only"
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  async function handleSave() {
    setMessage(null);
    setSaving(true);
    try {
      const result = await updatePhotoVisibility(visibility);
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
    <SettingsSectionCard
      title="Photo privacy"
      description="Who can see your profile photo. Not enforced until feature flag is on."
    >
      <RadioSettingGroup
        name="photo_visibility"
        options={OPTIONS}
        value={visibility}
        onChange={(v) => setVisibility(v)}
        aria-label="Photo visibility"
      />
      <p className="mt-4 text-xs text-amber-700 dark:text-amber-300">
        Hiding your photo may reduce booking chances.
      </p>
      <SaveBar onSave={handleSave} saving={saving} message={message} />
    </SettingsSectionCard>
  );
}
