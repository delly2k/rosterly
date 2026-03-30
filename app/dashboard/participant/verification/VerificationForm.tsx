"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabaseClient";
import {
  verificationDocPath,
  VERIFICATION_DOCS_BUCKET,
} from "@/lib/storage";
import { submitVerification } from "@/app/dashboard/participant/actions";

const schema = z.object({
  accept_disclaimer: z
    .boolean()
    .refine((v) => v === true, {
      message: "You must accept the verification disclaimer.",
    }),
});

type FormData = z.infer<typeof schema>;

const VERIFICATION_DISCLAIMER =
  "I confirm that the ID and selfie I am uploading are accurate and belong to me. I understand that false information may result in account suspension.";

type VerificationFormProps = { latestStatus?: string };

export function VerificationForm({ latestStatus }: VerificationFormProps) {
  const router = useRouter();
  const [idDocPath, setIdDocPath] = useState<string | null>(null);
  const [selfiePath, setSelfiePath] = useState<string | null>(null);
  const [uploading, setUploading] = useState<"id" | "selfie" | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const idInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { accept_disclaimer: false },
  });

  async function uploadFile(
    file: File,
    type: "id_doc" | "selfie"
  ): Promise<string | null> {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${Date.now()}.${ext}`;
    const path = verificationDocPath(user.id, type, filename);

    const { error } = await supabase.storage
      .from(VERIFICATION_DOCS_BUCKET)
      .upload(path, file, { upsert: true });

    if (error) return null;
    return path;
  }

  async function handleIdChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading("id");
    const path = await uploadFile(file, "id_doc");
    setIdDocPath(path);
    setUploading(null);
  }

  async function handleSelfieChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading("selfie");
    const path = await uploadFile(file, "selfie");
    setSelfiePath(path);
    setUploading(null);
  }

  async function onSubmit() {
    setSubmitError(null);
    if (!idDocPath || !selfiePath) {
      setSubmitError("Please upload both ID document and selfie.");
      return;
    }
    try {
      await submitVerification(idDocPath, selfiePath);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not submit verification. Please try again.";
      setSubmitError(message);
    }
  }

  const rejected = latestStatus === "rejected";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {rejected && (
        <div className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
          Your previous verification was rejected. You may submit again with new
          documents.
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
          ID document (e.g. passport, driver’s licence)
        </label>
        <input
          ref={idInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="hidden"
          onChange={handleIdChange}
          disabled={!!uploading}
        />
        <button
          type="button"
          onClick={() => idInputRef.current?.click()}
          disabled={!!uploading}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          {uploading === "id" ? "Uploading…" : idDocPath ? "Replace ID document" : "Upload ID document"}
        </button>
        {idDocPath && (
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            ID document uploaded.
          </p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Selfie
        </label>
        <input
          ref={selfieInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleSelfieChange}
          disabled={!!uploading}
        />
        <button
          type="button"
          onClick={() => selfieInputRef.current?.click()}
          disabled={!!uploading}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          {uploading === "selfie" ? "Uploading…" : selfiePath ? "Replace selfie" : "Upload selfie"}
        </button>
        {selfiePath && (
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Selfie uploaded.
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

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting || !idDocPath || !selfiePath}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {isSubmitting ? "Submitting…" : "Submit verification"}
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
