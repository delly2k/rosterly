"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabaseClient";
import { SaveBar } from "@/components/settings/SaveBar";

const PASSWORD_MIN_LENGTH = 8;

const schema = z
  .object({
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

const inputClass =
  "input-refined w-full text-sm text-[var(--color-ink)]";

const labelClass = "mb-1 block text-sm font-medium text-[var(--color-ink-muted)]";

export function PasswordChangeForm() {
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit(data: FormData) {
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: data.password });
    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }
    reset();
    setMessage({ type: "ok", text: "Password updated successfully." });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="new-password" className={labelClass}>
          New password
        </label>
        <input
          id="new-password"
          type="password"
          autoComplete="new-password"
          className={inputClass}
          {...register("password")}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-[var(--color-danger)]">
            {errors.password.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="confirm-password" className={labelClass}>
          Confirm password
        </label>
        <input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          className={inputClass}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-[var(--color-danger)]">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <SaveBar
        onSave={() => {
          void handleSubmit(onSubmit)();
        }}
        saving={isSubmitting}
        message={message}
      />
    </form>
  );
}
