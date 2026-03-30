"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabaseClient";
import {
  merchantOfficerDocPath,
  VERIFICATION_DOCS_BUCKET,
} from "@/lib/storage";
import { submitMerchantVerification } from "@/app/dashboard/merchant/actions";

const schema = z.object({
  accept_disclaimer: z
    .boolean()
    .refine((v) => v === true, {
      message: "You must accept the verification disclaimer.",
    }),
});

type FormData = z.infer<typeof schema>;

const VERIFICATION_DISCLAIMER =
  "I confirm that the officer ID I am uploading is accurate and belongs to the authorised representative named in my business profile. I understand that false information may result in account suspension.";

type MerchantVerificationFormProps = { latestStatus?: string };

export function MerchantVerificationForm({
  latestStatus,
}: MerchantVerificationFormProps) {
  const router = useRouter();
  const [officerDocPath, setOfficerDocPath] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { accept_disclaimer: false },
  });

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setSubmitError(null);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const ext = file.name.split(".").pop() || "jpg";
      const filename = `${Date.now()}.${ext}`;
      const path = merchantOfficerDocPath(user.id, filename);

      const { error } = await supabase.storage
        .from(VERIFICATION_DOCS_BUCKET)
        .upload(path, file, { upsert: true });

      if (error) {
        setSubmitError("Could not upload document. Try again.");
        setUploading(false);
        return;
      }
      setOfficerDocPath(path);
    } catch {
      setSubmitError("Could not upload document.");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit() {
    setSubmitError(null);
    if (!officerDocPath) {
      setSubmitError("Please upload the officer ID document.");
      return;
    }
    try {
      await submitMerchantVerification(officerDocPath);
      router.refresh();
    } catch {
      setSubmitError("Could not submit verification. Please try again.");
    }
  }

  const rejected = latestStatus === "rejected";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {rejected && (
        <div className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
          Your previous verification was rejected. You may submit again with a
          new document.
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
          Officer ID document (e.g. passport, driver’s licence)
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          {uploading
            ? "Uploading…"
            : officerDocPath
              ? "Replace document"
              : "Upload officer ID"}
        </button>
        {officerDocPath && (
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Document uploaded.
          </p>
        )}
      </div>

      <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          {VERIFICATION_DISCLAIMER}
        </p>
        <label className="mt-3 flex items-center gap-2">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800"
            {...register("accept_disclaimer")}
          />
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            I accept the verification disclaimer
          </span>
        </label>
        {errors.accept_disclaimer && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.accept_disclaimer.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !officerDocPath}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {isSubmitting ? "Submitting…" : "Submit verification"}
      </button>
    </form>
  );
}
