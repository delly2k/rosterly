import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "./SignupForm";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Sign up | Rosterly",
  description: "Create an account",
};

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F3F4F6] px-4">
      <div className="w-full max-w-sm space-y-6">
        <Card className="p-8">
          <div className="text-center">
            <CardTitle className="text-2xl">Create an account</CardTitle>
            <CardDescription className="mt-1">
              Sign up with your email and a password.
            </CardDescription>
          </div>
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
  );
}
