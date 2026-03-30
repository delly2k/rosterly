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
    <Card className="border-[3px] border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:p-6 md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      <CardTitle className="text-black">Photo privacy</CardTitle>
      <CardDescription className="text-black/80">
        Control when and where your profile photo is visible. Admins can always see it for safety and disputes.
      </CardDescription>

      <div className="mt-4 space-y-3">
        {OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className="flex cursor-pointer gap-3 rounded-lg border border-zinc-200 p-3 has-[:checked]:border-black has-[:checked]:ring-2 has-[:checked]:ring-black/20 dark:border-zinc-700 dark:has-[:checked]:border-zinc-300"
          >
            <input
              type="radio"
              name="photo_visibility"
              value={opt.value}
              checked={visibility === opt.value}
              onChange={() => setVisibility(opt.value)}
              className="mt-0.5 h-4 w-4 border-zinc-300 text-zinc-900 focus:ring-zinc-500"
            />
            <div>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">{opt.label}</span>
              <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">{opt.description}</p>
            </div>
          </label>
        ))}
      </div>

      <p className="mt-4 text-xs text-amber-700 dark:text-amber-300">
        Hiding your photo may reduce booking chances.
      </p>

      {message && (
        <p
          className={`mt-3 text-sm ${message.type === "ok" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
          role="status"
        >
          {message.text}
        </p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="mt-4 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {saving ? "Saving…" : "Save photo privacy"}
      </button>
    </Card>
  );
}
