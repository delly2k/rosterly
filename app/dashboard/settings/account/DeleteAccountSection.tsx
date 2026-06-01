"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteAccount } from "@/app/dashboard/settings/actions";

const inputClass =
  "input-refined w-full text-sm text-[var(--color-ink)]";

const labelClass = "mb-1 block text-sm font-medium text-[var(--color-ink-muted)]";

export function DeleteAccountSection({ email }: { email: string }) {
  const router = useRouter();
  const [step, setStep] = useState<"idle" | "confirm">("idle");
  const [emailConfirm, setEmailConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailMatches =
    emailConfirm.trim().toLowerCase() === email.trim().toLowerCase();

  async function handleDelete() {
    if (!emailMatches) return;
    setDeleting(true);
    setError(null);
    try {
      const result = await deleteAccount();
      if (!result.ok) {
        setError(result.error ?? "Could not delete account.");
        setDeleting(false);
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      {step === "idle" ? (
        <button
          type="button"
          onClick={() => setStep("confirm")}
          className="btn-settings-danger"
        >
          Delete my account
        </button>
      ) : (
        <div className="rounded-xl border border-[var(--color-danger)] bg-[var(--color-danger-light)] p-4">
          <p className="text-sm font-medium text-[var(--color-ink)]">
            This permanently deletes your account and sign-in access. This cannot be undone.
          </p>
          <div className="mt-4">
            <label htmlFor="delete-email-confirm" className={labelClass}>
              Type your email to confirm: <span className="font-normal">{email}</span>
            </label>
            <input
              id="delete-email-confirm"
              type="email"
              autoComplete="off"
              value={emailConfirm}
              onChange={(e) => setEmailConfirm(e.target.value)}
              className={inputClass}
              placeholder={email}
            />
          </div>
          {error && (
            <p className="mt-3 text-sm text-[var(--color-danger)]" role="alert">
              {error}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={!emailMatches || deleting}
              onClick={() => void handleDelete()}
              className="btn-settings-danger"
            >
              {deleting ? "Deleting…" : "Confirm delete account"}
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={() => {
                setStep("idle");
                setEmailConfirm("");
                setError(null);
              }}
              className="btn-settings-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
