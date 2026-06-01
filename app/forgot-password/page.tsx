"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (resetError) {
      setError(resetError.message);
    } else {
      setSent(true);
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

        {sent ? (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "var(--color-green-light)",
                border: "1px solid var(--color-green-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                fontSize: 24,
              }}
            >
              ✓
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: "var(--color-ink)",
                marginBottom: 8,
              }}
            >
              Check your email
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--color-ink-muted)",
                lineHeight: 1.7,
                marginBottom: 24,
              }}
            >
              We sent a password reset link to <strong>{email}</strong>. Check your inbox and
              follow the link.
            </div>
            <Link
              href="/login"
              style={{
                fontSize: 13,
                color: "var(--color-gold)",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              ← Back to login
            </Link>
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
                Reset your password
              </div>
              <div style={{ fontSize: 13, color: "var(--color-ink-muted)", lineHeight: 1.6 }}>
                Enter your email and we&apos;ll send you a link to reset your password.
              </div>
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
                Email address
              </label>
              <input
                type="email"
                className="input-refined"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
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
              onClick={handleSubmit}
              disabled={loading || !email.trim()}
              style={{
                width: "100%",
                padding: "12px 0",
                borderRadius: 8,
                background: email.trim() ? "var(--color-gold)" : "#F0EEE8",
                color: email.trim() ? "white" : "var(--color-ink-hint)",
                fontSize: 14,
                fontWeight: 600,
                border: "none",
                cursor: email.trim() ? "pointer" : "not-allowed",
                marginBottom: 16,
              }}
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>

            <div style={{ textAlign: "center", fontSize: 13, color: "var(--color-ink-muted)" }}>
              <Link
                href="/login"
                style={{ color: "var(--color-gold)", fontWeight: 500, textDecoration: "none" }}
              >
                ← Back to login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
