import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = {
  title: "Sign up | Rosterly",
  description: "Create an account",
};

const BRAND_IMAGE =
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80";

export default function SignupPage() {
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
            <img src="/logo.svg" alt="Rosterly" />
          </div>

          <div className="login-auth-heading">
            <h2 className="login-auth-title">Create your account</h2>
            <p className="login-auth-subtitle">
              Join as talent or post gigs as a merchant — get verified and start booking
              across Jamaica.
            </p>
          </div>

          <SignupForm />

          <p className="login-auth-footer">
            Already have an account? <Link href="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
