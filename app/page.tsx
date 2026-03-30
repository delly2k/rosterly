import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardPathForRole } from "@/lib/dashboard";
import { AuthBlobBackground } from "@/components/auth/AuthBlobBackground";

export default async function Home() {
  const current = await getCurrentUser();
  if (current?.user && current?.profile) {
    redirect(getDashboardPathForRole(current.profile.role));
  }

  const btnBase =
    "flex flex-1 items-center justify-center rounded-[4px] border-2 border-black py-[11px] text-center text-sm font-semibold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F3F4F6]">
      <AuthBlobBackground />
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
        <div className="relative z-10 w-full max-w-md rounded-[4px] border-[3px] border-black bg-white px-8 pb-[28px] pt-8 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[4px] border-[3px] border-black">
            <Image
              src="/logo.png"
              alt="Rosterly"
              width={48}
              height={48}
              className="h-10 w-10 object-contain"
              priority
            />
          </div>

          <p className="mb-1.5 text-[22px] font-bold leading-tight text-black">
            Welcome to Rosterly
          </p>
          <p className="mb-2 text-[13px] leading-[1.5] text-[#666]">
            The platform connecting talent with opportunities.
          </p>

          <div className="mb-6 flex flex-wrap items-center justify-center gap-1.5">
            <span className="rounded-full border-[1.5px] border-black bg-[#F5C842] px-[10px] py-[3px] text-[11px] font-medium text-black">
              Find gigs
            </span>
            <span className="rounded-full border-[1.5px] border-black bg-[#E84F8C] px-[10px] py-[3px] text-[11px] font-medium text-white">
              Hire talent
            </span>
            <span className="rounded-full border-[1.5px] border-black bg-[#2BBCCA] px-[10px] py-[3px] text-[11px] font-medium text-white">
              Get booked
            </span>
          </div>

          <hr className="mb-5 mt-0 border-0 border-t-2 border-black" />

          <div className="flex gap-[10px]">
            <Link href="/login" className={`${btnBase} bg-[#4A63D3] text-white`}>
              Log in
            </Link>
            <Link href="/signup" className={`${btnBase} bg-white text-black`}>
              Sign up
            </Link>
          </div>

          <p className="mt-4 text-center text-[11px] text-[#aaa]">
            No credit card required · Free to join
          </p>
        </div>
      </main>
    </div>
  );
}
