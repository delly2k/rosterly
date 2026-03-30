import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Account restricted | Rosterly",
  description: "Your account access is restricted",
};

export default function BlockedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F3F4F6] px-4">
      <Card className="w-full max-w-md space-y-4 p-8 text-center">
        <CardTitle className="text-xl">Account restricted</CardTitle>
        <CardDescription>
          Your account does not have access at this time. If you believe this is
          an error, please contact support.
        </CardDescription>
        <div className="pt-4">
          <Link
            href="/login"
            className="inline-block min-h-[48px] rounded-[4px] border-[3px] border-black bg-[#1D4ED8] px-4 py-2.5 text-sm font-bold text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-75 ease-out will-change-transform brutal-press md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-[#1e40af]"
          >
            Return to sign in
          </Link>
        </div>
      </Card>
    </div>
  );
}
