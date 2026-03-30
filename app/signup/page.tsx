import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "./SignupForm";
import { AuthBlobBackground } from "@/components/auth/AuthBlobBackground";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Sign up | Rosterly",
  description: "Create an account",
};

export default function SignupPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F3F4F6]">
      <AuthBlobBackground />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6">
          <Card className="p-8">
            <SignupForm />
          </Card>
          <p className="text-center text-sm text-black/80">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-black underline underline-offset-2 hover:no-underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
