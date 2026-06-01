"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const router = useRouter();

  const handleReset = async () => {
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
    } else {
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-page)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 16,
          border: "0.5px solid var(--color-border)",
          padding: "40px",
          width: "100%",
          maxWidth: 400,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img
            src="/logo.svg"
            alt="Rosterly"
            style={{
              height: 40,
              filter:
                "drop-shadow(0px 2px 4px rgba(0,0,0,0.25)) drop-shadow(0px 0px 12px rgba(200,151,58,0.15))",
            }}
          />
        </div>

        {done ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>✓</div>
            <div
              style={{ fontSize: 16, fontWeight: 600, color: "var(--color-ink)", marginBottom: 6 }}
            >
              Password updated
            </div>
            <div style={{ fontSize: 13, color: "var(--color-ink-muted)" }}>
              Redirecting you to login...
            </div>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: "var(--color-ink)",
                  marginBottom: 6,
                }}
              >
                Set new password
              </div>
              <div style={{ fontSize: 13, color: "var(--color-ink-muted)" }}>
                Choose a strong password for your account.
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--color-ink)",
                  marginBottom: 6,
                }}
              >
                New password
              </label>
              <input
                type="password"
                className="input-refined"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--color-ink)",
                  marginBottom: 6,
                }}
              >
                Confirm password
              </label>
              <input
                type="password"
                className="input-refined"
                placeholder="Repeat password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleReset()}
                style={{ width: "100%" }}
              />
            </div>

            {error && (
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  marginBottom: 14,
                  background: "var(--color-danger-light)",
                  border: "0.5px solid rgba(220,38,38,0.2)",
                  fontSize: 12,
                  color: "var(--color-danger)",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleReset}
              disabled={loading || !password || !confirm}
              style={{
                width: "100%",
                padding: "12px 0",
                borderRadius: 8,
                background: password && confirm ? "var(--color-gold)" : "#F0EEE8",
                color: password && confirm ? "white" : "var(--color-ink-hint)",
                fontSize: 14,
                fontWeight: 600,
                border: "none",
                cursor: password && confirm ? "pointer" : "not-allowed",
              }}
            >
              {loading ? "Updating..." : "Update password"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
