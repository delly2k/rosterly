"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signInWithPassword } from "@/app/login/actions";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

const ROLES = ["Participant", "Merchant"] as const;
type VisualRole = (typeof ROLES)[number];

const inputClass = "input-refined w-full text-sm text-[var(--color-ink)]";
const passwordInputClass = `${inputClass} !pr-11`;

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [genericError, setGenericError] = useState<string | null>(null);
  const [visualRole, setVisualRole] = useState<VisualRole>("Participant");
  const [showPassword, setShowPassword] = useState(false);

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
    const result = await signInWithPassword(
      data.email,
      data.password,
      redirectTo
    );
    if (result && !result.ok) {
      setGenericError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {genericError && (
        <div className="login-auth-banner login-auth-banner--error" role="alert">
          {genericError}
        </div>
      )}

      <div className="login-role-toggle" role="group" aria-label="Account type">
        {ROLES.map((role) => (
          <button
            key={role}
            type="button"
            className={`login-role-btn${visualRole === role ? " is-active" : ""}`}
            onClick={() => setVisualRole(role)}
            aria-pressed={visualRole === role}
          >
            {role}
          </button>
        ))}
      </div>

      <div className="login-auth-field">
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="Email address"
          className={inputClass}
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
            id="login-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
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
        {errors.password && (
          <p className="login-auth-field-error">{errors.password.message}</p>
        )}
      </div>

      <Link href="/forgot-password" className="login-auth-forgot">
        Forgot password?
      </Link>

      <button type="submit" className="login-auth-submit" disabled={isSubmitting}>
        {isSubmitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
