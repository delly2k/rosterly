"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  upsertMerchantProfile,
} from "@/app/dashboard/merchant/actions";

const PAYMENT_OPTIONS = [
  { value: "", label: "Select payment method" },
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "card", label: "Card" },
] as const;

const profileSchema = z.object({
  business_name: z.string().min(1, "Business name is required"),
  business_type: z.string().min(1, "Business type is required"),
  address: z.string(),
  trn: z.string(),
  payment_method: z.string(),
  accept_disclaimer: z
    .boolean()
    .refine((v) => v === true, {
      message: "You must accept the merchant disclaimer.",
    }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const MERCHANT_DISCLAIMER =
  "I confirm that the business and officer details I provide are accurate. I am authorised to represent this business. I understand that false information may result in account suspension.";

type MerchantProfileFormProps = {
  initial: {
    business_name: string | null;
    business_type: string | null;
    address: string | null;
    trn: string | null;
    payment_method: string | null;
    disclaimer_accepted_at: string | null;
  } | null;
};

export function MerchantProfileForm({ initial }: MerchantProfileFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      business_name: initial?.business_name ?? "",
      business_type: initial?.business_type ?? "",
      address: initial?.address ?? "",
      trn: initial?.trn ?? "",
      payment_method: initial?.payment_method ?? "",
      accept_disclaimer: !!initial?.disclaimer_accepted_at,
    },
  });

  // Sync form with server data when it changes (e.g. after save + refresh)
  useEffect(() => {
    profileForm.reset({
      business_name: initial?.business_name ?? "",
      business_type: initial?.business_type ?? "",
      address: initial?.address ?? "",
      trn: initial?.trn ?? "",
      payment_method: initial?.payment_method ?? "",
      accept_disclaimer: !!initial?.disclaimer_accepted_at,
    });
  }, [initial?.business_name, initial?.business_type, initial?.address, initial?.trn, initial?.payment_method, initial?.disclaimer_accepted_at, profileForm.reset]);

  async function onProfileSubmit(data: ProfileFormData) {
    setSubmitError(null);
    setSaveSuccess(false);
    try {
      await upsertMerchantProfile({
        business_name: data.business_name,
        business_type: data.business_type,
        address: data.address || null,
        trn: data.trn || null,
        payment_method: data.payment_method || null,
        accept_disclaimer: data.accept_disclaimer,
      });
      setSaveSuccess(true);
      router.refresh();
      setTimeout(() => setSaveSuccess(false), 5000);
    } catch {
      setSubmitError("Could not save profile. Please try again.");
    }
  }

  const inputClass =
    "w-full rounded-[4px] border-[3px] border-black bg-white px-3 py-2 text-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:bg-zinc-800 dark:text-zinc-100";

  return (
    <div className="space-y-10">
      <section>
        <form
          onSubmit={profileForm.handleSubmit(onProfileSubmit)}
          className="space-y-6"
        >
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
            <label
              htmlFor="business_name"
              className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Business name
            </label>
            <input
              id="business_name"
              type="text"
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              {...profileForm.register("business_name")}
            />
            {profileForm.formState.errors.business_name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {profileForm.formState.errors.business_name.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="business_type"
              className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Business type
            </label>
            <input
              id="business_type"
              type="text"
              placeholder="e.g. Sole trader, Limited company"
              className={inputClass}
              {...profileForm.register("business_type")}
            />
            {profileForm.formState.errors.business_type && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {profileForm.formState.errors.business_type.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="address"
              className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Address
            </label>
            <textarea
              id="address"
              rows={2}
              className={inputClass}
              {...profileForm.register("address")}
            />
          </div>

          <div>
            <label
              htmlFor="trn"
              className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              TRn (Tax reference number)
            </label>
            <input
              id="trn"
              type="text"
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              {...profileForm.register("trn")}
            />
          </div>

          <div>
            <label
              htmlFor="payment_method"
              className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Payment method
            </label>
            <select
              id="payment_method"
              className={inputClass}
              {...profileForm.register("payment_method")}
            >
              {PAYMENT_OPTIONS.map((opt) => (
                <option key={opt.value || "empty"} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              {MERCHANT_DISCLAIMER}
            </p>
            <label className="mt-3 flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800"
                {...profileForm.register("accept_disclaimer")}
              />
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                I accept the merchant disclaimer
              </span>
            </label>
            {profileForm.formState.errors.accept_disclaimer && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {profileForm.formState.errors.accept_disclaimer.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={profileForm.formState.isSubmitting}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {profileForm.formState.isSubmitting ? "Saving…" : "Save profile"}
          </button>
        </form>
      </section>
    </div>
  );
}
