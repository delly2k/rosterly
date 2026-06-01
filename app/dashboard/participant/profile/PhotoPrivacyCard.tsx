"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { PHOTO_VISIBILITY_VALUES, type PhotoVisibility } from "@/lib/photo-privacy";
import { updatePhotoVisibility } from "@/app/dashboard/participant/actions";

const OPTIONS: { value: PhotoVisibility; label: string; description: string }[] = [
  {
    value: "team_only",
    label: "Team only",
    description: "Other confirmed staff on the same gig can see your avatar.",
  },
  {
    value: "merchants_after_booking",
    label: "After booking",
    description: "Merchants see your avatar only after you're confirmed.",
  },
  {
    value: "merchants_on_application",
    label: "On application",
    description: "Merchants see your avatar while reviewing your application.",
  },
  {
    value: "hidden",
    label: "Hidden",
    description: "Nobody except admins (for safety and disputes).",
  },
];

type PhotoPrivacyCardProps = {
  initialVisibility: string | null | undefined;
};

export function PhotoPrivacyCard({ initialVisibility }: PhotoPrivacyCardProps) {
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
        setMessage({ type: "ok", text: "Photo privacy saved." });
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
    <Card className="bg-white p-4 sm:p-6 md:">
      <CardTitle className="text-[var(--color-ink)]">Photo privacy</CardTitle>
      <CardDescription className="text-[var(--color-ink-muted)]">
        Control when and where your profile photo is visible. Admins can always see it for safety and disputes.
      </CardDescription>

      <div className="mt-4 space-y-3">
        {OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className="flex cursor-pointer gap-3 rounded-lg border border-[var(--color-border)] p-3 has-[:checked]:border-[var(--color-gold)] has-[:checked]:bg-[var(--color-gold-light)]"
          >
            <input
              type="radio"
              name="photo_visibility"
              value={opt.value}
              checked={visibility === opt.value}
              onChange={() => setVisibility(opt.value)}
              className="mt-0.5 h-4 w-4 border-[#E5E3DC] text-[var(--color-ink)] focus:ring-zinc-500"
            />
            <div>
              <span className="font-medium text-[var(--color-ink)]">{opt.label}</span>
              <p className="mt-0.5 text-sm text-[var(--color-ink-muted)]">{opt.description}</p>
            </div>
          </label>
        ))}
      </div>

      <p className="mt-4 text-xs text-amber-700">
        Hiding your photo may reduce booking chances.
      </p>

      {message && (
        <p
          className={`mt-3 text-sm ${message.type === "ok" ? "text-green-600" : "text-red-600"}`}
          role="status"
        >
          {message.text}
        </p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="mt-4 btn-portal-primary"
      >
        {saving ? "Saving…" : "Save photo privacy"}
      </button>
    </Card>
  );
}
