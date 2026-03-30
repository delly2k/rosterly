"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/Button";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

const AUTH_ERROR_MESSAGE = "Invalid email or password. Please try again.";

const inputClass =
  "w-full rounded-[4px] border-[3px] border-black bg-white px-4 py-3 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:ring-2 focus:ring-[#1D4ED8] min-h-[48px]";

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter();
  const [genericError, setGenericError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: FormData) {
    setGenericError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) {
        setGenericError(AUTH_ERROR_MESSAGE);
        return;
      }
      const redirect = redirectTo ?? "/dashboard";
      router.push(redirect);
      router.refresh();
    } catch {
      setGenericError(AUTH_ERROR_MESSAGE);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
      {genericError && (
        <div
          className="rounded-[4px] border-[3px] border-black bg-[#F97316] px-4 py-3 text-sm font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
          role="alert"
        >
          {genericError}
        </div>
      )}
      <div>
        <label
          htmlFor="login-email"
          className="mb-2 block text-sm font-bold text-black"
        >
          Email
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          className={inputClass}
          {...register("email")}
        />
        {errors.email && (
          <p className="mt-2 text-sm font-medium text-black">
            {errors.email.message}
          </p>
        )}
      </div>
      <div>
        <label
          htmlFor="login-password"
          className="mb-2 block text-sm font-bold text-black"
        >
          Password
        </label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          className={inputClass}
          {...register("password")}
        />
        {errors.password && (
          <p className="mt-2 text-sm font-medium text-black">
            {errors.password.message}
          </p>
        )}
      </div>
      <Button
        type="submit"
        disabled={isSubmitting}
        variant="primary"
        size="md"
        className="w-full"
      >
        {isSubmitting ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
