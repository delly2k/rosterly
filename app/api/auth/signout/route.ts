import { createClient } from "@/lib/auth";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const url = new URL("/login", request.nextUrl.origin);
  return NextResponse.redirect(url, { status: 302 });
}
