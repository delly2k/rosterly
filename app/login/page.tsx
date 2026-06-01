import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Log in | Rosterly",
  description: "Log in to your account",
};

const BRAND_IMAGE =
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; message?: string }>;
}) {
  const { redirectTo, message } = await searchParams;

  return (
    <div className="login-split">
      <div className="login-split-left">
        <img
          src={BRAND_IMAGE}
          alt=""
          className="login-split-photo"
          aria-hidden
        />
        <div className="login-split-overlay" aria-hidden />
        <div className="login-split-content">
          <div>
            <p className="login-split-eyebrow">Jamaica&apos;s professional promo platform</p>
            <h1 className="login-split-headline">
              Where top brands find the best talent
            </h1>
            <p className="login-split-tagline">
              Verified professionals. Certified talent. Real opportunities across all 14
              parishes.
            </p>
            <div className="login-split-stats">
              {[
                { number: "500+", label: "Verified talent" },
                { number: "200+", label: "Brand activations" },
                { number: "14", label: "Parishes covered" },
              ].map(({ number, label }) => (
                <div key={label}>
                  <div className="login-split-stat-value">{number}</div>
                  <div className="login-split-stat-label">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="login-split-right">
        <div className="login-auth-shell">
          <div className="login-auth-logo">
            <img
              src="/logo.svg"
              alt="Rosterly"
              style={{
                height: 52,
                width: "auto",
                filter:
                  "drop-shadow(0px 2px 4px rgba(0,0,0,0.25)) drop-shadow(0px 0px 12px rgba(200,151,58,0.15))",
              }}
            />
          </div>

          <div className="login-auth-heading">
            <h2 className="login-auth-title">Welcome back!</h2>
            <p className="login-auth-subtitle">
              Sign in to manage your gigs, bookings, and profile — whether you&apos;re on the
              roster or running the activation.
            </p>
          </div>

          {message === "registered" && (
            <div className="login-auth-banner login-auth-banner--success" role="status">
              Account created. You can sign in below.
            </div>
          )}

          <LoginForm redirectTo={redirectTo} />

          <p className="login-auth-footer">
            Don&apos;t have an account? <Link href="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
