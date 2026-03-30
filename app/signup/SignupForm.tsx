"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye,
  EyeOff,
  UserRound,
  Briefcase,
  ChevronRight,
  ArrowLeftRight,
} from "lucide-react";
import { signUpWithAutoConfirm } from "@/app/signup/actions";
import { Button } from "@/components/ui/Button";
import { CardTitle, CardDescription } from "@/components/ui/Card";

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
    role: z.enum(["participant", "merchant"]),
    businessName: z.union([z.literal(""), z.string().min(2)]).optional(),
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
  })
  .superRefine((data, ctx) => {
    if (data.role !== "merchant") return;
    const t = (data.businessName ?? "").trim();
    if (t.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Business name must be at least 2 characters",
        path: ["businessName"],
      });
    }
  });

type FormData = z.infer<typeof schema>;

const AUTH_ERROR_MESSAGE =
  "Something went wrong. Please try again or use a different email.";

const inputClass =
  "w-full rounded-[4px] border-2 border-black bg-white px-4 py-2 text-sm text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:ring-2 focus:ring-[#1D4ED8]";

const fieldLabelClass = "mb-1 block text-xs text-gray-600";

const roleCardClass =
  "flex w-full cursor-pointer items-center gap-3 rounded-[4px] border-2 border-black bg-white px-4 py-[14px] text-left transition-colors hover:bg-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:ring-offset-2";

export function SignupForm() {
  const router = useRouter();
  /** Step 1: null. Step 2: chosen role. */
  const [role, setRole] = useState<"participant" | "merchant" | null>(null);
  const [genericError, setGenericError] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      role: "participant",
      businessName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const formRole = watch("role");
  const passwordValue = watch("password") ?? "";
  const requirements = {
    length: passwordValue.length >= PASSWORD_MIN_LENGTH,
    uppercase: hasUppercase(passwordValue),
    lowercase: hasLowercase(passwordValue),
    number: hasNumber(passwordValue),
  };

  function goBack() {
    setRole(null);
    setGenericError(null);
    reset({
      role: "participant",
      businessName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  }

  function selectParticipant() {
    setRole("participant");
    setValue("role", "participant", { shouldValidate: false });
    setValue("businessName", "");
  }

  function selectMerchant() {
    setRole("merchant");
    setValue("role", "merchant", { shouldValidate: false });
  }

  async function onSubmit(data: FormData) {
    setGenericError(null);
    try {
      if (data.role === "participant") {
        await signUpWithAutoConfirm(data.email, data.password);
      } else {
        // TODO: Replace with signUpMerchant once migration is applied
        await signUpWithAutoConfirm(data.email, data.password, {
          requested_role: "merchant",
          business_name: (data.businessName ?? "").trim(),
        });
      }
      router.push("/login?message=registered");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : AUTH_ERROR_MESSAGE;
      setGenericError(message);
    }
  }

  if (role === null) {
    return (
      <div className="flex flex-col gap-2">
        <button type="button" onClick={selectParticipant} className={roleCardClass}>
          <UserRound className="h-6 w-6 shrink-0 text-black" aria-hidden />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-black">I&apos;m looking for gigs</div>
            <div className="mt-0.5 text-xs text-gray-600">Browse and apply for opportunities</div>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-black" aria-hidden />
        </button>
        <button type="button" onClick={selectMerchant} className={roleCardClass}>
          <Briefcase className="h-6 w-6 shrink-0 text-black" aria-hidden />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-black">
              I&apos;m hiring
              <span className="rounded-[4px] border-[1.5px] border-black bg-transparent px-[6px] py-[1px] text-[10px] font-bold uppercase leading-none text-black">
                MERCHANT
              </span>
            </div>
            <div className="mt-0.5 text-xs text-gray-600">Post gigs and manage your team</div>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-black" aria-hidden />
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={goBack}
        className="mb-4 flex w-full items-center justify-between gap-2 rounded-[4px] bg-black px-[10px] py-1 text-left text-xs font-medium text-white hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:ring-offset-2"
      >
        <span>
          {formRole === "merchant" ? "Hiring · Merchant" : "Looking for gigs"}
        </span>
        <ArrowLeftRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
      </button>

      <div className="text-center">
        <CardTitle className="text-2xl">
          {formRole === "merchant" ? "Create a merchant account" : "Create an account"}
        </CardTitle>
        <CardDescription className="mt-1">
          {formRole === "merchant"
            ? "Sign up with your business email."
            : "Sign up with your email and a password."}
        </CardDescription>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
        <input type="hidden" {...register("role")} />

        {genericError && (
          <div
            className="rounded-[4px] border-[3px] border-black bg-[#F97316] px-4 py-3 text-sm font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
            role="alert"
          >
            {genericError}
          </div>
        )}

        {formRole === "merchant" && (
          <div>
            <label htmlFor="signup-business-name" className={fieldLabelClass}>
              Business name
            </label>
            <input
              id="signup-business-name"
              type="text"
              autoComplete="organization"
              className={inputClass}
              {...register("businessName")}
            />
            {errors.businessName && (
              <p className="mt-2 text-sm font-medium text-black">{errors.businessName.message}</p>
            )}
          </div>
        )}

        <div>
          <label htmlFor="signup-email" className={fieldLabelClass}>
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
            <p className="mt-2 text-sm font-medium text-black">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="signup-password" className={fieldLabelClass}>
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
                {[requirements.length, requirements.uppercase, requirements.lowercase, requirements.number].map(
                  (met, i) => (
                    <span
                      key={i}
                      className={`h-1 min-w-[20px] flex-1 rounded-sm transition-colors ${met ? "bg-green-600" : "bg-black/20"}`}
                    />
                  )
                )}
              </div>
              <span className="text-xs text-black/70">
                {[requirements.length, requirements.uppercase, requirements.lowercase, requirements.number].filter(
                  Boolean
                ).length === 4
                  ? "Strong"
                  : [requirements.length, requirements.uppercase, requirements.lowercase, requirements.number].filter(
                        Boolean
                      ).length >= 2
                    ? "Fair"
                    : "Weak"}
              </span>
            </div>
          )}
          {errors.password && (
            <p className="mt-2 text-sm font-medium text-black">{errors.password.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="signup-confirm" className={fieldLabelClass}>
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
            <p className="mt-2 text-sm font-medium text-black">{errors.confirmPassword.message}</p>
          )}
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          variant="primary"
          size="md"
          className="w-full !h-auto min-h-0 py-2.5 text-sm"
        >
          {isSubmitting
            ? "Creating account…"
            : formRole === "merchant"
              ? "Create merchant account"
              : "Sign up"}
        </Button>
      </form>
    </>
  );
}
