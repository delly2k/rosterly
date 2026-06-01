"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { signUpMerchant, signUpParticipant } from "@/app/signup/actions";
import { signInWithPassword } from "@/app/login/actions";
import { getDashboardPathForRole } from "@/lib/dashboard";

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

const ROLE_LABELS = [
  { label: "Participant", value: "participant" as const },
  { label: "Merchant", value: "merchant" as const },
];

const inputClass = "input-refined w-full text-sm text-[var(--color-ink)]";
const passwordInputClass = `${inputClass} !pr-11`;

export function SignupForm() {
  const [genericError, setGenericError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
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
  const metCount = [
    requirements.length,
    requirements.uppercase,
    requirements.lowercase,
    requirements.number,
  ].filter(Boolean).length;

  function selectRole(role: "participant" | "merchant") {
    setValue("role", role, { shouldValidate: false });
    if (role === "participant") {
      setValue("businessName", "");
    }
  }

  async function onSubmit(data: FormData) {
    setGenericError(null);
    try {
      if (data.role === "participant") {
        await signUpParticipant(data.email, data.password);
      } else {
        await signUpMerchant(
          data.email,
          data.password,
          (data.businessName ?? "").trim()
        );
      }

      const signInResult = await signInWithPassword(
        data.email,
        data.password,
        getDashboardPathForRole(data.role)
      );
      if (signInResult && !signInResult.ok) {
        throw new Error(signInResult.error);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : AUTH_ERROR_MESSAGE;
      setGenericError(message);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input type="hidden" {...register("role")} />

      {genericError && (
        <div className="login-auth-banner login-auth-banner--error" role="alert">
          {genericError}
        </div>
      )}

      <div className="login-role-toggle" role="group" aria-label="Account type">
        {ROLE_LABELS.map(({ label, value }) => (
          <button
            key={value}
            type="button"
            className={`login-role-btn${formRole === value ? " is-active" : ""}`}
            onClick={() => selectRole(value)}
            aria-pressed={formRole === value}
          >
            {label}
          </button>
        ))}
      </div>

      {formRole === "merchant" && (
        <div className="login-auth-field">
          <input
            id="signup-business-name"
            type="text"
            autoComplete="organization"
            placeholder="Business name"
            className={inputClass}
            aria-invalid={!!errors.businessName}
            {...register("businessName")}
          />
          {errors.businessName && (
            <p className="login-auth-field-error">{errors.businessName.message}</p>
          )}
        </div>
      )}

      <div className="login-auth-field">
        <input
          id="signup-email"
          type="email"
          autoComplete="email"
          placeholder="Email address"
          className="login-auth-input"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        {errors.email && (
          <p className="login-auth-field-error">{errors.email.message}</p>
        )}
      </div>

      <div className="login-auth-field">
        <div className="login-auth-password-wrap">
          <input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Password"
            className={passwordInputClass}
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          <button
            type="button"
            className="login-auth-password-toggle"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {passwordValue.length > 0 && (
          <div className="signup-password-strength" aria-live="polite" aria-label="Password strength">
            <div className="signup-password-bars">
              {[requirements.length, requirements.uppercase, requirements.lowercase, requirements.number].map(
                (met, i) => (
                  <span
                    key={i}
                    className={`signup-password-bar${met ? " is-met" : ""}`}
                  />
                )
              )}
            </div>
            <span className="signup-password-label">
              {metCount === 4 ? "Strong" : metCount >= 2 ? "Fair" : "Weak"}
            </span>
          </div>
        )}
        {errors.password && (
          <p className="login-auth-field-error">{errors.password.message}</p>
        )}
      </div>

      <div className="login-auth-field">
        <div className="login-auth-password-wrap">
          <input
            id="signup-confirm"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Confirm password"
            className={passwordInputClass}
            aria-invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
          <button
            type="button"
            className="login-auth-password-toggle"
            onClick={() => setShowConfirmPassword((v) => !v)}
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="login-auth-field-error">{errors.confirmPassword.message}</p>
        )}
      </div>

      <button type="submit" className="login-auth-submit" disabled={isSubmitting}>
        {isSubmitting
          ? "Creating account…"
          : formRole === "merchant"
            ? "Create merchant account"
            : "Create account"}
      </button>
    </form>
  );
}
