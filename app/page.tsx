import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardPathForRole } from "@/lib/dashboard";
import { ButtonLink } from "@/components/ui/Button";

export default async function Home() {
  const current = await getCurrentUser();
  if (current?.user && current?.profile) {
    redirect(getDashboardPathForRole(current.profile.role));
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F3F4F6] px-4">
      <main className="w-full max-w-md space-y-8 text-center">
        <div className="flex justify-center">
          <Image
            src="/logo.png"
            alt="Rosterly"
            width={80}
            height={80}
            className="h-20 w-20 object-contain"
            priority
          />
        </div>
        <p className="text-black/80">
          Sign in or create an account to continue.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <ButtonLink href="/login" variant="primary" size="lg">
            Log in
          </ButtonLink>
          <ButtonLink href="/signup" variant="secondary" size="lg">
            Sign up
          </ButtonLink>
        </div>
      </main>
    </div>
  );
}
