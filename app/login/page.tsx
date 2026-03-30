import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "./LoginForm";
import { AuthBlobBackground } from "@/components/auth/AuthBlobBackground";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Log in | Rosterly",
  description: "Log in to your account",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; message?: string }>;
}) {
  const { redirectTo, message } = await searchParams;
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F3F4F6]">
      <AuthBlobBackground />

      {/* Foreground: centered logo + form, high z-index */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex justify-center">
            <Image
              src="/logo.png"
              alt="Rosterly"
              width={128}
              height={128}
              className="h-24 w-24 object-contain sm:h-28 sm:w-28 md:h-32 md:w-32"
              priority
            />
          </div>
          <Card className="p-8">
            <div className="text-center">
              <CardTitle className="text-2xl">Log in</CardTitle>
              <CardDescription className="mt-1">
                Use your email and password to sign in.
              </CardDescription>
            </div>
            {message === "registered" && (
              <div
                className="mt-6 rounded-[4px] border-[3px] border-black bg-[#FDE047] px-4 py-3 text-sm font-medium text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                role="status"
              >
                Account created. You can sign in below.
              </div>
            )}
            <LoginForm redirectTo={redirectTo} />
          </Card>
          <p className="text-center text-sm font-medium text-black/90">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-bold text-black underline underline-offset-2 hover:no-underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
