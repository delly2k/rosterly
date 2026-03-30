"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { upsertParticipantProfile } from "@/app/dashboard/participant/actions";

function getSchema(nameEditable: boolean) {
  return z
    .object({
      full_name: z.string().nullable(),
      bio: z.string().nullable(),
      location_general: z.string().nullable(),
      rate: z.coerce.number().min(0).nullable().optional(),
      emergency_contact: z.string().nullable(),
      accept_disclaimer: z
        .boolean()
        .refine((v) => v === true, {
          message: "You must accept the participant disclaimer.",
        }),
    })
    .refine(
      (data) =>
        !nameEditable || (data.full_name != null && data.full_name.trim().length > 0),
      { message: "Full name is required", path: ["full_name"] }
    );
}

type FormData = z.infer<ReturnType<typeof getSchema>>;

const PARTICIPANT_DISCLAIMER =
  "I understand that my profile may be shared with merchants when I apply to gigs. I will provide accurate information and keep my emergency contact up to date. I have read the Safety and Report guidelines.";

type ProfileFormProps = {
  initial: {
    full_name: string | null;
    photo_url: string | null;
    verified?: boolean;
    bio: string | null;
    skills: unknown;
    location_general: string | null;
    availability: unknown;
    rate: number | null;
    emergency_contact: string | null;
    disclaimer_accepted_at: string | null;
  } | null;
  identityLocked: boolean;
  nameEditable: boolean;
};

export function ProfileForm({ initial, identityLocked, nameEditable }: ProfileFormProps) {
  const router = useRouter();
  const photoUrl = initial?.photo_url ?? null;
  const verified = initial?.verified ?? false;
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(getSchema(nameEditable)),
    defaultValues: {
      full_name: initial?.full_name ?? "",
      bio: initial?.bio ?? "",
      location_general: initial?.location_general ?? "",
      rate: initial?.rate ?? undefined,
      emergency_contact: initial?.emergency_contact ?? "",
      accept_disclaimer: Boolean(initial?.disclaimer_accepted_at),
    },
  });

  const acceptDisclaimer = watch("accept_disclaimer");

  async function onSubmit(data: FormData) {
    setSubmitError(null);
    setSaveSuccess(false);
    try {
      await upsertParticipantProfile(
        {
          full_name: data.full_name || null,
          bio: data.bio || null,
          skills: initial?.skills ?? [],
          location_general: data.location_general || null,
          availability: initial?.availability ?? {},
          rate: data.rate ?? null,
          emergency_contact: data.emergency_contact || null,
          photo_url: photoUrl,
          disclaimer_accepted_at: data.accept_disclaimer ? new Date().toISOString() : null,
        },
        identityLocked
      );
      setSaveSuccess(true);
      // Refresh after a delay so the success message stays visible; then form remounts with updated disclaimer state
      setTimeout(() => {
        router.refresh();
        setSaveSuccess(false);
      }, 5000);
    } catch {
      setSubmitError("Could not save profile. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {saveSuccess && (
        <div
          className="rounded-[4px] border-[3px] border-black bg-[#84CC16] px-4 py-3 text-sm font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
          role="status"
        >
          Profile saved.
        </div>
      )}
      {submitError && (
        <div
          className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/50 dark:text-red-200"
          role="alert"
        >
          {submitError}
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Profile photo
        </label>
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 overflow-hidden rounded-full border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-zinc-400">
                No photo
              </div>
            )}
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {verified
              ? "Set from your verification."
              : "Profile photo will be set after verification is approved."}
          </p>
        </div>
      </div>

      <div>
        <label
          htmlFor="full_name"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Full name
        </label>
        <input
          id="full_name"
          type="text"
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 disabled:bg-zinc-100 disabled:text-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500"
          {...register("full_name")}
          disabled={!nameEditable}
        />
        {identityLocked && nameEditable && (
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Your name was not set before verification. Enter it once; it will then be locked.
          </p>
        )}
        {identityLocked && !nameEditable && (
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Locked after verification submission.
          </p>
        )}
        {errors.full_name && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.full_name.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="bio"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Bio
        </label>
        <textarea
          id="bio"
          rows={3}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          {...register("bio")}
        />
      </div>

      <div>
        <label
          htmlFor="location_general"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          General location (e.g. city or region)
        </label>
        <input
          id="location_general"
          type="text"
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          {...register("location_general")}
        />
      </div>

      <div>
        <label
          htmlFor="rate"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Hourly rate (optional)
        </label>
        <input
          id="rate"
          type="number"
          step="0.01"
          min="0"
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          {...register("rate")}
        />
      </div>

      <div>
        <label
          htmlFor="emergency_contact"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Emergency contact
        </label>
        <input
          id="emergency_contact"
          type="text"
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          {...register("emergency_contact")}
        />
      </div>

      <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          {PARTICIPANT_DISCLAIMER}
        </p>
        <label className="mt-3 flex items-center gap-2">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800"
            {...register("accept_disclaimer")}
          />
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            I accept the participant disclaimer
          </span>
        </label>
        {errors.accept_disclaimer && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.accept_disclaimer.message}
          </p>
        )}
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting || !acceptDisclaimer}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isSubmitting ? "Saving…" : "Save profile"}
        </button>
        <a
          href="/dashboard/participant/safety"
          className="inline-flex items-center text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          Report / Safety
        </a>
      </div>
    </form>
  );
}
