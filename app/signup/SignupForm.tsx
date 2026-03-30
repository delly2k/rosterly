"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { signUpWithAutoConfirm } from "@/app/signup/actions";
import { Button } from "@/components/ui/Button";

const PASSWORD_MIN_LENGTH = 8;

function hasUppercase(s: string) {
  return /[A-Z]/.test(s);
}
function hasLowercase(s: string) {
  return /[a-z]/.test(s);
}
function hasNumber(s: string) {
  return /\d/.test(s);
}

const schema = z
  .object({
    email: z.string().email("Invalid email"),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
      .refine(hasUppercase, "Password must include at least one uppercase letter")
      .refine(hasLowercase, "Password must include at least one lowercase letter")
      .refine(hasNumber, "Password must include at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

const AUTH_ERROR_MESSAGE =
  "Something went wrong. Please try again or use a different email.";

const inputClass =
  "w-full rounded-[4px] border-[3px] border-black bg-white px-4 py-3 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:ring-2 focus:ring-[#1D4ED8] min-h-[48px]";

export function SignupForm() {
  const router = useRouter();
  const [genericError, setGenericError] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const passwordValue = watch("password") ?? "";
  const requirements = {
    length: passwordValue.length >= PASSWORD_MIN_LENGTH,
    uppercase: hasUppercase(passwordValue),
    lowercase: hasLowercase(passwordValue),
    number: hasNumber(passwordValue),
  };

  async function onSubmit(data: FormData) {
    setGenericError(null);
    try {
      await signUpWithAutoConfirm(data.email, data.password);
      // Profile is created by DB trigger on auth.users insert (role=participant, status=pending).
      router.push("/login?message=registered");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : AUTH_ERROR_MESSAGE;
      setGenericError(message);
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
          htmlFor="signup-email"
          className="mb-2 block text-sm font-bold text-black"
        >
          Email
        </label>
        <input
          id="signup-email"
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
          htmlFor="signup-password"
          className="mb-2 block text-sm font-bold text-black"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            className={`${inputClass} pr-12`}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-black/60 hover:text-black focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:ring-offset-2"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" aria-hidden />
            ) : (
              <Eye className="h-5 w-5" aria-hidden />
            )}
          </button>
        </div>
        {passwordValue.length > 0 && (
          <div className="mt-2 flex items-center gap-2" aria-live="polite" aria-label="Password strength">
            <div className="flex gap-0.5">
              {[requirements.length, requirements.uppercase, requirements.lowercase, requirements.number].map((met, i) => (
                <span
                  key={i}
                  className={`h-1 flex-1 min-w-[20px] rounded-sm transition-colors ${met ? "bg-green-600" : "bg-black/20"}`}
                />
              ))}
            </div>
            <span className="text-xs text-black/70">
              {[requirements.length, requirements.uppercase, requirements.lowercase, requirements.number].filter(Boolean).length === 4
                ? "Strong"
                : [requirements.length, requirements.uppercase, requirements.lowercase, requirements.number].filter(Boolean).length >= 2
                  ? "Fair"
                  : "Weak"}
            </span>
          </div>
        )}
        {errors.password && (
          <p className="mt-2 text-sm font-medium text-black">
            {errors.password.message}
          </p>
        )}
      </div>
      <div>
        <label
          htmlFor="signup-confirm"
          className="mb-2 block text-sm font-bold text-black"
        >
          Confirm password
        </label>
        <div className="relative">
          <input
            id="signup-confirm"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            className={`${inputClass} pr-12`}
            {...register("confirmPassword")}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-black/60 hover:text-black focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:ring-offset-2"
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5" aria-hidden />
            ) : (
              <Eye className="h-5 w-5" aria-hidden />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-2 text-sm font-medium text-black">
            {errors.confirmPassword.message}
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
        {isSubmitting ? "Creating account…" : "Sign up"}
      </Button>
    </form>
  );
}
