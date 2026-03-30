import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardPathForRole } from "@/lib/dashboard";
import { AuthBlobBackground } from "@/components/auth/AuthBlobBackground";
import { ButtonLink } from "@/components/ui/Button";

export default async function Home() {
  const current = await getCurrentUser();
  if (current?.user && current?.profile) {
    redirect(getDashboardPathForRole(current.profile.role));
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F3F4F6]">
      <AuthBlobBackground />
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
        <div className="relative z-10 w-full max-w-md space-y-8 rounded-[4px] border-[3px] border-black bg-white p-10 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
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
        </div>
      </main>
    </div>
  );
}
